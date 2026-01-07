/**
 * Authentication Routes
 * Handles user signup, login, and profile management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const supabase = require('../config/supabase');
const { verifyToken, generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user account
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: 'student',
        password_set: true,
      })
      .select('id, user_code, name, email, role, created_at')
      .single();

    if (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        user_code: user.user_code, // Human-readable ID for admin reference
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_code, name, email, password, role')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        user_code: user.user_code,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user's profile
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        user_code: req.user.user_code,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        created_at: req.user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/profile
 * Update current user's profile
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, user_code, name, email, phone, role')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/enrollments
 * Get current user's course enrollments
 */
router.get('/enrollments', verifyToken, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        unlocked_at,
        expires_at,
        courses (
          id,
          slug,
          title,
          short_description,
          thumbnail_url,
          duration_hours,
          level
        )
      `)
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('unlocked_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch enrollments' });
    }

    res.json({ enrollments: enrollments || [] });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
