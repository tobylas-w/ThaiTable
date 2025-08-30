import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file into process.env
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  API_VERSION: z.string().default('v1'),
  UPLOAD_MAX_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'), // 10MB

  // Helicone Configuration
  HELICONE_API_KEY: z.string().optional(),
  HELICONE_BASE_URL: z.string().url().optional(),
  HELICONE_CACHE_ENABLED: z.string().transform(val => val === 'true').default('true'),
  HELICONE_RETRY_ENABLED: z.string().transform(val => val === 'true').default('true'),

  // V0 Configuration
  V0_API_KEY: z.string().optional(),
  V0_BASE_URL: z.string().url().optional(),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Environment validation failed:');
  envValidation.error.errors.forEach((error) => {
    console.error(`  - ${error.path.join('.')}: ${error.message}`);
  });
  process.exit(1);
}

export const env = envValidation.data;

// Additional computed values
export const config = {
  ...env,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // API configuration
  api: {
    version: env.API_VERSION,
    basePath: `/api/${env.API_VERSION}`,
    corsOrigins: env.CORS_ORIGIN
      ? env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:5173'],
  },

  // Security configuration
  security: {
    jwt: {
      secret: env.JWT_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    },
    cors: {
      origin: env.CORS_ORIGIN
        ? env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    },
  },

  // Database configuration
  database: {
    url: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
  },

  // Upload configuration
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
  },

  // Logging configuration
  logging: {
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? 'json' : 'dev',
  },

  // Helicone configuration
  helicone: {
    apiKey: env.HELICONE_API_KEY,
    baseUrl: env.HELICONE_BASE_URL || 'https://api.helicone.ai',
    cacheEnabled: env.HELICONE_CACHE_ENABLED,
    retryEnabled: env.HELICONE_RETRY_ENABLED,
    enabled: !!env.HELICONE_API_KEY,
  },

  // V0 configuration
  v0: {
    apiKey: env.V0_API_KEY,
    baseUrl: env.V0_BASE_URL || 'https://api.v0.dev',
    enabled: !!env.V0_API_KEY,
  },
};

// Validate required environment variables for production
if (config.isProduction) {
  const requiredForProduction = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = requiredForProduction.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables for production:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
}

console.log('✅ Environment configuration loaded successfully');
console.log(`🌍 Environment: ${env.NODE_ENV}`);
console.log(`🔗 API Version: ${env.API_VERSION}`);
console.log(`📊 Log Level: ${env.LOG_LEVEL}`);
