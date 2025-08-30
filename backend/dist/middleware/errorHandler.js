"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorUtils = exports.rateLimitErrorHandler = exports.validateRequest = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.createError = exports.CustomError = exports.ErrorSeverity = exports.ErrorType = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Error types for better categorization
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION"] = "VALIDATION";
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorType["AUTHORIZATION"] = "AUTHORIZATION";
    ErrorType["NOT_FOUND"] = "NOT_FOUND";
    ErrorType["CONFLICT"] = "CONFLICT";
    ErrorType["DATABASE"] = "DATABASE";
    ErrorType["EXTERNAL"] = "EXTERNAL";
    ErrorType["INTERNAL"] = "INTERNAL";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// Error severity levels
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "LOW";
    ErrorSeverity["MEDIUM"] = "MEDIUM";
    ErrorSeverity["HIGH"] = "HIGH";
    ErrorSeverity["CRITICAL"] = "CRITICAL";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// Create custom error class
class CustomError extends Error {
    constructor(message, type, statusCode, severity = ErrorSeverity.MEDIUM, code, details) {
        super(message);
        this.name = 'CustomError';
        this.type = type;
        this.severity = severity;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}
exports.CustomError = CustomError;
// Error factory functions
exports.createError = {
    validation: (message, details, code) => new CustomError(message, ErrorType.VALIDATION, 400, ErrorSeverity.LOW, code, details),
    authentication: (message = 'Authentication required', code) => new CustomError(message, ErrorType.AUTHENTICATION, 401, ErrorSeverity.HIGH, code),
    authorization: (message = 'Access denied', code) => new CustomError(message, ErrorType.AUTHORIZATION, 403, ErrorSeverity.HIGH, code),
    notFound: (message = 'Resource not found', code) => new CustomError(message, ErrorType.NOT_FOUND, 404, ErrorSeverity.MEDIUM, code),
    conflict: (message, details, code) => new CustomError(message, ErrorType.CONFLICT, 409, ErrorSeverity.MEDIUM, code, details),
    database: (message, details, code) => new CustomError(message, ErrorType.DATABASE, 500, ErrorSeverity.HIGH, code, details),
    external: (message, details, code) => new CustomError(message, ErrorType.EXTERNAL, 502, ErrorSeverity.MEDIUM, code, details),
    internal: (message = 'Internal server error', details, code) => new CustomError(message, ErrorType.INTERNAL, 500, ErrorSeverity.CRITICAL, code, details)
};
// Error logging utility
const logError = (error, req) => {
    const logData = {
        timestamp: error.timestamp,
        type: error.type,
        severity: error.severity,
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
        details: error.details,
        requestId: error.requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id
    };
    // Log based on severity
    switch (error.severity) {
        case ErrorSeverity.CRITICAL:
            console.error('🚨 CRITICAL ERROR:', logData);
            break;
        case ErrorSeverity.HIGH:
            console.error('❌ HIGH SEVERITY ERROR:', logData);
            break;
        case ErrorSeverity.MEDIUM:
            console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
            break;
        case ErrorSeverity.LOW:
            console.log('ℹ️ LOW SEVERITY ERROR:', logData);
            break;
    }
    // TODO: Send to error tracking service in production
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorTracking(logData)
    // }
};
// Generate request ID for tracking
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
// Main error handling middleware
const errorHandler = (error, req, res, next) => {
    let appError;
    const requestId = generateRequestId();
    // Handle different error types
    if (error instanceof CustomError) {
        appError = error;
    }
    else if (error instanceof zod_1.ZodError) {
        // Handle Zod validation errors
        appError = exports.createError.validation('Validation failed', error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
        })), 'VALIDATION_ERROR');
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma database errors
        switch (error.code) {
            case 'P2002':
                appError = exports.createError.conflict('Duplicate entry found', { field: error.meta?.target }, 'DUPLICATE_ENTRY');
                break;
            case 'P2025':
                appError = exports.createError.notFound('Record not found', 'RECORD_NOT_FOUND');
                break;
            case 'P2003':
                appError = exports.createError.validation('Foreign key constraint failed', { field: error.meta?.field_name }, 'FOREIGN_KEY_ERROR');
                break;
            default:
                appError = exports.createError.database('Database operation failed', { code: error.code, meta: error.meta }, 'DATABASE_ERROR');
        }
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        appError = exports.createError.validation('Invalid data provided', { message: error.message }, 'PRISMA_VALIDATION_ERROR');
    }
    else if (error.name === 'JsonWebTokenError') {
        appError = exports.createError.authentication('Invalid token', 'INVALID_TOKEN');
    }
    else if (error.name === 'TokenExpiredError') {
        appError = exports.createError.authentication('Token expired', 'TOKEN_EXPIRED');
    }
    else {
        // Handle unknown errors
        appError = exports.createError.internal(process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message, process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined, 'UNKNOWN_ERROR');
    }
    // Add request context
    appError.requestId = requestId;
    appError.userAgent = req.get('User-Agent');
    appError.ip = req.ip || req.connection.remoteAddress;
    // Log the error
    logError(appError, req);
    // Prepare error response
    const errorResponse = {
        success: false,
        message: appError.message,
        type: appError.type,
        code: appError.code,
        details: appError.details,
        timestamp: appError.timestamp,
        requestId: appError.requestId
    };
    // Send error response
    res.status(appError.statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Async error wrapper middleware
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// 404 handler for unmatched routes
const notFoundHandler = (req, res) => {
    const error = exports.createError.notFound(`Route ${req.method} ${req.url} not found`, 'ROUTE_NOT_FOUND');
    error.requestId = generateRequestId();
    const errorResponse = {
        success: false,
        message: error.message,
        type: error.type,
        code: error.code,
        timestamp: error.timestamp,
        requestId: error.requestId
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
// Request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            req.body = validatedData.body;
            req.query = validatedData.query;
            req.params = validatedData.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(exports.createError.validation('Request validation failed', error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                })), 'REQUEST_VALIDATION_ERROR'));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
// Rate limiting error handler
const rateLimitErrorHandler = (req, res) => {
    const error = exports.createError.validation('Too many requests. Please try again later.', { retryAfter: req.get('Retry-After') }, 'RATE_LIMIT_EXCEEDED');
    error.requestId = generateRequestId();
    const errorResponse = {
        success: false,
        message: error.message,
        type: error.type,
        code: error.code,
        details: error.details,
        timestamp: error.timestamp,
        requestId: error.requestId
    };
    res.status(429).json(errorResponse);
};
exports.rateLimitErrorHandler = rateLimitErrorHandler;
// Export error utilities
exports.errorUtils = {
    createError: exports.createError,
    generateRequestId,
    logError
};
