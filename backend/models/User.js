// ============================================
// models/User.js (BACKEND)
// ============================================

const pool = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { firebase_uid, email, display_name, phone } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (firebase_uid, email, display_name, phone) VALUES (?, ?, ?, ?)',
      [firebase_uid, email, display_name, phone]
    );
    return result.insertId;
  }

  /**
   * Find user by Firebase UID
   */
  static async findByFirebaseUid(firebase_uid) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [firebase_uid]
    );
    return rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Update Firebase UID for user
   */
  static async updateFirebaseUid(id, firebase_uid) {
    const [result] = await pool.execute(
      'UPDATE users SET firebase_uid = ?, updated_at = NOW() WHERE id = ?',
      [firebase_uid, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {object} userData - { display_name?, phone?, profile_image_url? }
   */
  static async update(id, userData) {
    const { display_name, phone, profile_image_url } = userData;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (display_name !== undefined) {
      updates.push('display_name = ?');
      values.push(display_name);
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (profile_image_url !== undefined) {
      updates.push('profile_image_url = ?');
      values.push(profile_image_url);
    }

    if (updates.length === 0) {
      // No fields to update
      console.log('User.update: No fields to update');
      return false;
    }

    // Add id at the end for WHERE clause
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    try {
      console.log('User.update: Executing query:', query);
      const [result] = await pool.execute(query, values);
      console.log('User.update: Updated', result.affectedRows, 'rows');
      return result.affectedRows > 0;
    } catch (error) {
      console.error('User.update: Database error:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Get user addresses
   */
  static async getAddresses(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM saved_addresses WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  /**
   * Add user address
   */
  static async addAddress(userId, addressData) {
    const { address, latitude, longitude, label } = addressData;
    const [result] = await pool.execute(
      'INSERT INTO saved_addresses (user_id, address, latitude, longitude, label) VALUES (?, ?, ?, ?, ?)',
      [userId, address, latitude, longitude, label]
    );
    return result.insertId;
  }

  /**
   * Update user address
   */
  static async updateAddress(addressId, userId, addressData) {
    const { address, latitude, longitude, label } = addressData;

    // Verify the address belongs to the user
    const [rows] = await pool.execute(
      'SELECT * FROM saved_addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Address not found');
    }

    const [result] = await pool.execute(
      'UPDATE saved_addresses SET address = ?, latitude = ?, longitude = ?, label = ? WHERE id = ? AND user_id = ?',
      [address, latitude, longitude, label, addressId, userId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete user address
   */
  static async deleteAddress(addressId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM saved_addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Verify address belongs to user
   */
  static async verifyAddressOwnership(userId, addressId) {
    const [rows] = await pool.execute(
      'SELECT id FROM saved_addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    return rows.length > 0;
  }
}

module.exports = User;