import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
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

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format')
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  })
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format')
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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
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

      // Check if token is blacklisted
      const blacklistedToken = await prisma.refreshTokenBlacklist.findUnique({
        where: { token: refreshToken }
      });

      if (blacklistedToken) {
        throw createError.authentication('Refresh token has been revoked');
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

// Forgot password - send reset email
router.post('/forgot-password',
  validateRequest(forgotPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurant: {
          select: {
            name_th: true,
            name_en: true
          }
        }
      }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { user_id: user.id }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        user_id: user.id,
        expiresAt
      }
    });

    // Send reset email
    const restaurantName = user.restaurant?.name_en || user.restaurant?.name_th || 'ThaiTable';
    await emailService.sendPasswordReset(email, resetToken, restaurantName);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  })
);

// Reset password with token
router.post('/reset-password',
  validateRequest(resetPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      throw createError.validation('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  })
);

// Send email verification
router.post('/send-verification',
  validateRequest(resendVerificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurant: {
          select: {
            name_th: true,
            name_en: true
          }
        }
      }
    });

    if (!user) {
      res.json({
        success: true,
        message: 'If an account with that email exists, a verification email has been sent.'
      });
      return;
    }

    if (user.isEmailVerified) {
      throw createError.validation('Email is already verified');
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { user_id: user.id }
    });

    // Create new verification token
    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        user_id: user.id,
        expiresAt
      }
    });

    // Send verification email
    const restaurantName = user.restaurant?.name_en || user.restaurant?.name_th || 'ThaiTable';
    await emailService.sendEmailVerification(email, verificationToken, restaurantName);

    res.json({
      success: true,
      message: 'If an account with that email exists, a verification email has been sent.'
    });
  })
);

// Verify email with token
router.post('/verify-email',
  validateRequest(verifyEmailSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    // Find valid verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken || verificationToken.isUsed || verificationToken.expiresAt < new Date()) {
      throw createError.validation('Invalid or expired verification token');
    }

    // Update user and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.user_id },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date()
        }
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  })
);

// Logout (with token blacklisting)
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Add refresh token to blacklist if provided
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
          if (decoded.userId && decoded.type === 'refresh') {
            // Add to blacklist with expiration
            const expiresAt = new Date(decoded.exp * 1000);
            await prisma.refreshTokenBlacklist.create({
              data: {
                token: refreshToken,
                user_id: decoded.userId,
                expiresAt
              }
            }).catch(() => {
              // Ignore duplicate token errors
            });
          }
        } catch (error) {
          // Invalid refresh token, ignore
        }
      }
    }

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
