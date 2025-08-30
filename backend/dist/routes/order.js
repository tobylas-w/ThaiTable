"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all orders for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { status } = req.query;
        const where = { restaurant_id: restaurantId };
        if (status) {
            where.status = status;
        }
        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new order
router.post('/', async (req, res) => {
    try {
        const { table_id, user_id, restaurant_id, total_thb, status = 'PENDING' } = req.body;
        const order = await prisma.order.create({
            data: {
                table_id,
                user_id,
                restaurant_id,
                total_thb: parseFloat(total_thb),
                status
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        res.json(order);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
