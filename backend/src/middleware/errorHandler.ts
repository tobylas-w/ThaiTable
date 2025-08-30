import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Enhanced error interface
export interface AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  statusCode: number
  code?: string
  details?: any
  timestamp: string
  requestId?: string
  userAgent?: string
  ip?: string
}

// Error response interface
export interface ErrorResponse {
  success: false
  message: string
  type: ErrorType
  code?: string
  details?: any
  timestamp: string
  requestId?: string
}

// Create custom error class
export class CustomError extends Error implements AppError {
  public type: ErrorType
  public severity: ErrorSeverity
  public statusCode: number
  public code?: string
  public details?: any
  public timestamp: string
  public requestId?: string
  public userAgent?: string
  public ip?: string

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: any
  ) {
    super(message)
    this.name = 'CustomError'
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// Error factory functions
export const createError = {
  validation: (message: string, details?: any, code?: string) =>
    new CustomError(message, ErrorType.VALIDATION, 400, ErrorSeverity.LOW, code, details),

  authentication: (message: string = 'Authentication required', code?: string) =>
    new CustomError(message, ErrorType.AUTHENTICATION, 401, ErrorSeverity.HIGH, code),

  authorization: (message: string = 'Access denied', code?: string) =>
    new CustomError(message, ErrorType.AUTHORIZATION, 403, ErrorSeverity.HIGH, code),

  notFound: (message: string = 'Resource not found', code?: string) =>
    new CustomError(message, ErrorType.NOT_FOUND, 404, ErrorSeverity.MEDIUM, code),

  conflict: (message: string, details?: any, code?: string) =>
    new CustomError(message, ErrorType.CONFLICT, 409, ErrorSeverity.MEDIUM, code, details),

  database: (message: string, details?: any, code?: string) =>
    new CustomError(message, ErrorType.DATABASE, 500, ErrorSeverity.HIGH, code, details),

  external: (message: string, details?: any, code?: string) =>
    new CustomError(message, ErrorType.EXTERNAL, 502, ErrorSeverity.MEDIUM, code, details),

  internal: (message: string = 'Internal server error', details?: any, code?: string) =>
    new CustomError(message, ErrorType.INTERNAL, 500, ErrorSeverity.CRITICAL, code, details)
}

// Error logging utility
const logError = (error: AppError, req: Request) => {
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
    userId: (req as any).user?.id
  }

  // Log based on severity
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error('🚨 CRITICAL ERROR:', logData)
      break
    case ErrorSeverity.HIGH:
      console.error('❌ HIGH SEVERITY ERROR:', logData)
      break
    case ErrorSeverity.MEDIUM:
      console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData)
      break
    case ErrorSeverity.LOW:
      console.log('ℹ️ LOW SEVERITY ERROR:', logData)
      break
  }

  // TODO: Send to error tracking service in production
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(logData)
  // }
}

// Generate request ID for tracking
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Main error handling middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let appError: AppError
  const requestId = generateRequestId()

  // Handle different error types
  if (error instanceof CustomError) {
    appError = error
  } else if (error instanceof ZodError) {
    // Handle Zod validation errors
    appError = createError.validation(
      'Validation failed',
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      })),
      'VALIDATION_ERROR'
    )
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma database errors
    switch (error.code) {
      case 'P2002':
        appError = createError.conflict(
          'Duplicate entry found',
          { field: error.meta?.target },
          'DUPLICATE_ENTRY'
        )
        break
      case 'P2025':
        appError = createError.notFound(
          'Record not found',
          'RECORD_NOT_FOUND'
        )
        break
      case 'P2003':
        appError = createError.validation(
          'Foreign key constraint failed',
          { field: error.meta?.field_name },
          'FOREIGN_KEY_ERROR'
        )
        break
      default:
        appError = createError.database(
          'Database operation failed',
          { code: error.code, meta: error.meta },
          'DATABASE_ERROR'
        )
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = createError.validation(
      'Invalid data provided',
      { message: error.message },
      'PRISMA_VALIDATION_ERROR'
    )
  } else if (error.name === 'JsonWebTokenError') {
    appError = createError.authentication(
      'Invalid token',
      'INVALID_TOKEN'
    )
  } else if (error.name === 'TokenExpiredError') {
    appError = createError.authentication(
      'Token expired',
      'TOKEN_EXPIRED'
    )
  } else {
    // Handle unknown errors
    appError = createError.internal(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
      'UNKNOWN_ERROR'
    )
  }

  // Add request context
  appError.requestId = requestId
  appError.userAgent = req.get('User-Agent')
  appError.ip = req.ip || req.connection.remoteAddress

  // Log the error
  logError(appError, req)

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: appError.message,
    type: appError.type,
    code: appError.code,
    details: appError.details,
    timestamp: appError.timestamp,
    requestId: appError.requestId
  }

  // Send error response
  res.status(appError.statusCode).json(errorResponse)
}

// Async error wrapper middleware
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  const error = createError.notFound(
    `Route ${req.method} ${req.url} not found`,
    'ROUTE_NOT_FOUND'
  )
  error.requestId = generateRequestId()
  
  const errorResponse: ErrorResponse = {
    success: false,
    message: error.message,
    type: error.type,
    code: error.code,
    timestamp: error.timestamp,
    requestId: error.requestId
  }

  res.status(404).json(errorResponse)
}

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      
      req.body = validatedData.body
      req.query = validatedData.query
      req.params = validatedData.params
      
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(createError.validation(
          'Request validation failed',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          })),
          'REQUEST_VALIDATION_ERROR'
        ))
      } else {
        next(error)
      }
    }
  }
}

// Rate limiting error handler
export const rateLimitErrorHandler = (req: Request, res: Response) => {
  const error = createError.validation(
    'Too many requests. Please try again later.',
    { retryAfter: req.get('Retry-After') },
    'RATE_LIMIT_EXCEEDED'
  )
  error.requestId = generateRequestId()
  
  const errorResponse: ErrorResponse = {
    success: false,
    message: error.message,
    type: error.type,
    code: error.code,
    details: error.details,
    timestamp: error.timestamp,
    requestId: error.requestId
  }

  res.status(429).json(errorResponse)
}

// Export error utilities
export const errorUtils = {
  createError,
  generateRequestId,
  logError
}
