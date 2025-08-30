"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name_th, name_en, restaurant_id, role } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name_th,
                name_en,
                restaurant_id,
                role: role || 'STAFF'
            },
            select: {
                id: true,
                email: true,
                name_th: true,
                name_en: true,
                role: true,
                restaurant_id: true
            }
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
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
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name_th: user.name_th,
                name_en: user.name_en,
                role: user.role,
                restaurant: user.restaurant
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
