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

// Helper to parse images JSON safely
const parseImages = (imagesData) => {
  if (!imagesData) return [];
  
  // If it's already an array, return it
  if (Array.isArray(imagesData)) {
    return imagesData;
  }
  
  // If it's a string, try to parse it
  if (typeof imagesData === 'string') {
    try {
      const parsed = JSON.parse(imagesData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse images:', e);
      return [];
    }
  }
  
  return [];
};

// Get all restaurants from dashboard
router.get('/', async (req, res) => {
  try {
    console.log('Restaurant route: Fetching all restaurants');
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

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Restaurant route: Fetching restaurant ${id}`);
    const response = await axios.get(`${DASHBOARD_API}/restaurants/${id}`);
    if (response.data.success) {
      const restaurant = response.data.data;
      res.json({
        success: true,
        data: {
          ...restaurant,
          images: parseImages(restaurant.images)  // ← Parse images array
        }
      });
    } else {
      res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
  } catch (error) {
    handleDashboardError(error, res);
  }
});

// Get all popular food categories from dashboard
router.get('/categories/all', async (req, res) => {
  try {
    console.log('Restaurant route: Fetching all categories');
    const response = await axios.get(`${DASHBOARD_API}/restaurants/categories/all`);
    if (response.data.success) {
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
router.get('/category/:popularFood', async (req, res) => {
  try {
    const { popularFood } = req.params;
    console.log(`Restaurant route: Fetching restaurants by category ${popularFood}`);
    const response = await axios.get(`${DASHBOARD_API}/restaurants/category/${encodeURIComponent(popularFood)}`);
    if (response.data.success) {
      // ← Add parsing for multiple restaurants
      const restaurants = response.data.data.map(restaurant => ({
        ...restaurant,
        images: parseImages(restaurant.images)
      }));
      res.json({
        success: true,
        data: restaurants
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
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    console.log(`Restaurant route: Searching for "${q}"`);
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

module.exports = router;