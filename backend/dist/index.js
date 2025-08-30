"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = parseInt(env_1.env.PORT, 10);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://thaitable.com', 'https://app.thaitable.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// API routes
app.use('/api/v1', routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/', (_req, res) => {
    res.json({
        message: 'ThaiTable API is running 🚀',
        version: '1.0.0',
        documentation: '/api/v1/docs',
        health: '/health'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
async function start() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 ThaiTable backend listening on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API base: http://localhost:${PORT}/api/v1`);
        });
    }
    catch (err) {
        console.error('❌ Failed to start server', err);
        process.exit(1);
    }
}
start();
