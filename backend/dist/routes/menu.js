"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation schemas
const createMenuSchema = zod_1.z.object({
    restaurant_id: zod_1.z.string().uuid(),
    category_id: zod_1.z.string().uuid().optional(),
    name_th: zod_1.z.string().min(1, 'Thai name is required'),
    name_en: zod_1.z.string().min(1, 'English name is required'),
    description_th: zod_1.z.string().optional(),
    description_en: zod_1.z.string().optional(),
    price_thb: zod_1.z.number().positive('Price must be positive'),
    cost_thb: zod_1.z.number().positive().optional(),
    spice_level: zod_1.z.number().min(1).max(5).optional(),
    preparation_time: zod_1.z.number().positive().optional(),
    is_vegetarian: zod_1.z.boolean().default(false),
    is_vegan: zod_1.z.boolean().default(false),
    is_halal: zod_1.z.boolean().default(false),
    is_gluten_free: zod_1.z.boolean().default(false),
    is_available: zod_1.z.boolean().default(true),
    image_url: zod_1.z.string().url().optional(),
    sort_order: zod_1.z.number().default(0),
    allergens: zod_1.z.array(zod_1.z.string()).default([]),
    nutritional_info: zod_1.z.record(zod_1.z.any()).optional()
});
const updateMenuSchema = createMenuSchema.partial().omit({ restaurant_id: true });
// Get all menu items for a restaurant with categories
router.get('/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { category, available, search } = req.query;
        const where = { restaurant_id: restaurantId };
        if (category) {
            where.category_id = category;
        }
        if (available !== undefined) {
            where.is_available = available === 'true';
        }
        if (search) {
            where.OR = [
                { name_th: { contains: search, mode: 'insensitive' } },
                { name_en: { contains: search, mode: 'insensitive' } },
                { description_th: { contains: search, mode: 'insensitive' } },
                { description_en: { contains: search, mode: 'insensitive' } }
            ];
        }
        const menuItems = await prisma.menu.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            },
            orderBy: [
                { category: { sort_order: 'asc' } },
                { sort_order: 'asc' },
                { name_th: 'asc' }
            ]
        });
        res.json({
            success: true,
            data: menuItems,
            count: menuItems.length
        });
    }
    catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู'
        });
    }
});
// Get menu item by ID
router.get('/item/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await prisma.menu.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบรายการเมนูนี้'
            });
        }
        res.json({
            success: true,
            data: menuItem
        });
    }
    catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู'
        });
    }
});
// Create new menu item
router.post('/', async (req, res) => {
    try {
        const validatedData = createMenuSchema.parse(req.body);
        const menuItem = await prisma.menu.create({
            data: {
                ...validatedData,
                price_thb: validatedData.price_thb,
                cost_thb: validatedData.cost_thb || null
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'เพิ่มเมนูสำเร็จ',
            data: menuItem
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: error.errors
            });
        }
        console.error('Create menu error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเพิ่มเมนู'
        });
    }
});
// Update menu item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateMenuSchema.parse(req.body);
        // Check if menu item exists
        const existingItem = await prisma.menu.findUnique({
            where: { id }
        });
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบรายการเมนูนี้'
            });
        }
        const menuItem = await prisma.menu.update({
            where: { id },
            data: {
                ...validatedData,
                price_thb: validatedData.price_thb ? validatedData.price_thb : undefined,
                cost_thb: validatedData.cost_thb || null
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name_th: true,
                        name_en: true
                    }
                }
            }
        });
        res.json({
            success: true,
            message: 'อัปเดตเมนูสำเร็จ',
            data: menuItem
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: error.errors
            });
        }
        console.error('Update menu error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตเมนู'
        });
    }
});
// Delete menu item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if menu item exists
        const existingItem = await prisma.menu.findUnique({
            where: { id }
        });
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบรายการเมนูนี้'
            });
        }
        // Check if menu item is used in any orders
        const orderItems = await prisma.orderItem.findFirst({
            where: { menu_id: id }
        });
        if (orderItems) {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถลบเมนูได้เนื่องจากมีการใช้งานในออเดอร์แล้ว'
            });
        }
        await prisma.menu.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'ลบเมนูสำเร็จ'
        });
    }
    catch (error) {
        console.error('Delete menu error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบเมนู'
        });
    }
});
// Bulk update menu availability
router.patch('/bulk-availability', async (req, res) => {
    try {
        const { restaurant_id, menu_ids, is_available } = req.body;
        if (!Array.isArray(menu_ids) || menu_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาเลือกเมนูที่ต้องการอัปเดต'
            });
        }
        await prisma.menu.updateMany({
            where: {
                id: { in: menu_ids },
                restaurant_id: restaurant_id
            },
            data: {
                is_available: is_available
            }
        });
        res.json({
            success: true,
            message: `อัปเดตสถานะเมนู ${is_available ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`
        });
    }
    catch (error) {
        console.error('Bulk update menu error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะเมนู'
        });
    }
});
// Get menu statistics
router.get('/:restaurantId/stats', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const stats = await prisma.menu.groupBy({
            by: ['is_available'],
            where: { restaurant_id: restaurantId },
            _count: {
                id: true
            }
        });
        const totalItems = await prisma.menu.count({
            where: { restaurant_id: restaurantId }
        });
        const availableItems = stats.find(s => s.is_available)?._count.id || 0;
        const unavailableItems = stats.find(s => !s.is_available)?._count.id || 0;
        res.json({
            success: true,
            data: {
                total: totalItems,
                available: availableItems,
                unavailable: unavailableItems
            }
        });
    }
    catch (error) {
        console.error('Get menu stats error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงสถิติเมนู'
        });
    }
});
exports.default = router;
