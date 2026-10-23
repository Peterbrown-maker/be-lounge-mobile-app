const express = require('express');
const Rider = require('../models/Rider');

const router = express.Router();

// Get all riders
router.get('/', async (req, res) => {
  try {
    const riders = await Rider.findAll();
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rider by ID
router.get('/:id', async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }
    res.json(rider);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rider location
router.put('/:id/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const rider = await Rider.updateLocation(req.params.id, latitude, longitude);
    res.json(rider);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rider status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const rider = await Rider.updateStatus(req.params.id, status);
    res.json(rider);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
