import { Router } from 'express';
import authRoutes from './auth';
import menuRoutes from './menu';
import orderRoutes from './order';
import restaurantRoutes from './restaurant';
import categoryRoutes from './categories';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/categories', categoryRoutes);
router.use('/order', orderRoutes);
router.use('/restaurant', restaurantRoutes);

export default router;
