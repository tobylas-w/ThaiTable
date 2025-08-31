
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple in-memory database
let restaurants = [];
let users = [];
let orders = [];
let menuItems = [];

// Load environment variables
const loadEnv = () => {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const lines = envFile.split('\n');
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim().replace(/"/g, '');
        }
      }
    });
  } catch (err) {
    console.log('No .env file found, using defaults');
  }
};

loadEnv();

const PORT = process.env.PORT || 3000;

// Simple request parser
const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
};

// CORS headers
const setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Simple JSON response
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Routes
const handleRequest = async (req, res) => {
  setCORS(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;
  const method = req.method;

  console.log(`${method} ${url}`);

  // Health check
  if (url === '/health' || url === '/') {
    sendJSON(res, 200, {
      status: 'ok',
      message: 'ThaiTable Simple Backend is running! 🚀',
      timestamp: new Date().toISOString(),
      port: PORT
    });
    return;
  }

  // API v1 routes
  if (url.startsWith('/api/v1/')) {
    const path = url.replace('/api/v1/', '');
    const body = await parseBody(req);

    // Restaurants
    if (path === 'restaurants' && method === 'GET') {
      sendJSON(res, 200, { success: true, data: restaurants });
      return;
    }

    if (path === 'restaurants' && method === 'POST') {
      const restaurant = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString()
      };
      restaurants.push(restaurant);
      sendJSON(res, 201, { success: true, data: restaurant, message: 'Restaurant created successfully' });
      return;
    }

    // Menu items
    if (path.startsWith('menu/') && method === 'GET') {
      const restaurantId = path.split('/')[1];
      const items = menuItems.filter(item => item.restaurant_id === restaurantId);
      sendJSON(res, 200, { success: true, data: items, count: items.length });
      return;
    }

    if (path === 'menu' && method === 'POST') {
      const menuItem = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
        is_available: true
      };
      menuItems.push(menuItem);
      sendJSON(res, 201, { success: true, data: menuItem, message: 'Menu item created successfully' });
      return;
    }

    // Orders
    if (path.startsWith('order/restaurant/') && method === 'GET') {
      const restaurantId = path.split('/')[2];
      const restaurantOrders = orders.filter(order => order.restaurant_id === restaurantId);
      sendJSON(res, 200, {
        success: true,
        data: restaurantOrders,
        pagination: { page: 1, limit: 50, total: restaurantOrders.length }
      });
      return;
    }

    if (path === 'order' && method === 'POST') {
      const order = {
        id: Date.now().toString(),
        order_number: `ORD-${Date.now()}`,
        status: 'PENDING',
        payment_status: 'PENDING',
        ...body,
        created_at: new Date().toISOString()
      };
      orders.push(order);
      sendJSON(res, 201, { success: true, data: order, message: 'Order created successfully' });
      return;
    }

    // Simple auth
    if (path === 'auth/login' && method === 'POST') {
      const { email, password } = body;
      if (email && password) {
        const user = {
          id: Date.now().toString(),
          email,
          name_th: 'ผู้ใช้ทดสอบ',
          name_en: 'Test User',
          role: 'OWNER',
          restaurant_id: 'test-restaurant-1'
        };

        sendJSON(res, 200, {
          success: true,
          message: 'Login successful',
          data: {
            user,
            accessToken: 'test-token-' + Date.now(),
            refreshToken: 'refresh-token-' + Date.now()
          }
        });
        return;
      }
    }

    if (path === 'auth/register' && method === 'POST') {
      const user = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      sendJSON(res, 201, {
        success: true,
        data: {
          user,
          accessToken: 'test-token-' + Date.now(),
          refreshToken: 'refresh-token-' + Date.now()
        },
        message: 'User registered successfully'
      });
      return;
    }
  }

  // 404
  sendJSON(res, 404, {
    success: false,
    message: `Route ${method} ${url} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/v1/restaurants',
      'POST /api/v1/restaurants',
      'GET /api/v1/menu/{restaurantId}',
      'POST /api/v1/menu',
      'GET /api/v1/order/restaurant/{restaurantId}',
      'POST /api/v1/order',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/register'
    ]
  });
};

// Create server
const server = http.createServer(handleRequest);

// Start server
server.listen(PORT, () => {
  console.log('🚀 ThaiTable Simple Backend Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Available endpoints:');
  console.log('• GET  /health - Health check');
  console.log('• POST /api/v1/auth/login - Login');
  console.log('• POST /api/v1/auth/register - Register');
  console.log('• GET  /api/v1/restaurants - Get restaurants');
  console.log('• POST /api/v1/restaurants - Create restaurant');
  console.log('• GET  /api/v1/menu/{id} - Get menu items');
  console.log('• POST /api/v1/menu - Create menu item');
  console.log('• GET  /api/v1/order/restaurant/{id} - Get orders');
  console.log('• POST /api/v1/order - Create order');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
