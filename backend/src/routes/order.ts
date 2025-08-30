import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = z.object({
  table_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
  order_items: z.array(z.object({
    menu_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price_thb: z.number().positive(),
    notes: z.string().optional()
  })).min(1, 'Order must have at least one item'),
  payment_method: z.enum(['CASH', 'PROMPTPAY', 'TRUEMONEY', 'SCB_EASY', 'CREDIT_CARD', 'LINE_PAY', 'AIRPAY']).optional(),
  service_charge_percentage: z.number().min(0).max(20).default(10), // 10% default service charge
  tax_rate: z.number().min(0).max(20).default(7) // 7% VAT default
});

const updateOrderSchema = createOrderSchema.partial().omit({ restaurant_id: true });

// Get all orders for a restaurant with comprehensive filtering
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const {
      status,
      payment_status,
      date_from,
      date_to,
      table_id,
      customer_name,
      limit = '50',
      page = '1'
    } = req.query;

    const where: any = { restaurant_id: restaurantId };

    // Status filter
    if (status) {
      where.status = status;
    }

    // Payment status filter
    if (payment_status) {
      where.payment_status = payment_status;
    }

    // Date range filter
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.created_at.lte = new Date(date_to as string);
      }
    }

    // Table filter
    if (table_id) {
      where.table_id = table_id;
    }

    // Customer name search
    if (customer_name) {
      where.customer_name = {
        contains: customer_name as string,
        mode: 'insensitive'
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name_th: true,
              name_en: true
            }
          },
          table: {
            select: {
              id: true,
              table_number: true,
              capacity: true
            }
          },
          order_items: {
            include: {
              menu: {
                select: {
                  id: true,
                  name_th: true,
                  name_en: true,
                  price_thb: true
                }
              }
            }
          },
          _count: {
            select: {
              order_items: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์'
    });
  }
});

// Create new order with comprehensive validation
router.post('/', async (req, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);

    // Calculate totals
    const subtotal = validatedData.order_items.reduce((sum, item) => {
      return sum + (item.unit_price_thb * item.quantity);
    }, 0);

    const serviceCharge = (subtotal * validatedData.service_charge_percentage) / 100;
    const tax = (subtotal * validatedData.tax_rate) / 100;
    const total = subtotal + serviceCharge + tax;

    // Generate order number (Thai restaurant format: YYYYMMDD-XXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const orderCount = await prisma.order.count({
      where: {
        restaurant_id: validatedData.restaurant_id,
        created_at: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
      }
    });
    const orderNumber = `${dateStr}-${String(orderCount + 1).padStart(3, '0')}`;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          table_id: validatedData.table_id,
          user_id: validatedData.user_id,
          restaurant_id: validatedData.restaurant_id,
          order_number: orderNumber,
          customer_name: validatedData.customer_name,
          customer_phone: validatedData.customer_phone,
          subtotal_thb: subtotal,
          tax_thb: tax,
          service_charge_thb: serviceCharge,
          total_thb: total,
          payment_method: validatedData.payment_method,
          notes: validatedData.notes,
          status: 'PENDING',
          payment_status: 'PENDING'
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        validatedData.order_items.map(item =>
          tx.orderItem.create({
            data: {
              order_id: newOrder.id,
              menu_id: item.menu_id,
              quantity: item.quantity,
              unit_price_thb: item.unit_price_thb,
              total_price_thb: item.unit_price_thb * item.quantity,
              notes: item.notes
            }
          })
        )
      );

      return { ...newOrder, order_items: orderItems };
    });

    res.status(201).json({
      success: true,
      message: 'สร้างออเดอร์สำเร็จ',
      data: order
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: error.errors
      });
    }

    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างออเดอร์'
    });
  }
});

// Update order status with validation
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'SERVED', 'PAID', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะออเดอร์ไม่ถูกต้อง'
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        // Auto-update payment status when order is paid
        payment_status: status === 'PAID' ? 'PAID' : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name_th: true,
            name_en: true
          }
        },
        table: {
          select: {
            id: true,
            table_number: true,
            capacity: true
          }
        },
        order_items: {
          include: {
            menu: {
              select: {
                id: true,
                name_th: true,
                name_en: true,
                price_thb: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'อัปเดตสถานะออเดอร์สำเร็จ',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะออเดอร์'
    });
  }
});

// Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;

    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะการชำระเงินไม่ถูกต้อง'
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        payment_status,
        payment_method: payment_method || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name_th: true,
            name_en: true
          }
        },
        table: {
          select: {
            id: true,
            table_number: true,
            capacity: true
          }
        },
        order_items: {
          include: {
            menu: {
              select: {
                id: true,
                name_th: true,
                name_en: true,
                price_thb: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'อัปเดตสถานะการชำระเงินสำเร็จ',
      data: order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน'
    });
  }
});

// Get order by ID with full details
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
        },
        table: {
          select: {
            id: true,
            table_number: true,
            capacity: true,
            status: true
          }
        },
        order_items: {
          include: {
            menu: {
              select: {
                id: true,
                name_th: true,
                name_en: true,
                price_thb: true,
                image_url: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์นี้'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์'
    });
  }
});

// Cancel order
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // First get the current order to access its notes
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { notes: true }
    });

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${currentOrder?.notes || ''}\n[ยกเลิก]: ${reason}` : currentOrder?.notes
      },
      include: {
        user: {
          select: {
            id: true,
            name_th: true,
            name_en: true
          }
        },
        table: {
          select: {
            id: true,
            table_number: true,
            capacity: true
          }
        },
        order_items: {
          include: {
            menu: {
              select: {
                id: true,
                name_th: true,
                name_en: true,
                price_thb: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'ยกเลิกออเดอร์สำเร็จ',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกออเดอร์'
    });
  }
});

// Get order statistics for dashboard
router.get('/restaurant/:restaurantId/stats', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date_from, date_to } = req.query;

    const where: any = { restaurant_id: restaurantId };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.created_at.lte = new Date(date_to as string);
      }
    }

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _sum: { total_thb: true }
      }),
      prisma.order.count({
        where: { ...where, status: { in: ['PENDING', 'CONFIRMED', 'COOKING'] } }
      }),
      prisma.order.count({
        where: { ...where, status: 'PAID' }
      }),
      prisma.order.count({
        where: { ...where, status: 'CANCELLED' }
      }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _avg: { total_thb: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        total_revenue: totalRevenue._sum.total_thb || 0,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        average_order_value: averageOrderValue._avg.total_thb || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติออเดอร์'
    });
  }
});

export default router;
