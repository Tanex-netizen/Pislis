/**
 * JWT Authentication Middleware
 * 
 * This module provides middleware functions for:
 * 1. Verifying JWT tokens (verifyToken)
 * 2. Checking admin role (verifyAdmin)
 * 3. Optional authentication (optionalAuth)
 * 4. Checking course enrollment (verifyEnrollment)
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Verify JWT token and attach user to request
 * Use this middleware for all protected routes
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired', 
          code: 'TOKEN_EXPIRED' 
        });
      }
      return res.status(401).json({ 
        error: 'Invalid token', 
        code: 'TOKEN_INVALID' 
      });
    }
    
    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_code, name, email, phone, role, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        error: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }

    req.user = user;
    req.tokenData = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Verify user has admin role
 * Must be used AFTER verifyToken middleware
 */
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization error' });
  }
};

/**
 * Optional authentication - attaches user if token valid, doesn't fail otherwise
 * Use for routes that show different content based on auth status
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('id, user_code, name, email, role, created_at')
        .eq('id', decoded.userId)
        .single();

      req.user = user || null;
    } catch {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Verify user is enrolled in a specific course
 * Expects courseId in req.params, req.body, or req.query
 * Must be used AFTER verifyToken middleware
 */
const verifyEnrollment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;
    
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID required' });
    }

    // Check enrollment status
    // NOTE: Admin approvals set status = 'approved', so we must treat both as valid access.
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('id, status, expires_at')
      .eq('user_id', req.user.id)
      .eq('course_id', courseId)
      .in('status', ['active', 'approved'])
      .single();

    if (error || !enrollment) {
      return res.status(403).json({ 
        error: 'Not enrolled in this course',
        code: 'NOT_ENROLLED',
        message: 'Contact admin on Telegram with your User ID to unlock this course'
      });
    }

    // Check expiration
    if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
      return res.status(403).json({ 
        error: 'Course access has expired',
        code: 'ENROLLMENT_EXPIRED'
      });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    console.error('Enrollment verification error:', error);
    return res.status(500).json({ error: 'Enrollment verification error' });
  }
};

/**
 * Legacy: Verify course access token (for link-based access)
 */
const verifyCourseAccess = async (req, res, next) => {
  try {
    const { accessToken } = req.params;

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { data: access, error } = await supabase
      .from('course_access')
      .select(`
        *,
        enrollments (
          id,
          user_id,
          course_id,
          status,
          users (id, name, email),
          courses (id, title, description)
        )
      `)
      .eq('access_token', accessToken)
      .single();

    if (error || !access) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    if (new Date(access.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Access token expired' });
    }

    if (access.status !== 'active') {
      return res.status(401).json({ error: 'Access has been revoked' });
    }

    req.courseAccess = access;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Access verification error' });
  }
};

/**
 * Generate JWT token for a user
 */
const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenId: crypto.randomUUID()
    },
    JWT_SECRET,
    { expiresIn }
  );
};

module.exports = {
  verifyToken,
  verifyAdmin,
  optionalAuth,
  verifyEnrollment,
  verifyCourseAccess,
  generateToken,
  JWT_SECRET
};
