const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config/jwt');

const router = express.Router();

// Register/Login with Firebase UID
router.post('/firebase-auth', async (req, res) => {
  console.log('=== Firebase Auth Request Started ===');
  console.log('Request body:', req.body);
  
  try {
    const { firebase_uid, email, name, phone } = req.body;

    console.log('Extracted values:');
    console.log('- firebase_uid:', firebase_uid);
    console.log('- email:', email);
    console.log('- name:', name);
    console.log('- phone:', phone);

    // Validate required fields
    if (!firebase_uid || !email) {
      console.log('❌ Validation failed: missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'firebase_uid and email are required' 
      });
    }

    console.log('✅ Validation passed');
    console.log('Searching for user with firebase_uid:', firebase_uid);
    
    // Check if user exists by firebase_uid
    let user = await User.findByFirebaseUid(firebase_uid);
    console.log('User search result by firebase_uid:', user ? 'Found' : 'Not found');

    if (!user) {
      // Check if user exists by email (for re-signup scenarios)
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('Existing user found by email, updating firebase_uid...');
        await User.updateFirebaseUid(existingUser.id, firebase_uid);
        user = await User.findById(existingUser.id);
        console.log('✅ User updated with firebase_uid:', user.id);
      } else {
        console.log('Creating new user...');
        const userData = {
          firebase_uid,
          email,
          display_name: name || email.split('@')[0],
          phone: phone || null
        };
        console.log('User data to create:', userData);

        const userId = await User.create(userData);
        console.log('✅ User created with ID:', userId);

        console.log('Fetching newly created user...');
        user = await User.findById(userId);
        console.log('Fetched user:', user);
      }
    } else {
      console.log('✅ Existing user found:', user.id);
    }

    // Check if JWT_SECRET exists, use default if not
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not found in environment variables, using default secret!');
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { id: user.id, firebase_uid: user.firebase_uid },
      jwtSecret,
      { expiresIn: '7d' }
    );
    console.log('✅ Token generated');

    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name || user.name,
        phone: user.phone,
        profile_image: user.profile_image_url || user.profile_image
      }
    };
    
    console.log('Sending response:', responseData);
    console.log('=== Auth Success ===');
    
    res.json(responseData);
    
  } catch (error) {
    console.error('=== Firebase Auth Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sql:', error.sql);
    console.error('Error sqlMessage:', error.sqlMessage);
    
    res.status(500).json({ 
      message: 'Server error',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name || user.name,
        phone: user.phone,
        profile_image: user.profile_image_url || user.profile_image
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
});

module.exports = router;