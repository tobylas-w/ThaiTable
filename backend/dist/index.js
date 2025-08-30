"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = env_1.config.PORT;
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        type: 'RATE_LIMIT_ERROR'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://thaitable.com', 'https://app.thaitable.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});
// API routes
app.use('/api/v1', routes_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        message: 'ThaiTable API is running 🚀',
        version: '1.0.0',
        documentation: '/api/v1/docs',
        health: '/health',
        environment: process.env.NODE_ENV || 'development'
    });
});
// 404 handler for unmatched routes
app.use('*', errorHandler_1.notFoundHandler);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    try {
        // Close database connection
        await prisma.$disconnect();
        console.log('✅ Database connection closed');
        // Exit process
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
async function start() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        // Start server
        app.listen(PORT, () => {
            console.log('🚀 ThaiTable Backend Server Started');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`📊 Health: http://localhost:${PORT}/health`);
            console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`⏰ Started: ${new Date().toISOString()}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    }
    catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}
start();
