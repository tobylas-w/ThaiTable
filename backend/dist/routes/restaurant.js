import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
const router = Router();
const prisma = new PrismaClient();
// Get restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true,
                        role: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        menus: true,
                        orders: true
                    }
                }
            }
        });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    }
    catch (error) {
        console.error('Get restaurant error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new restaurant
router.post('/', async (req, res) => {
    try {
        const { name_th, name_en, address_th, address_en, tax_id } = req.body;
        // Check if restaurant with tax_id already exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { tax_id }
        });
        if (existingRestaurant) {
            return res.status(400).json({ error: 'Restaurant with this tax ID already exists' });
        }
        const restaurant = await prisma.restaurant.create({
            data: {
                name_th,
                name_en,
                address_th,
                address_en,
                tax_id
            }
        });
        res.status(201).json(restaurant);
    }
    catch (error) {
        console.error('Create restaurant error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update restaurant
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name_th, name_en, address_th, address_en, tax_id } = req.body;
        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                name_th,
                name_en,
                address_th,
                address_en,
                tax_id
            }
        });
        res.json(restaurant);
    }
    catch (error) {
        console.error('Update restaurant error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get restaurant statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const { period = 'today' } = req.query;
        let dateFilter = {};
        const now = new Date();
        switch (period) {
            case 'today':
                dateFilter = {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                };
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateFilter = { gte: weekAgo };
                break;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                dateFilter = { gte: monthAgo };
                break;
        }
        const [totalOrders, totalRevenue, menuCount, userCount] = await Promise.all([
            prisma.order.count({
                where: {
                    restaurant_id: id,
                    created_at: dateFilter
                }
            }),
            prisma.order.aggregate({
                where: {
                    restaurant_id: id,
                    created_at: dateFilter
                },
                _sum: {
                    total_thb: true
                }
            }),
            prisma.menu.count({
                where: { restaurant_id: id }
            }),
            prisma.user.count({
                where: { restaurant_id: id }
            })
        ]);
        res.json({
            totalOrders,
            totalRevenue: totalRevenue._sum.total_thb || 0,
            menuCount,
            userCount,
            period
        });
    }
    catch (error) {
        console.error('Get restaurant stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
