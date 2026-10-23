const pool = require('../config/database');

// Helper to extract base64 from data URL
const extractBase64FromDataUrl = (dataUrl) => {
  if (!dataUrl) return null;
  if (typeof dataUrl === 'string' && dataUrl.includes(',')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
};

// Helper to format image data
const formatImageData = (image) => {
  if (!image) return null;
  if (image.startsWith('data:')) return image;
  return `data:image/jpeg;base64,${image}`;
};

class MenuItem {
  /**
   * Find all menu items for a restaurant
   */
  static async findByRestaurantId(restaurantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, restaurant_id, name, description, CAST(price AS DECIMAL(8,2)) as price, image, category, is_available as isAvailable, created_at, updated_at FROM menu_items WHERE restaurant_id = ? ORDER BY category, name',
        [restaurantId]
      );
      
      // Format images and prices
      return rows.map(row => ({
        ...row,
        price: parseFloat(row.price) || 0,
        image: formatImageData(row.image)
      }));
    } catch (error) {
      console.error('Error finding menu items by restaurant ID:', error);
      throw error;
    }
  }

  /**
   * Find menu item by ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, restaurant_id, name, description, CAST(price AS DECIMAL(8,2)) as price, image, category, is_available as isAvailable, created_at, updated_at FROM menu_items WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        ...row,
        price: parseFloat(row.price) || 0,
        image: formatImageData(row.image)
      };
    } catch (error) {
      console.error('Error finding menu item by ID:', error);
      throw error;
    }
  }

  /**
   * Find all menu items
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, restaurant_id, name, description, CAST(price AS DECIMAL(8,2)) as price, image, category, is_available as isAvailable, created_at, updated_at FROM menu_items ORDER BY category, name'
      );
      
      return rows.map(row => ({
        ...row,
        price: parseFloat(row.price) || 0,
        image: formatImageData(row.image)
      }));
    } catch (error) {
      console.error('Error finding all menu items:', error);
      throw error;
    }
  }

  /**
   * Create new menu item
   */
  static async create(menuItemData) {
    try {
      const {
        restaurant_id,
        name,
        description,
        price,
        image,
        category,
        isAvailable = true
      } = menuItemData;

      // Validate required fields
      if (!restaurant_id || !name || price === undefined || !category) {
        throw new Error('restaurant_id, name, price, and category are required');
      }

      // Verify restaurant exists
      const [restaurants] = await pool.execute(
        'SELECT id FROM restaurants WHERE id = ?',
        [restaurant_id]
      );
      if (restaurants.length === 0) {
        throw new Error('Restaurant not found');
      }

      // Extract base64 from data URL if needed
      const imageBase64 = extractBase64FromDataUrl(image);

      const [result] = await pool.execute(
        'INSERT INTO menu_items (restaurant_id, name, description, price, image, category, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [restaurant_id, name, description || null, price, imageBase64, category, isAvailable]
      );

      return {
        id: result.insertId,
        restaurant_id,
        name,
        description: description || null,
        price: parseFloat(price) || 0,
        image: image || null,
        category,
        isAvailable,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  /**
   * Update menu item
   */
  static async update(id, menuItemData) {
    try {
      const {
        name,
        description,
        price,
        image,
        category,
        isAvailable
      } = menuItemData;

      const updateFields = [];
      const updateValues = [];

      if (name !== undefined && name !== null) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }

      if (description !== undefined && description !== null) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }

      if (price !== undefined && price !== null) {
        updateFields.push('price = ?');
        updateValues.push(price);
      }

      if (image !== undefined && image !== null) {
        const imageBase64 = extractBase64FromDataUrl(image);
        updateFields.push('image = ?');
        updateValues.push(imageBase64);
      }

      if (category !== undefined && category !== null) {
        updateFields.push('category = ?');
        updateValues.push(category);
      }

      if (isAvailable !== undefined && isAvailable !== null) {
        updateFields.push('is_available = ?');
        updateValues.push(isAvailable);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateValues.push(id);

      const [result] = await pool.execute(
        `UPDATE menu_items SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        throw new Error('Menu item not found');
      }

      return { success: true, message: 'Menu item updated successfully' };
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  /**
   * Delete menu item
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM menu_items WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Menu item not found');
      }

      return { success: true, message: 'Menu item deleted successfully' };
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  /**
   * Delete all menu items for a restaurant
   */
  static async deleteByRestaurantId(restaurantId) {
    try {
      await pool.execute(
        'DELETE FROM menu_items WHERE restaurant_id = ?',
        [restaurantId]
      );
      return { success: true, message: 'Menu items deleted successfully' };
    } catch (error) {
      console.error('Error deleting menu items:', error);
      throw error;
    }
  }
}

module.exports = MenuItem;