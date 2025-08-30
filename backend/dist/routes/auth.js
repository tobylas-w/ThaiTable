"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation schemas
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        name_th: zod_1.z.string().min(2, 'Thai name must be at least 2 characters'),
        name_en: zod_1.z.string().min(2, 'English name must be at least 2 characters'),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(['OWNER', 'MANAGER', 'STAFF']).default('STAFF'),
        restaurant_id: zod_1.z.string().uuid('Invalid restaurant ID')
    })
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required')
    })
});
const refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
    })
});
const changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters')
    })
});
// Register new user
router.post('/register', (0, errorHandler_1.validateRequest)(registerSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, name_th, name_en, phone, role, restaurant_id } = req.body;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw errorHandler_1.createError.conflict('User with this email already exists');
    }
    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurant_id }
    });
    if (!restaurant) {
        throw errorHandler_1.createError.notFound('Restaurant not found');
    }
    // Hash password
    const hashedPassword = await (0, auth_1.hashPassword)(password);
    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name_th,
            name_en,
            phone,
            role,
            restaurant_id
        },
        select: {
            id: true,
            email: true,
            name_th: true,
            name_en: true,
            role: true,
            restaurant_id: true,
            createdAt: true
        }
    });
    // Generate tokens
    const accessToken = (0, auth_1.generateToken)(user.id);
    const refreshToken = (0, auth_1.generateRefreshToken)(user.id);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
}));
// Login user
router.post('/login', (0, errorHandler_1.validateRequest)(loginSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
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
        throw errorHandler_1.createError.authentication('Invalid email or password');
    }
    // Verify password
    const isValidPassword = await (0, auth_1.comparePassword)(password, user.password);
    if (!isValidPassword) {
        throw errorHandler_1.createError.authentication('Invalid email or password');
    }
    // Generate tokens
    const accessToken = (0, auth_1.generateToken)(user.id);
    const refreshToken = (0, auth_1.generateRefreshToken)(user.id);
    // Update last login (you might want to add this field to your schema)
    await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
    });
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                name_th: user.name_th,
                name_en: user.name_en,
                role: user.role,
                restaurant_id: user.restaurant_id,
                restaurant: user.restaurant
            },
            accessToken,
            refreshToken
        }
    });
}));
// Refresh access token
router.post('/refresh', (0, errorHandler_1.validateRequest)(refreshTokenSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    try {
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (!decoded.userId || decoded.type !== 'refresh') {
            throw errorHandler_1.createError.authentication('Invalid refresh token');
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name_th: true,
                name_en: true,
                role: true,
                restaurant_id: true
            }
        });
        if (!user) {
            throw errorHandler_1.createError.authentication('User not found');
        }
        // Generate new tokens
        const newAccessToken = (0, auth_1.generateToken)(user.id);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(user.id);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw errorHandler_1.createError.authentication('Invalid refresh token');
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw errorHandler_1.createError.authentication('Refresh token expired');
        }
        throw error;
    }
}));
// Get current user profile
router.get('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
            restaurant: {
                select: {
                    id: true,
                    name_th: true,
                    name_en: true,
                    address_th: true,
                    address_en: true
                }
            }
        },
        select: {
            id: true,
            email: true,
            name_th: true,
            name_en: true,
            role: true,
            restaurant_id: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
            restaurant: true
        }
    });
    if (!user) {
        throw errorHandler_1.createError.notFound('User not found');
    }
    res.json({
        success: true,
        data: user
    });
}));
// Update user profile
router.put('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name_th, name_en, phone } = req.body;
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            name_th: name_th || undefined,
            name_en: name_en || undefined,
            phone: phone || undefined
        },
        select: {
            id: true,
            email: true,
            name_th: true,
            name_en: true,
            role: true,
            restaurant_id: true,
            phone: true,
            updatedAt: true
        }
    });
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
    });
}));
// Change password
router.put('/change-password', auth_1.authenticateToken, (0, errorHandler_1.validateRequest)(changePasswordSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // Get current user with password
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            password: true
        }
    });
    if (!user) {
        throw errorHandler_1.createError.notFound('User not found');
    }
    // Verify current password
    const isValidPassword = await (0, auth_1.comparePassword)(currentPassword, user.password);
    if (!isValidPassword) {
        throw errorHandler_1.createError.validation('Current password is incorrect');
    }
    // Hash new password
    const hashedNewPassword = await (0, auth_1.hashPassword)(newPassword);
    // Update password
    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword }
    });
    res.json({
        success: true,
        message: 'Password changed successfully'
    });
}));
// Logout (client-side token removal, but we can invalidate refresh tokens if needed)
router.post('/logout', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // In a more advanced implementation, you might want to:
    // 1. Add refresh tokens to a blacklist
    // 2. Track user sessions
    // 3. Force logout from all devices
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}));
// Get users for restaurant (admin/manager only)
router.get('/users/:restaurantId', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN', 'MANAGER', 'OWNER']), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { restaurantId } = req.params;
    // Check if user has access to this restaurant
    if (req.user.restaurant_id !== restaurantId) {
        throw errorHandler_1.createError.authorization('Access denied to this restaurant');
    }
    const users = await prisma.user.findMany({
        where: { restaurant_id: restaurantId },
        select: {
            id: true,
            email: true,
            name_th: true,
            name_en: true,
            role: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json({
        success: true,
        data: users
    });
}));
exports.default = router;
