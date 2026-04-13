const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, verifyToken } = require('../middleware/auth');
const crypto = require('crypto');

// Store CSRF tokens (in production, use Redis or database)
const csrfTokens = new Set();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, photoURL: photoURL || '' });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    // Remove password from response
    const userObj = user.toJSON();

    res.json({ message: 'Login successful', token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { name, email, photoURL, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({ name, email, photoURL, googleId, password: undefined });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ message: 'Google login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/verify
router.get('/verify', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', verifyToken, (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    res.json({ message: 'Token refreshed', token: newToken });
  } catch (err) {
    res.status(500).json({ message: 'Token refresh failed' });
  }
});

// GET /api/auth/csrf-token - Get CSRF token for mutations
router.get('/csrf-token', (req, res) => {
  try {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    csrfTokens.add(csrfToken);
    // Clean up old tokens (keep only 1000)
    if (csrfTokens.size > 1000) {
      const firstToken = csrfTokens.values().next().value;
      csrfTokens.delete(firstToken);
    }
    res.json({ csrfToken });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate CSRF token' });
  }
});

// Middleware to verify CSRF token
const verifyCSRFToken = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  if (['post', 'put', 'delete', 'patch'].includes(req.method.toLowerCase())) {
    if (!csrfToken || !csrfTokens.has(csrfToken)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    csrfTokens.delete(csrfToken); // Single use tokens
  }
  next();
};

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
module.exports.verifyCSRFToken = verifyCSRFToken;
