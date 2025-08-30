"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation schemas
const createCategorySchema = zod_1.z.object({
    restaurant_id: zod_1.z.string().uuid(),
    name_th: zod_1.z.string().min(1, 'Thai name is required'),
    name_en: zod_1.z.string().min(1, 'English name is required'),
    description_th: zod_1.z.string().optional(),
    description_en: zod_1.z.string().optional(),
    sort_order: zod_1.z.number().default(0),
    is_active: zod_1.z.boolean().default(true)
});
const updateCategorySchema = createCategorySchema.partial().omit({ restaurant_id: true });
// Get all categories for a restaurant
router.get('/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { active } = req.query;
        const where = { restaurant_id: restaurantId };
        if (active !== undefined) {
            where.is_active = active === 'true';
        }
        const categories = await prisma.menuCategory.findMany({
            where,
            include: {
                _count: {
                    select: {
                        menus: true
                    }
                }
            },
            orderBy: [
                { sort_order: 'asc' },
                { name_th: 'asc' }
            ]
        });
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
        });
    }
});
// Get category by ID
router.get('/item/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.menuCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        menus: true
                    }
                }
            }
        });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหมวดหมู่นี้'
            });
        }
        res.json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
        });
    }
});
// Create new category
router.post('/', async (req, res) => {
    try {
        const validatedData = createCategorySchema.parse(req.body);
        const category = await prisma.menuCategory.create({
            data: validatedData
        });
        res.status(201).json({
            success: true,
            message: 'เพิ่มหมวดหมู่สำเร็จ',
            data: category
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
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่'
        });
    }
});
// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateCategorySchema.parse(req.body);
        // Check if category exists
        const existingCategory = await prisma.menuCategory.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหมวดหมู่นี้'
            });
        }
        const category = await prisma.menuCategory.update({
            where: { id },
            data: validatedData
        });
        res.json({
            success: true,
            message: 'อัปเดตหมวดหมู่สำเร็จ',
            data: category
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
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่'
        });
    }
});
// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if category exists
        const existingCategory = await prisma.menuCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        menus: true
                    }
                }
            }
        });
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหมวดหมู่นี้'
            });
        }
        // Check if category has menu items
        if (existingCategory._count.menus > 0) {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถลบหมวดหมู่ได้เนื่องจากมีเมนูอยู่ในหมวดหมู่นี้'
            });
        }
        await prisma.menuCategory.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'ลบหมวดหมู่สำเร็จ'
        });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่'
        });
    }
});
// Reorder categories
router.patch('/reorder', async (req, res) => {
    try {
        const { restaurant_id, category_orders } = req.body;
        if (!Array.isArray(category_orders)) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลการเรียงลำดับไม่ถูกต้อง'
            });
        }
        // Update each category's sort order
        for (const { id, sort_order } of category_orders) {
            await prisma.menuCategory.update({
                where: {
                    id,
                    restaurant_id
                },
                data: {
                    sort_order
                }
            });
        }
        res.json({
            success: true,
            message: 'อัปเดตลำดับหมวดหมู่สำเร็จ'
        });
    }
    catch (error) {
        console.error('Reorder categories error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตลำดับหมวดหมู่'
        });
    }
});
exports.default = router;
