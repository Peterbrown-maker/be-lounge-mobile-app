const express = require('express');
const axios = require('axios');
const router = express.Router();

// Dashboard API endpoint
const DASHBOARD_API = 'http://localhost:5001/api';

// Helper to format images for mobile
const formatImageForMobile = (image) => {
  if (!image) return '';
  
  // Already a data URL
  if (typeof image === 'string' && image.startsWith('data:')) {
    return image;
  }
  
  // Plain base64, add prefix
  if (typeof image === 'string' && image.length > 0) {
    return `data:image/jpeg;base64,${image}`;
  }
  
  return '';
};

// Get menu items for a restaurant
// GET /api/menu?restaurant_id=X
router.get('/', async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    
    if (!restaurant_id) {
      console.warn('Menu endpoint called without restaurant_id');
      return res.status(400).json({
        success: false,
        error: 'restaurant_id query parameter is required'
      });
    }

    console.log(`Menu route: Fetching items for restaurant ${restaurant_id}`);

    // Call dashboard API
    const response = await axios.get(
      `${DASHBOARD_API}/menu?restaurant_id=${restaurant_id}`,
      { timeout: 5000 }
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      const menuItems = response.data.data.map(item => ({
        id: String(item.id),
        restaurant_id: String(item.restaurant_id),
        name: item.name || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        image: formatImageForMobile(item.image),
        category: item.category || 'Main',
        isAvailable: item.isAvailable !== false,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log(`Menu route: Returning ${menuItems.length} items for restaurant ${restaurant_id}`);

      return res.json({
        success: true,
        data: menuItems
      });
    } else {
      console.warn(`Dashboard returned unexpected format:`, response.data);
      return res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Menu route error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch menu items'
    });
  }
});

// Get single menu item by ID
// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Menu route: Fetching single item ${id}`);

    const response = await axios.get(
      `${DASHBOARD_API}/menu/${id}`,
      { timeout: 5000 }
    );

    if (response.data.success) {
      const item = response.data.data;
      const menuItem = {
        id: String(item.id),
        restaurant_id: String(item.restaurant_id),
        name: item.name || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        image: formatImageForMobile(item.image),
        category: item.category || 'Main',
        isAvailable: item.isAvailable !== false,
        created_at: item.created_at,
        updated_at: item.updated_at
      };

      return res.json({
        success: true,
        data: menuItem
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
  } catch (error) {
    console.error('Get menu item error:', error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to fetch menu item'
    });
  }
});

// Create menu item (proxy to dashboard)
// POST /api/menu
router.post('/', async (req, res) => {
  try {
    const menuItemData = req.body;

    console.log(`Menu route: Creating new menu item`);

    const response = await axios.post(
      `${DASHBOARD_API}/menu`,
      menuItemData,
      { timeout: 5000 }
    );

    if (response.data.success) {
      const item = response.data.data;
      const menuItem = {
        id: String(item.id),
        restaurant_id: String(item.restaurant_id),
        name: item.name || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        image: formatImageForMobile(item.image),
        category: item.category || 'Main',
        isAvailable: item.isAvailable !== false,
        created_at: item.created_at,
        updated_at: item.updated_at
      };

      return res.status(201).json({
        success: true,
        data: menuItem
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.data.error || 'Failed to create menu item'
      });
    }
  } catch (error) {
    console.error('Create menu item error:', error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to create menu item'
    });
  }
});

// Update menu item (proxy to dashboard)
// PUT /api/menu/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`Menu route: Updating menu item ${id}`);

    const response = await axios.put(
      `${DASHBOARD_API}/menu/${id}`,
      updateData,
      { timeout: 5000 }
    );

    if (response.data.success) {
      return res.json({
        success: true,
        message: 'Menu item updated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.data.error || 'Failed to update menu item'
      });
    }
  } catch (error) {
    console.error('Update menu item error:', error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to update menu item'
    });
  }
});

// Delete menu item (proxy to dashboard)
// DELETE /api/menu/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Menu route: Deleting menu item ${id}`);

    const response = await axios.delete(
      `${DASHBOARD_API}/menu/${id}`,
      { timeout: 5000 }
    );

    if (response.data.success) {
      return res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.data.error || 'Failed to delete menu item'
      });
    }
  } catch (error) {
    console.error('Delete menu item error:', error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to delete menu item'
    });
  }
});

module.exports = router;