import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';

export interface HeliconeRequest extends Request {
  helicone?: {
    requestId: string;
    startTime: number;
    userId?: string;
    metadata?: Record<string, any>;
  };
}

export const heliconeMiddleware = (req: HeliconeRequest, res: Response, next: NextFunction) => {
  if (!config.helicone.enabled) {
    return next();
  }

  // Generate unique request ID
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add Helicone headers
  res.setHeader('Helicone-Request-Id', requestId);
  res.setHeader('Helicone-Cache-Enabled', config.helicone.cacheEnabled.toString());
  res.setHeader('Helicone-Retry-Enabled', config.helicone.retryEnabled.toString());

  // Add user context if available
  if (req.user?.id) {
    res.setHeader('Helicone-User-Id', req.user.id);
  }

  // Add restaurant context if available
  if (req.user?.restaurant_id) {
    res.setHeader('Helicone-Property-Restaurant-Id', req.user.restaurant_id);
  }

  // Store request info for logging
  req.helicone = {
    requestId,
    startTime: Date.now(),
    userId: req.user?.id,
    metadata: {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      restaurantId: req.user?.restaurant_id,
    },
  };

  next();
};

export const heliconeLogging = (req: HeliconeRequest, res: Response, next: NextFunction) => {
  if (!config.helicone.enabled || !req.helicone) {
    return next();
  }

  const originalSend = res.send;
  res.send = function (data) {
    if (req.helicone) {
      const duration = Date.now() - req.helicone.startTime;

      // Log to Helicone
      console.log(`[Helicone] ${req.helicone.requestId} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);

      // Add custom headers for Helicone analytics
      res.setHeader('Helicone-Property-Duration', duration.toString());
      res.setHeader('Helicone-Property-Status-Code', res.statusCode.toString());
      res.setHeader('Helicone-Property-Response-Size', Buffer.byteLength(data || '', 'utf8').toString());
    }

    return originalSend.call(this, data);
  };

  next();
};
