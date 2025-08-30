import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a sample restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name_th: 'ร้านอาหารไทยแท้',
      name_en: 'Authentic Thai Restaurant',
      address_th: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
      address_en: '123 Sukhumvit Road, Klongtoey, Bangkok 10110',
      tax_id: '0123456789012',
      phone: '02-123-4567',
      email: 'info@thairestaurant.com',
      website: 'https://thairestaurant.com',
      business_hours: JSON.stringify({
        monday: { open: '10:00', close: '22:00' },
        tuesday: { open: '10:00', close: '22:00' },
        wednesday: { open: '10:00', close: '22:00' },
        thursday: { open: '10:00', close: '22:00' },
        friday: { open: '10:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '22:00' }
      }),
      cuisine_type: 'Thai'
    }
  });

  console.log('✅ Restaurant created:', restaurant.name_th);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@thairestaurant.com',
      password: hashedPassword,
      role: 'ADMIN',
      name_th: 'ผู้ดูแลระบบ',
      name_en: 'System Administrator',
      phone: '081-234-5678',
      restaurant_id: restaurant.id
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create manager user
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@thairestaurant.com',
      password: hashedPassword,
      role: 'MANAGER',
      name_th: 'ผู้จัดการร้าน',
      name_en: 'Restaurant Manager',
      phone: '082-345-6789',
      restaurant_id: restaurant.id
    }
  });

  console.log('✅ Manager user created:', managerUser.email);

  // Create staff user
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@thairestaurant.com',
      password: hashedPassword,
      role: 'STAFF',
      name_th: 'พนักงานร้าน',
      name_en: 'Restaurant Staff',
      phone: '083-456-7890',
      restaurant_id: restaurant.id
    }
  });

  console.log('✅ Staff user created:', staffUser.email);

  // Create menu categories
  const categories = await Promise.all([
    prisma.menuCategory.create({
      data: {
        restaurant_id: restaurant.id,
        name_th: 'อาหารจานหลัก',
        name_en: 'Main Dishes',
        description_th: 'อาหารจานหลักของไทย',
        description_en: 'Traditional Thai main dishes',
        sort_order: 1
      }
    }),
    prisma.menuCategory.create({
      data: {
        restaurant_id: restaurant.id,
        name_th: 'อาหารจานเดียว',
        name_en: 'Single Dishes',
        description_th: 'อาหารจานเดียวที่ทานได้เลย',
        description_en: 'Ready-to-eat single dishes',
        sort_order: 2
      }
    }),
    prisma.menuCategory.create({
      data: {
        restaurant_id: restaurant.id,
        name_th: 'เครื่องดื่ม',
        name_en: 'Beverages',
        description_th: 'เครื่องดื่มเย็นและร้อน',
        description_en: 'Hot and cold beverages',
        sort_order: 3
      }
    }),
    prisma.menuCategory.create({
      data: {
        restaurant_id: restaurant.id,
        name_th: 'ของหวาน',
        name_en: 'Desserts',
        description_th: 'ของหวานไทยแท้',
        description_en: 'Traditional Thai desserts',
        sort_order: 4
      }
    })
  ]);

  console.log('✅ Menu categories created:', categories.length);

  // Create menu items
  const menuItems = await Promise.all([
    // Main dishes
    prisma.menu.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: categories[0].id,
        name_th: 'ผัดไทยกุ้งสด',
        name_en: 'Pad Thai with Fresh Shrimp',
        description_th: 'ผัดไทยกุ้งสดสูตรโบราณ',
        description_en: 'Traditional pad thai with fresh shrimp',
        price_thb: 180.0,
        cost_thb: 80.0,
        spice_level: 2,
        preparation_time: 15,
        is_vegetarian: false,
        is_vegan: false,
        is_halal: true,
        is_gluten_free: false,
        allergens: 'กุ้ง,ไข่,ถั่วลิสง',
        nutritional_info: JSON.stringify({
          calories: 450,
          protein: 25,
          carbs: 60,
          fat: 15
        }),
        sort_order: 1
      }
    }),
    prisma.menu.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: categories[0].id,
        name_th: 'แกงเขียวหวานไก่',
        name_en: 'Green Curry with Chicken',
        description_th: 'แกงเขียวหวานไก่รสจัดจ้าน',
        description_en: 'Spicy green curry with chicken',
        price_thb: 220.0,
        cost_thb: 100.0,
        spice_level: 4,
        preparation_time: 20,
        is_vegetarian: false,
        is_vegan: false,
        is_halal: true,
        is_gluten_free: false,
        allergens: 'ไก่,กะทิ',
        nutritional_info: JSON.stringify({
          calories: 380,
          protein: 28,
          carbs: 12,
          fat: 25
        }),
        sort_order: 2
      }
    }),
    // Single dishes
    prisma.menu.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: categories[1].id,
        name_th: 'ข้าวผัดกุ้ง',
        name_en: 'Shrimp Fried Rice',
        description_th: 'ข้าวผัดกุ้งสูตรพิเศษ',
        description_en: 'Special shrimp fried rice',
        price_thb: 160.0,
        cost_thb: 70.0,
        spice_level: 1,
        preparation_time: 12,
        is_vegetarian: false,
        is_vegan: false,
        is_halal: true,
        is_gluten_free: false,
        allergens: 'กุ้ง,ไข่',
        nutritional_info: JSON.stringify({
          calories: 420,
          protein: 18,
          carbs: 65,
          fat: 12
        }),
        sort_order: 1
      }
    }),
    // Beverages
    prisma.menu.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: categories[2].id,
        name_th: 'ชาเย็น',
        name_en: 'Thai Iced Tea',
        description_th: 'ชาเย็นรสหวานหอม',
        description_en: 'Sweet and fragrant iced tea',
        price_thb: 45.0,
        cost_thb: 15.0,
        spice_level: 0,
        preparation_time: 3,
        is_vegetarian: true,
        is_vegan: false,
        is_halal: true,
        is_gluten_free: true,
        allergens: 'นม',
        nutritional_info: JSON.stringify({
          calories: 120,
          protein: 2,
          carbs: 25,
          fat: 3
        }),
        sort_order: 1
      }
    }),
    // Desserts
    prisma.menu.create({
      data: {
        restaurant_id: restaurant.id,
        category_id: categories[3].id,
        name_th: 'ข้าวเหนียวมะม่วง',
        name_en: 'Mango Sticky Rice',
        description_th: 'ข้าวเหนียวมะม่วงหวานหอม',
        description_en: 'Sweet mango with sticky rice',
        price_thb: 80.0,
        cost_thb: 30.0,
        spice_level: 0,
        preparation_time: 5,
        is_vegetarian: true,
        is_vegan: false,
        is_halal: true,
        is_gluten_free: true,
        allergens: 'นม,มะม่วง',
        nutritional_info: JSON.stringify({
          calories: 280,
          protein: 4,
          carbs: 55,
          fat: 6
        }),
        sort_order: 1
      }
    })
  ]);

  console.log('✅ Menu items created:', menuItems.length);

  // Create tables
  const tables = await Promise.all([
    prisma.table.create({
      data: {
        restaurant_id: restaurant.id,
        table_number: 'A1',
        capacity: 2,
        status: 'AVAILABLE',
        location_x: 100,
        location_y: 100
      }
    }),
    prisma.table.create({
      data: {
        restaurant_id: restaurant.id,
        table_number: 'A2',
        capacity: 4,
        status: 'AVAILABLE',
        location_x: 200,
        location_y: 100
      }
    }),
    prisma.table.create({
      data: {
        restaurant_id: restaurant.id,
        table_number: 'B1',
        capacity: 6,
        status: 'AVAILABLE',
        location_x: 100,
        location_y: 200
      }
    }),
    prisma.table.create({
      data: {
        restaurant_id: restaurant.id,
        table_number: 'B2',
        capacity: 8,
        status: 'AVAILABLE',
        location_x: 200,
        location_y: 200
      }
    })
  ]);

  console.log('✅ Tables created:', tables.length);

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      table_id: tables[0].id,
      user_id: staffUser.id,
      restaurant_id: restaurant.id,
      order_number: 'ORD-001',
      customer_name: 'คุณสมชาย',
      customer_phone: '089-123-4567',
      subtotal_thb: 225.0,
      tax_thb: 11.25,
      service_charge_thb: 22.5,
      total_thb: 258.75,
      payment_method: 'CASH',
      payment_status: 'PENDING',
      status: 'PENDING',
      notes: 'ไม่ใส่พริก'
    }
  });

  console.log('✅ Sample order created:', order.order_number);

  // Create order items
  const orderItems = await Promise.all([
    prisma.orderItem.create({
      data: {
        order_id: order.id,
        menu_id: menuItems[0].id, // Pad Thai
        quantity: 1,
        unit_price_thb: 180.0,
        total_price_thb: 180.0,
        notes: 'ไม่ใส่พริก'
      }
    }),
    prisma.orderItem.create({
      data: {
        order_id: order.id,
        menu_id: menuItems[3].id, // Thai Iced Tea
        quantity: 1,
        unit_price_thb: 45.0,
        total_price_thb: 45.0
      }
    })
  ]);

  console.log('✅ Order items created:', orderItems.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample Data Summary:');
  console.log(`- Restaurant: ${restaurant.name_th}`);
  console.log(`- Users: ${adminUser.email}, ${managerUser.email}, ${staffUser.email}`);
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Menu Items: ${menuItems.length}`);
  console.log(`- Tables: ${tables.length}`);
  console.log(`- Sample Order: ${order.order_number}`);
  console.log('\n🔑 Default passwords: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
