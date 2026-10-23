const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, profile_image } = req.body;
    await User.update(req.user.id, { name, phone, profile_image });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await User.getAddresses(req.user.id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const { address, latitude, longitude, label } = req.body;
    const addressId = await User.addAddress(req.user.id, { address, latitude, longitude, label });
    res.status(201).json({ id: addressId, message: 'Address added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user address
router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { address, latitude, longitude, label } = req.body;
    const addressId = parseInt(req.params.id);
    const success = await User.updateAddress(addressId, req.user.id, { address, latitude, longitude, label });
    if (!success) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user address
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const success = await User.deleteAddress(addressId, req.user.id);
    if (!success) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
