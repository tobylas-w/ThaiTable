import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createTableSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_number: z.string().min(1, 'Table number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  location_x: z.number().optional(),
  location_y: z.number().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'OUT_OF_SERVICE']).default('AVAILABLE')
});

const updateTableSchema = createTableSchema.partial().omit({ restaurant_id: true });

// Get all tables for a restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.query;

    const where: any = { restaurant_id: restaurantId };
    if (status) {
      where.status = status;
    }

    const tables = await prisma.table.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: [
        { table_number: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: tables,
      count: tables.length
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ'
    });
  }
});

// Get table by ID
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'SERVED']
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโต๊ะนี้'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ'
    });
  }
});

// Create new table
router.post('/', async (req, res) => {
  try {
    const validatedData = createTableSchema.parse(req.body);

    // Check if table number already exists in restaurant
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurant_id: validatedData.restaurant_id,
        table_number: validatedData.table_number
      }
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'หมายเลขโต๊ะนี้มีอยู่ในร้านแล้ว'
      });
    }

    const table = await prisma.table.create({
      data: validatedData
    });

    res.status(201).json({
      success: true,
      message: 'เพิ่มโต๊ะสำเร็จ',
      data: table
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: error.errors
      });
    }

    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มโต๊ะ'
    });
  }
});

// Update table
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateTableSchema.parse(req.body);

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id }
    });

    if (!existingTable) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโต๊ะนี้'
      });
    }

    // Check if table number conflicts with other tables in same restaurant
    if (validatedData.table_number) {
      const conflictingTable = await prisma.table.findFirst({
        where: {
          restaurant_id: existingTable.restaurant_id,
          table_number: validatedData.table_number,
          id: { not: id }
        }
      });

      if (conflictingTable) {
        return res.status(400).json({
          success: false,
          message: 'หมายเลขโต๊ะนี้มีอยู่ในร้านแล้ว'
        });
      }
    }

    const table = await prisma.table.update({
      where: { id },
      data: validatedData
    });

    res.json({
      success: true,
      message: 'อัปเดตโต๊ะสำเร็จ',
      data: table
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: error.errors
      });
    }

    console.error('Update table error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตโต๊ะ'
    });
  }
});

// Delete table
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!existingTable) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโต๊ะนี้'
      });
    }

    // Check if table has active orders
    if (existingTable._count.orders > 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบโต๊ะได้เนื่องจากมีออเดอร์ที่ใช้งานอยู่'
      });
    }

    await prisma.table.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'ลบโต๊ะสำเร็จ'
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบโต๊ะ'
    });
  }
});

// Update table status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'OUT_OF_SERVICE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะโต๊ะไม่ถูกต้อง'
      });
    }

    const table = await prisma.table.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: 'อัปเดตสถานะโต๊ะสำเร็จ',
      data: table
    });
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะโต๊ะ'
    });
  }
});

// Get table statistics
router.get('/:restaurantId/stats', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const stats = await prisma.table.groupBy({
      by: ['status'],
      where: { restaurant_id: restaurantId },
      _count: {
        id: true
      }
    });

    const totalTables = await prisma.table.count({
      where: { restaurant_id: restaurantId }
    });

    const availableTables = stats.find(s => s.status === 'AVAILABLE')?._count.id || 0;
    const occupiedTables = stats.find(s => s.status === 'OCCUPIED')?._count.id || 0;
    const reservedTables = stats.find(s => s.status === 'RESERVED')?._count.id || 0;
    const cleaningTables = stats.find(s => s.status === 'CLEANING')?._count.id || 0;
    const outOfServiceTables = stats.find(s => s.status === 'OUT_OF_SERVICE')?._count.id || 0;

    res.json({
      success: true,
      data: {
        total: totalTables,
        available: availableTables,
        occupied: occupiedTables,
        reserved: reservedTables,
        cleaning: cleaningTables,
        outOfService: outOfServiceTables
      }
    });
  } catch (error) {
    console.error('Get table stats error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติโต๊ะ'
    });
  }
});

// Bulk update table positions (for floor plan)
router.patch('/:restaurantId/positions', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { table_positions } = req.body;

    if (!Array.isArray(table_positions)) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลตำแหน่งโต๊ะไม่ถูกต้อง'
      });
    }

    // Update each table's position
    for (const { id, location_x, location_y } of table_positions) {
      await prisma.table.update({
        where: {
          id,
          restaurant_id: restaurantId
        },
        data: {
          location_x,
          location_y
        }
      });
    }

    res.json({
      success: true,
      message: 'อัปเดตตำแหน่งโต๊ะสำเร็จ'
    });
  } catch (error) {
    console.error('Update table positions error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตตำแหน่งโต๊ะ'
    });
  }
});

export default router;
