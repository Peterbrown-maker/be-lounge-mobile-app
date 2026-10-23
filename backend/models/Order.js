const pool = require('../config/database');

class Order {
  static async create(orderData) {
    const { 
      user_id,
      restaurant_id, 
      total_amount, 
      delivery_fee, 
      delivery_address, 
      delivery_latitude, 
      delivery_longitude, 
      special_instructions, 
      items 
    } = orderData;

    // Validate required fields
    if (!user_id) throw new Error('User ID is required');
    if (!restaurant_id) throw new Error('Restaurant ID is required');
    if (!total_amount) throw new Error('Total amount is required');
    if (!delivery_address) throw new Error('Delivery address is required');
    if (delivery_latitude === undefined || delivery_latitude === null) throw new Error('Delivery latitude is required');
    if (delivery_longitude === undefined || delivery_longitude === null) throw new Error('Delivery longitude is required');
    if (!items || items.length === 0) throw new Error('Order must contain at least one item');

    // Generate delivery code and QR code
    const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const deliveryQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${deliveryCode}`;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert order with delivery code and QR code - explicitly set undefined to null
      const [orderResult] = await connection.execute(
        `INSERT INTO orders
         (user_id, restaurant_id, total_amount, delivery_fee, delivery_address, delivery_lat, delivery_lng, special_instructions, delivery_code, delivery_qr_code, status, order_type, payment_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'delivery', 'pending', NOW())`,
        [
          user_id,
          restaurant_id,
          total_amount,
          delivery_fee || 0,
          delivery_address,
          delivery_latitude,
          delivery_longitude,
          special_instructions || null,
          deliveryCode,
          deliveryQrCode
        ]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of items) {
        if (!item.menu_item_id || !item.quantity || item.price === undefined) {
          throw new Error('Invalid order item: missing menu_item_id, quantity, or price');
        }

        const totalPrice = item.quantity * item.price;
        await connection.execute(
          `INSERT INTO order_items 
           (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            orderId,
            item.menu_item_id,
            item.quantity,
            item.price,
            totalPrice,
            item.special_instructions || null
          ]
        );
      }

      await connection.commit();
      
      return { 
        id: orderId,
        orderId, 
        delivery_code: deliveryCode, 
        delivery_qr_code: deliveryQrCode,
        message: 'Order created successfully'
      };
    } catch (error) {
      await connection.rollback();
      console.error('Order creation error:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT o.*, r.name as restaurant_name FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT o.*, r.name as restaurant_name FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.id = ?',
      [id]
    );
    return rows[0];
  }

  static async getOrderItems(orderId) {
    const [rows] = await pool.execute(
      'SELECT oi.*, mi.name, mi.description FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?',
      [orderId]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
  }

  static async assignRider(orderId, riderId) {
    await pool.execute(
      'UPDATE orders SET rider_id = ?, updated_at = NOW() WHERE id = ?',
      [riderId, orderId]
    );
  }

  // Update payment reference when payment is initialized
  static async updatePaymentReference(orderId, reference, paymentStatus = 'pending') {
    try {
      console.log('Updating payment reference:', { orderId, reference, paymentStatus });
      
      const [result] = await pool.execute(
        'UPDATE orders SET payment_reference = ?, payment_status = ?, updated_at = NOW() WHERE id = ?',
        [reference, paymentStatus, orderId]
      );

      if (result.affectedRows === 0) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      console.log('Payment reference updated successfully:', { orderId, reference });
      return result;
    } catch (error) {
      console.error('Error updating payment reference:', error);
      throw error;
    }
  }

  // Update payment status after verification
  static async updatePaymentStatus(orderId, paymentStatus, reference = null) {
    try {
      console.log('Updating payment status:', { orderId, paymentStatus, reference });

      let query = 'UPDATE orders SET payment_status = ?, updated_at = NOW()';
      let params = [paymentStatus, orderId];

      if (reference) {
        query = 'UPDATE orders SET payment_status = ?, payment_reference = ?, updated_at = NOW()';
        params = [paymentStatus, reference, orderId];
      }

      query += ' WHERE id = ?';

      const [result] = await pool.execute(query, params);

      if (result.affectedRows === 0) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      console.log('Payment status updated successfully:', { orderId, paymentStatus });
      return result;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get payment details for an order
  static async getPaymentInfo(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, payment_status, payment_reference, total_amount FROM orders WHERE id = ?',
        [orderId]
      );

      if (rows.length === 0) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      return rows[0];
    } catch (error) {
      console.error('Error fetching payment info:', error);
      throw error;
    }
  }

  // Find available rider near the delivery location
  static async findAvailableRider(restaurantId, deliveryLat, deliveryLng) {
    try {
      // Find available riders, prioritizing those closest to the restaurant
      // This is a simplified version - in production you'd use proper geospatial queries
      const [rows] = await pool.execute(
        `SELECT r.*, u.display_name as name, u.phone
         FROM riders r
         JOIN users u ON r.user_id = u.id
         WHERE r.status = 'available'
         ORDER BY
           ABS(r.current_location_lat - ?) + ABS(r.current_location_lng - ?) ASC
         LIMIT 1`,
        [deliveryLat, deliveryLng]
      );

      if (rows.length > 0) {
        console.log('Found available rider:', rows[0].id);
        return rows[0];
      }

      console.log('No available riders found');
      return null;
    } catch (error) {
      console.error('Error finding available rider:', error);
      return null;
    }
  }

  // Get order with delivery code
  static async getOrderWithDeliveryCode(orderId) {
    try {
      const [rows] = await pool.execute(
        `SELECT o.*, r.name as restaurant_name, o.delivery_code, o.delivery_qr_code
         FROM orders o
         JOIN restaurants r ON o.restaurant_id = r.id
         WHERE o.id = ?`,
        [orderId]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching order with delivery code:', error);
      throw error;
    }
  }
}

module.exports = Order;