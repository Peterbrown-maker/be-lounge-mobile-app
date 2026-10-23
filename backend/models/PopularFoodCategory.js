const pool = require('../config/database');

class PopularFoodCategory {
  // Get all popular food categories
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM popular_food_categories ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Error fetching popular food categories:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM popular_food_categories WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching popular food category by ID:', error);
      throw error;
    }
  }

  // Create new category
  static async create(categoryData) {
    try {
      const { name, emoji, description } = categoryData;
      const [result] = await pool.execute(
        'INSERT INTO popular_food_categories (name, emoji, description) VALUES (?, ?, ?)',
        [name, emoji, description]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating popular food category:', error);
      throw error;
    }
  }

  // Update category
  static async update(id, categoryData) {
    try {
      const { name, emoji, description } = categoryData;
      await pool.execute(
        'UPDATE popular_food_categories SET name = ?, emoji = ?, description = ? WHERE id = ?',
        [name, emoji, description, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating popular food category:', error);
      throw error;
    }
  }

  // Delete category
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM popular_food_categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting popular food category:', error);
      throw error;
    }
  }
}

module.exports = PopularFoodCategory;
