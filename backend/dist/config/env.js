"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load .env file into process.env
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
// Environment validation schema
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(65535)).default('3000'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    CORS_ORIGIN: zod_1.z.string().optional(),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).default('900000'), // 15 minutes
    RATE_LIMIT_MAX: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).default('100'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    API_VERSION: zod_1.z.string().default('v1'),
    UPLOAD_MAX_SIZE: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).default('10485760'), // 10MB
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
exports.env = envValidation.data;
// Additional computed values
exports.config = {
    ...exports.env,
    isDevelopment: exports.env.NODE_ENV === 'development',
    isProduction: exports.env.NODE_ENV === 'production',
    isTest: exports.env.NODE_ENV === 'test',
    // API configuration
    api: {
        version: exports.env.API_VERSION,
        basePath: `/api/${exports.env.API_VERSION}`,
        corsOrigins: exports.env.CORS_ORIGIN
            ? exports.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
            : ['http://localhost:3000', 'http://localhost:5173'],
    },
    // Security configuration
    security: {
        jwt: {
            secret: exports.env.JWT_SECRET,
            refreshSecret: exports.env.JWT_REFRESH_SECRET,
            expiresIn: exports.env.JWT_EXPIRES_IN,
            refreshExpiresIn: exports.env.JWT_REFRESH_EXPIRES_IN,
        },
        rateLimit: {
            windowMs: exports.env.RATE_LIMIT_WINDOW_MS,
            max: exports.env.RATE_LIMIT_MAX,
        },
        cors: {
            origin: exports.env.CORS_ORIGIN
                ? exports.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
                : ['http://localhost:3000', 'http://localhost:5173'],
            credentials: true,
        },
    },
    // Database configuration
    database: {
        url: exports.env.DATABASE_URL,
        pool: {
            min: 2,
            max: 10,
        },
    },
    // Upload configuration
    upload: {
        maxSize: exports.env.UPLOAD_MAX_SIZE,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 5,
    },
    // Logging configuration
    logging: {
        level: exports.env.LOG_LEVEL,
        format: exports.env.isProduction ? 'json' : 'dev',
    },
};
// Validate required environment variables for production
if (exports.env.isProduction) {
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
console.log(`🌍 Environment: ${exports.env.NODE_ENV}`);
console.log(`🔗 API Version: ${exports.env.API_VERSION}`);
console.log(`📊 Log Level: ${exports.env.LOG_LEVEL}`);
