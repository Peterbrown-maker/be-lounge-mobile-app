const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const pool = require('./config/database');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const riderRoutes = require('./routes/riders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`);
  next();
});

// Routes - ORDER MATTERS! More specific routes first
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// ✅ IMPORTANT: Add menu routes BEFORE restaurants routes
// This ensures /menu?restaurant_id=X is handled before /restaurants/:id routes
app.use('/api/menu', menuRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.use('/api/riders', riderRoutes);

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users LIMIT 1');
    res.json({ 
      success: true, 
      message: 'Database connected', 
      userCount: rows.length 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code 
    });
  }
});

// Test menu endpoint
app.get('/api/test-menu/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`Testing menu for restaurant: ${restaurantId}`);
    
    const [items] = await pool.execute(
      'SELECT id, restaurant_id, name, price FROM menu_items WHERE restaurant_id = ? LIMIT 1',
      [restaurantId]
    );
    
    res.json({ 
      success: true, 
      message: `Found ${items.length} menu items`,
      items
    });
  } catch (error) {
    console.error('Menu test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Create HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO handling for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join order room for tracking
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`User joined order room: order-${orderId}`);
  });

  // Leave order room
  socket.on('leave-order', (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log(`User left order room: order-${orderId}`);
  });

  // Handle rider location updates (riders send this, customers receive)
  socket.on('location-update', (data) => {
    const { orderId, riderId, latitude, longitude } = data;
    console.log(`Rider ${riderId} location update for order ${orderId}: ${latitude}, ${longitude}`);

    if (orderId) {
      // Broadcast to all users in the order room (customers tracking this order)
      io.to(`order-${orderId}`).emit('rider-location', {
        riderId,
        latitude,
        longitude,
        timestamp: new Date()
      });
    }
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    const { orderId, senderId, senderType, message } = data;

    try {
      await pool.execute(
        'INSERT INTO messages (order_id, sender_id, sender_type, message) VALUES (?, ?, ?, ?)',
        [orderId, senderId, senderType, message]
      );

      io.to(`order-${orderId}`).emit('receive-message', {
        orderId,
        senderId,
        senderType,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle order status updates
  socket.on('order-status-update', (data) => {
    const { orderId, status, riderLocation } = data;
    console.log(`Order ${orderId} status update: ${status}`);

    io.to(`order-${orderId}`).emit('order-update', {
      orderId,
      status,
      riderLocation,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Mobile Backend Server Running        ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}          ║
╚════════════════════════════════════════╝
  `);
});