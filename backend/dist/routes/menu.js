"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all menu items for a restaurant
router.get('/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const menuItems = await prisma.menu.findMany({
            where: { restaurant_id: restaurantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(menuItems);
    }
    catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new menu item
router.post('/', async (req, res) => {
    try {
        const { restaurant_id, name_th, name_en, price_thb, spice_level } = req.body;
        const menuItem = await prisma.menu.create({
            data: {
                restaurant_id,
                name_th,
                name_en,
                price_thb: parseFloat(price_thb),
                spice_level: spice_level ? parseInt(spice_level) : null
            }
        });
        res.status(201).json(menuItem);
    }
    catch (error) {
        console.error('Create menu error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update menu item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name_th, name_en, price_thb, spice_level } = req.body;
        const menuItem = await prisma.menu.update({
            where: { id },
            data: {
                name_th,
                name_en,
                price_thb: parseFloat(price_thb),
                spice_level: spice_level ? parseInt(spice_level) : null
            }
        });
        res.json(menuItem);
    }
    catch (error) {
        console.error('Update menu error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete menu item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menu.delete({
            where: { id }
        });
        res.json({ message: 'Menu item deleted successfully' });
    }
    catch (error) {
        console.error('Delete menu error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
