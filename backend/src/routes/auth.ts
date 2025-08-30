import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import {
  authenticateToken,
  comparePassword,
  generateRefreshToken,
  generateToken,
  hashPassword,
  requireRole
} from '../middleware/auth';
import { asyncHandler, createError, validateRequest } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name_th: z.string().min(2, 'Thai name must be at least 2 characters'),
    name_en: z.string().min(2, 'English name must be at least 2 characters'),
    phone: z.string().optional(),
    role: z.enum(['OWNER', 'MANAGER', 'STAFF']).default('STAFF'),
    restaurant_id: z.string().uuid('Invalid restaurant ID')
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  })
});

// Register new user
router.post('/register',
  validateRequest(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name_th, name_en, phone, role, restaurant_id } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw createError.conflict('User with this email already exists');
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurant_id }
    });

    if (!restaurant) {
      throw createError.notFound('Restaurant not found');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

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
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  })
);

// Login user
router.post('/login',
  validateRequest(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
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
      throw createError.authentication('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw createError.authentication('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

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
  })
);

// Refresh access token
router.post('/refresh',
  validateRequest(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

      if (!decoded.userId || decoded.type !== 'refresh') {
        throw createError.authentication('Invalid refresh token');
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
        throw createError.authentication('User not found');
      }

      // Generate new tokens
      const newAccessToken = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError.authentication('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw createError.authentication('Refresh token expired');
      }
      throw error;
    }
  })
);

// Get current user profile
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
      }
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    res.json({
      success: true,
      data: user
    });
  })
);

// Update user profile
router.put('/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { name_th, name_en, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
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
  })
);

// Change password
router.put('/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        password: true
      }
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw createError.validation('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// Logout (client-side token removal, but we can invalidate refresh tokens if needed)
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // In a more advanced implementation, you might want to:
    // 1. Add refresh tokens to a blacklist
    // 2. Track user sessions
    // 3. Force logout from all devices

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
);

// Get users for restaurant (admin/manager only)
router.get('/users/:restaurantId',
  authenticateToken,
  requireRole(['ADMIN', 'MANAGER', 'OWNER']),
  asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;

    // Check if user has access to this restaurant
    if (req.user!.restaurant_id !== restaurantId) {
      throw createError.authorization('Access denied to this restaurant');
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
  })
);

export default router;
