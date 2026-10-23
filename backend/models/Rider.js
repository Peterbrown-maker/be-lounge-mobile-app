const pool = require('../config/database');

class Rider {
  static async create(riderData) {
    const { name, phone, email, vehicle_type, license_plate } = riderData;
    const [result] = await pool.execute(
      'INSERT INTO riders (name, phone, email, vehicle_type, license_plate) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email, vehicle_type, license_plate]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM riders WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM riders WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE riders SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async updateLocation(id, latitude, longitude) {
    await pool.execute(
      'UPDATE riders SET current_latitude = ?, current_longitude = ? WHERE id = ?',
      [latitude, longitude, id]
    );
  }

  static async getAvailableOrders() {
    const [rows] = await pool.execute(
      'SELECT o.*, r.name as restaurant_name, u.name as user_name FROM orders o JOIN restaurants r ON o.restaurant_id = r.id JOIN users u ON o.user_id = u.id WHERE o.status = "pending" AND o.rider_id IS NULL'
    );
    return rows;
  }

  static async getAssignedOrders(riderId) {
    const [rows] = await pool.execute(
      'SELECT o.*, r.name as restaurant_name, u.name as user_name FROM orders o JOIN restaurants r ON o.restaurant_id = r.id JOIN users u ON o.user_id = u.id WHERE o.rider_id = ? AND o.status IN ("confirmed", "preparing", "ready", "picked_up")',
      [riderId]
    );
    return rows;
  }
}

module.exports = Rider;
