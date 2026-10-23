const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Paystack config
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = 'https://api.paystack.co';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.warn('WARNING: PAYSTACK_SECRET_KEY not set in environment variables');
}

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orderItems = await Order.getOrderItems(req.params.id);
    res.json({ ...order, items: orderItems });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { restaurant_id, total_amount, delivery_fee, delivery_address, delivery_latitude, delivery_longitude, special_instructions, items } = req.body;

    // Validate user authentication
    const user_id = req.user?.id || req.userId;
    if (!user_id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orderData = {
      user_id,
      restaurant_id,
      total_amount,
      delivery_fee,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      special_instructions,
      items
    };

    const result = await Order.create(orderData);
    res.status(201).json({
      id: result.orderId,
      delivery_code: result.delivery_code,
      delivery_qr_code: result.delivery_qr_code,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ message: error.message || 'Failed to create order' });
  }
});

// Initialize Paystack payment
router.post('/payment/initialize', authenticateToken, async (req, res) => {
  try {
    const { order_id, email, amount, callback_url } = req.body;

    // Validate input
    if (!order_id || !email || !amount || !callback_url) {
      return res.status(400).json({ 
        message: 'Missing required fields: order_id, email, amount, callback_url' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is already paid
    if (order.payment_status === 'completed') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    console.log('Initializing payment with Paystack:', {
      orderId: order_id,
      email,
      amount,
    });

    // Call Paystack API to initialize transaction
    const paystackResponse = await axios.post(
      `${PAYSTACK_API_URL}/transaction/initialize`,
      {
        email,
        amount, // Amount in kobo
        metadata: {
          order_id,
          user_id: req.user.id,
          restaurant_id: order.restaurant_id,
        },
        callback_url,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!paystackResponse.data.status) {
      return res.status(400).json({ 
        message: 'Failed to initialize payment with Paystack',
        error: paystackResponse.data.message
      });
    }

    const { authorization_url, access_code, reference } = paystackResponse.data.data;

    // Store payment reference in order for later verification
    await Order.updatePaymentReference(order_id, reference, 'pending');

    console.log('Payment initialized successfully:', {
      reference,
      accessCode: access_code,
    });

    res.json({
      authorization_url,
      access_code,
      reference,
      message: 'Payment initialized successfully'
    });
  } catch (error) {
    console.error('Payment initialization error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to initialize payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Verify Paystack payment
router.post('/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { order_id, reference } = req.body;

    // Validate input
    if (!order_id || !reference) {
      return res.status(400).json({ 
        message: 'Missing required fields: order_id, reference' 
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Verifying payment with Paystack:', { orderId: order_id, reference });

    // Verify transaction with Paystack
    const paystackResponse = await axios.get(
      `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!paystackResponse.data.status) {
      return res.status(400).json({ 
        message: 'Payment verification failed',
        error: paystackResponse.data.message
      });
    }

    const paymentData = paystackResponse.data.data;
    const paymentStatus = paymentData.status; // 'success', 'pending', 'failed'

    console.log('Payment verification result:', {
      status: paymentStatus,
      amount: paymentData.amount,
      reference: paymentData.reference,
    });

    // Update order payment status
    if (paymentStatus === 'success') {
      await Order.updatePaymentStatus(order_id, 'completed', reference);
      // Optionally update order status to 'confirmed'
      await Order.updateStatus(order_id, 'confirmed');

      console.log('Order payment marked as completed:', { orderId: order_id });

      res.json({
        status: 'success',
        message: 'Payment verified and order confirmed',
        payment_status: 'completed'
      });
    } else if (paymentStatus === 'pending') {
      await Order.updatePaymentStatus(order_id, 'pending', reference);

      res.json({
        status: 'pending',
        message: 'Payment is still pending',
        payment_status: 'pending'
      });
    } else {
      await Order.updatePaymentStatus(order_id, 'failed', reference);

      res.status(400).json({
        status: 'failed',
        message: 'Payment failed',
        payment_status: 'failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update order status (for admin/riders)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await Order.updateStatus(req.params.id, status);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign rider to order
router.put('/:id/rider', authenticateToken, async (req, res) => {
  try {
    const { rider_id } = req.body;
    await Order.assignRider(req.params.id, rider_id);
    res.json({ message: 'Rider assigned successfully' });
  } catch (error) {
    console.error('Assign rider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find available driver for order
router.post('/:id/find-driver', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is paid
    if (order.payment_status !== 'completed') {
      return res.status(400).json({ message: 'Order must be paid before finding a driver' });
    }

    // Find available riders (for now, we simulate this)
    // In production, you would query the riders table for available riders near the restaurant
    const availableRider = await Order.findAvailableRider(order.restaurant_id, order.delivery_lat, order.delivery_lng);

    if (availableRider) {
      // Assign the rider to the order
      await Order.assignRider(orderId, availableRider.id);
      await Order.updateStatus(orderId, 'confirmed');

      res.json({
        success: true,
        rider: {
          id: availableRider.id.toString(),
          name: availableRider.name || 'Driver',
          phone: availableRider.phone || '+27 000 000 0000',
          vehicle: availableRider.vehicle_type || 'motorcycle',
          rating: parseFloat(availableRider.rating) || 4.5,
          currentLocation: {
            latitude: parseFloat(availableRider.current_location_lat) || order.delivery_lat - 0.01,
            longitude: parseFloat(availableRider.current_location_lng) || order.delivery_lng - 0.01
          }
        },
        message: 'Driver found and assigned'
      });
    } else {
      // No real driver available, return mock driver for demo
      res.json({
        success: true,
        rider: {
          id: 'rider_mock_' + Date.now(),
          name: 'Demo Driver',
          phone: '+27 123 456 7890',
          vehicle: 'motorcycle',
          rating: 4.8,
          currentLocation: {
            latitude: order.delivery_lat - 0.01,
            longitude: order.delivery_lng - 0.01
          }
        },
        message: 'Driver assigned (demo mode)'
      });
    }
  } catch (error) {
    console.error('Find driver error:', error);
    res.status(500).json({ message: 'Failed to find driver', error: error.message });
  }
});

// Verify delivery code
router.post('/:id/verify-delivery', authenticateToken, async (req, res) => {
  try {
    const { delivery_code } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.delivery_code !== delivery_code) {
      return res.status(400).json({ message: 'Invalid delivery code' });
    }

    // Update order status to delivered
    await Order.updateStatus(req.params.id, 'delivered');
    res.json({ message: 'Order delivered successfully' });
  } catch (error) {
    console.error('Verify delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;