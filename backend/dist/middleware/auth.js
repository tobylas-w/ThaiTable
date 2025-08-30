"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimit = exports.comparePassword = exports.hashPassword = exports.verifyRefreshToken = exports.generateRefreshToken = exports.generateToken = exports.requireOwner = exports.requireStaff = exports.requireManager = exports.requireAdmin = exports.optionalAuth = exports.requireRestaurantAccess = exports.requireRole = exports.authenticateToken = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const prisma = new client_1.PrismaClient();
// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return next(errorHandler_1.createError.authentication('Access token required'));
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return next(errorHandler_1.createError.authentication('Invalid token format'));
        }
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                restaurant_id: true,
                name_th: true,
                name_en: true,
                restaurant: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        if (!user) {
            return next(errorHandler_1.createError.authentication('User not found'));
        }
        // Add user to request object
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            restaurant_id: user.restaurant_id,
            name_th: user.name_th,
            name_en: user.name_en
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(errorHandler_1.createError.authentication('Invalid token'));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(errorHandler_1.createError.authentication('Token expired'));
        }
        return next(errorHandler_1.createError.authentication('Authentication failed'));
    }
};
exports.authenticateToken = authenticateToken;
// Role-based access control middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(errorHandler_1.createError.authentication('Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(errorHandler_1.createError.authorization(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
        }
        next();
    };
};
exports.requireRole = requireRole;
// Restaurant access control middleware
const requireRestaurantAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler_1.createError.authentication('Authentication required'));
        }
        const restaurantId = req.params.restaurantId || req.body.restaurant_id;
        if (!restaurantId) {
            return next(errorHandler_1.createError.validation('Restaurant ID required'));
        }
        // Check if user has access to this restaurant
        if (req.user.restaurant_id !== restaurantId) {
            return next(errorHandler_1.createError.authorization('Access denied to this restaurant'));
        }
        next();
    }
    catch (error) {
        return next(errorHandler_1.createError.internal('Restaurant access check failed'));
    }
};
exports.requireRestaurantAccess = requireRestaurantAccess;
// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next(); // Continue without user
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return next(); // Continue without user
        }
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                restaurant_id: true,
                name_th: true,
                name_en: true
            }
        });
        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                restaurant_id: user.restaurant_id,
                name_th: user.name_th,
                name_en: user.name_en
            };
        }
        next();
    }
    catch (error) {
        // Continue without user on any error
        next();
    }
};
exports.optionalAuth = optionalAuth;
// Admin only middleware
exports.requireAdmin = (0, exports.requireRole)(['ADMIN']);
// Manager or Admin middleware
exports.requireManager = (0, exports.requireRole)(['ADMIN', 'MANAGER']);
// Staff or higher middleware
exports.requireStaff = (0, exports.requireRole)(['ADMIN', 'MANAGER', 'STAFF']);
// Owner only middleware
exports.requireOwner = (0, exports.requireRole)(['OWNER']);
// Generate JWT token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
// Generate refresh token
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
// Verify refresh token
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
// Hash password utility
const hashPassword = async (password) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
// Compare password utility
const comparePassword = async (password, hash) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
    return bcrypt.compare(password, hash);
};
exports.comparePassword = comparePassword;
// Rate limiting for authentication endpoints
exports.authRateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        type: 'RATE_LIMIT_ERROR'
    }
};
