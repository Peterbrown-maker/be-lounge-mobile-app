const express = require('express');
const axios = require('axios');
const router = express.Router();
const DASHBOARD_API = 'http://localhost:5001/api';

// Helper to handle dashboard API errors
const handleDashboardError = (error, res) => {
  console.error('Dashboard API error:', error.message);
  res.status(error.response?.status || 500).json({
    success: false,
    error: error.response?.data?.error || error.message || 'Failed to fetch from dashboard'
  });
};

// Helper to ensure emoji field is properly formatted
const formatCategoryImage = (category) => {
  return {
    ...category,
    emoji: category.emoji && typeof category.emoji === 'string' 
      ? (category.emoji.startsWith('data:') ? category.emoji : `data:image/jpeg;base64,${category.emoji}`)
      : null
  };
};

// Get all restaurants from dashboard
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${DASHBOARD_API}/restaurants`);
    if (response.data.success) {
      res.json({
        success: true,
        data: response.data.data
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to fetch restaurants' });
    }
  } catch (error) {
    handleDashboardError(error, res);
  }
});

// Get all popular food categories from dashboard
// IMPORTANT: This route must be defined BEFORE /:id to avoid route conflict
router.get('/categories/all', async (req, res) => {
  try {
    const response = await axios.get(`${DASHBOARD_API}/restaurants/categories/all`);
    if (response.data.success) {
      // Ensure emoji field has proper data URL format for React Native
      const categories = response.data.data.map(cat => formatCategoryImage(cat));
      res.json({
        success: true,
        data: categories
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Get restaurants by popular food category
// IMPORTANT: This route must be defined BEFORE /:id to avoid route conflict
router.get('/category/:popularFood', async (req, res) => {
  try {
    const { popularFood } = req.params;
    const response = await axios.get(`${DASHBOARD_API}/restaurants/category/${encodeURIComponent(popularFood)}`);
    if (response.data.success) {
      res.json({
        success: true,
        data: response.data.data
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    handleDashboardError(error, res);
  }
});

// Search restaurants
// IMPORTANT: This route must be defined BEFORE /:id to avoid route conflict
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    const response = await axios.get(`${DASHBOARD_API}/restaurants`);
    if (response.data.success) {
      const searchTerm = q.toString().toLowerCase();
      const filtered = response.data.data.filter(r =>
        (r.name && r.name.toLowerCase().includes(searchTerm)) ||
        (r.category && r.category.toLowerCase().includes(searchTerm)) ||
        (r.popular_food && r.popular_food.toLowerCase().includes(searchTerm))
      );
      res.json({
        success: true,
        data: filtered
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    handleDashboardError(error, res);
  }
});

// Get restaurant by ID
// IMPORTANT: This route must be defined AFTER specific routes like /categories/all, /category/:popularFood, /search
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${DASHBOARD_API}/restaurants/${req.params.id}`);
    if (response.data.success) {
      res.json({
        success: true,
        data: response.data.data
      });
    } else {
      res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
  } catch (error) {
    handleDashboardError(error, res);
  }
});

// Get restaurant menu items
router.get('/:id/menu', async (req, res) => {
  try {
    const response = await axios.get(`${DASHBOARD_API}/menu?restaurant_id=${req.params.id}`);
    if (response.data.success) {
      const menuItems = response.data.data.map(item => ({
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        image: item.image || null,
        category: item.category,
        isAvailable: item.isAvailable,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      res.json({
        success: true,
        data: menuItems
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    handleDashboardError(error, res);
  }
});

module.exports = router;