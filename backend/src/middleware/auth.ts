import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        restaurant_id: string;
        name_th: string;
        name_en: string;
      };
    }
  }
}

// JWT token verification middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(createError.authentication('Access token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (!decoded.userId) {
      return next(createError.authentication('Invalid token format'));
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
      return next(createError.authentication('User not found'));
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
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError.authentication('Invalid token'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError.authentication('Token expired'));
    }
    return next(createError.authentication('Authentication failed'));
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError.authentication('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createError.authorization(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      ));
    }

    next();
  };
};

// Restaurant access control middleware
export const requireRestaurantAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(createError.authentication('Authentication required'));
    }

    const restaurantId = req.params.restaurantId || req.body.restaurant_id;

    if (!restaurantId) {
      return next(createError.validation('Restaurant ID required'));
    }

    // Check if user has access to this restaurant
    if (req.user.restaurant_id !== restaurantId) {
      return next(createError.authorization('Access denied to this restaurant'));
    }

    next();
  } catch (error) {
    return next(createError.internal('Restaurant access check failed'));
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

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
  } catch (error) {
    // Continue without user on any error
    next();
  }
};

// Admin only middleware
export const requireAdmin = requireRole(['ADMIN']);

// Manager or Admin middleware
export const requireManager = requireRole(['ADMIN', 'MANAGER']);

// Staff or higher middleware
export const requireStaff = requireRole(['ADMIN', 'MANAGER', 'STAFF']);

// Owner only middleware
export const requireOwner = requireRole(['OWNER']);

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};

// Hash password utility
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcrypt');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare password utility
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    type: 'RATE_LIMIT_ERROR'
  }
};

// Cleanup expired tokens (utility function)
export const cleanupExpiredTokens = async (): Promise<void> => {
  const now = new Date();

  try {
    // Clean up expired password reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isUsed: true, usedAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } // Delete used tokens older than 24h
        ]
      }
    });

    // Clean up expired email verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isUsed: true, usedAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      }
    });

    // Clean up expired blacklisted refresh tokens
    await prisma.refreshTokenBlacklist.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });

    console.log('[Auth] Expired tokens cleaned up successfully');
  } catch (error) {
    console.error('[Auth] Error cleaning up expired tokens:', error);
  }
};
