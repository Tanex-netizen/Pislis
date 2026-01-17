const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const validator = require('validator');
const supabase = require('../config/supabase');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { sendAdminNotification } = require('../config/email');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment-proofs');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

/**
 * POST /api/enrollments
 * Submit contact interest (simplified - no course or payment needed)
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Store as a pending enrollment request (course/payment can be handled later)
    const { data: enrollment, error: insertError } = await supabase
      .from('enrollments')
      .insert({
        user_id: req.user?.id || null,
        course_id: null,
        name,
        email: email.toLowerCase(),
        phone,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single();

    if (insertError) {
      console.error('Create enrollment request error:', insertError);
      return res.status(500).json({ error: 'Failed to submit enrollment request' });
    }

    // Notify admin by email if configured
    try {
      await sendAdminNotification({
        name,
        email: email.toLowerCase(),
        phone,
        courseName: 'Not specified',
      });
    } catch (emailError) {
      console.warn('Failed to send admin notification email:', emailError.message);
    }

    res.status(201).json({
      message: 'Enrollment request received! Please sign up to get your Student ID, then contact us on Telegram to unlock courses.',
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/enrollments/status
 * Check if authenticated user is enrolled in a specific course
 * This is the main endpoint for checking course access
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check enrollment status
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('id, status, unlocked_at, expires_at')
      .eq('user_id', req.user.id)
      .eq('course_id', courseId)
      .single();

    if (error || !enrollment) {
      return res.json({
        enrolled: false,
        isEnrolled: false,
        message: 'Contact admin on Telegram with your User ID to unlock this course',
        user_code: req.user.user_code,
      });
    }

    // Check if active/approved and not expired
    const isActive = enrollment.status === 'active' || enrollment.status === 'approved';
    const isExpired = enrollment.expires_at && new Date(enrollment.expires_at) < new Date();

    if (!isActive || isExpired) {
      return res.json({
        enrolled: false,
        isEnrolled: false,
        reason: isExpired ? 'expired' : 'inactive',
        message: 'Your course access has expired. Contact admin to renew.',
        user_code: req.user.user_code,
      });
    }

    res.json({
      enrolled: true,
      isEnrolled: true,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        unlocked_at: enrollment.unlocked_at,
        expires_at: enrollment.expires_at,
      },
    });
  } catch (error) {
    console.error('Check enrollment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/enrollments/debug-my-enrollments
 * Debug endpoint to see all enrollments for the user (regardless of status)
 */
router.get('/debug-my-enrollments', verifyToken, async (req, res) => {
  try {
    const selectVariants = [
      `
        id,
        user_id,
        course_id,
        status,
        created_at,
        approved_at,
        unlocked_at,
        expires_at,
        courses (id, title)
      `,
      `
        id,
        user_id,
        course_id,
        status,
        created_at,
        unlocked_at,
        expires_at,
        courses (id, title)
      `,
      `
        id,
        user_id,
        course_id,
        status,
        created_at,
        courses (id, title)
      `,
    ];

    let enrollments = null;
    let lastError = null;

    for (const select of selectVariants) {
      const result = await supabase
        .from('enrollments')
        .select(select)
        .eq('user_id', req.user.id);

      if (!result.error) {
        enrollments = result.data || [];
        lastError = null;
        break;
      }

      lastError = result.error;
    }

    if (lastError) {
      return res.status(500).json({ error: 'Failed to fetch enrollments', details: lastError });
    }

    res.json({ 
      user_id: req.user.id,
      user_code: req.user.user_code,
      enrollment_count: (enrollments || []).length,
      enrollments: enrollments || []
    });
  } catch (error) {
    console.error('Debug enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/enrollments/my-courses
 * Get all courses the authenticated user is enrolled in
 */
router.get('/my-courses', verifyToken, async (req, res) => {
  try {
    // Some deployments may not have monthly payment columns yet.
    // We try richer selects first, then fall back to a minimal select.
    const selectVariants = [
      `
        id,
        status,
        created_at,
        unlocked_at,
        approved_at,
        expires_at,
        monthly_payment_amount,
        last_payment_date,
        next_payment_due,
        monthly_payment_status,
        courses (
          id,
          slug,
          title,
          short_description,
          thumbnail_url,
          duration_hours,
          level
        )
      `,
      `
        id,
        status,
        created_at,
        unlocked_at,
        expires_at,
        monthly_payment_amount,
        last_payment_date,
        next_payment_due,
        monthly_payment_status,
        courses (
          id,
          slug,
          title,
          short_description,
          thumbnail_url,
          duration_hours,
          level
        )
      `,
      `
        id,
        status,
        created_at,
        unlocked_at,
        approved_at,
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
      `,
      `
        id,
        status,
        created_at,
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
      `,
      `
        id,
        status,
        created_at,
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
      `,
    ];

    let enrollments = null;
    let lastError = null;

    for (const select of selectVariants) {
      const result = await supabase
        .from('enrollments')
        .select(select)
        .eq('user_id', req.user.id)
        .in('status', ['active', 'approved'])
        .order('created_at', { ascending: false });

      if (!result.error) {
        enrollments = result.data || [];
        lastError = null;
        break;
      }

      lastError = result.error;
    }

    if (lastError) {
      console.error('Get my courses supabase error:', lastError);
      return res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }

    // Filter out expired enrollments and calculate days remaining
    const now = new Date();
    const activeCourses = (enrollments || []).filter(e => 
      !e.expires_at || new Date(e.expires_at) > new Date()
    ).map(e => {
      const baseDate = e.approved_at || e.unlocked_at || e.created_at;
      const fallbackDue = baseDate ? (() => {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + 1);
        return due.toISOString();
      })() : null;

      const effectiveDue = e.next_payment_due || fallbackDue;

      let days_remaining = null;
      let is_overdue = false;
      
      if (effectiveDue) {
        const dueDate = new Date(effectiveDue);
        const diffTime = dueDate.getTime() - now.getTime();
        days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        is_overdue = days_remaining < 0;
      }

      const effectiveStatus = e.monthly_payment_status || (effectiveDue ? (is_overdue ? 'overdue' : 'pending') : null);

      return {
        ...e,
        next_payment_due: effectiveDue,
        monthly_payment_status: effectiveStatus,
        days_remaining,
        is_overdue
      };
    });

    res.json({ enrollments: activeCourses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/enrollments/check-slug/:slug
 * Quick enrollment check by course slug (works with or without auth)
 */
router.get('/check-slug/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Get course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, title')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!req.user) {
      return res.json({
        enrolled: false,
        isEnrolled: false,
        course: { id: course.id, slug: course.slug, title: course.title },
        requiresLogin: true,
      });
    }

    // Check enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status, expires_at')
      .eq('user_id', req.user.id)
      .eq('course_id', course.id)
      .in('status', ['active', 'approved'])
      .single();

    const isEnrolled = enrollment && 
      (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());

    res.json({
      enrolled: isEnrolled,
      isEnrolled,
      course: { id: course.id, slug: course.slug, title: course.title },
      user_code: req.user.user_code,
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/enrollments/check
 * Check enrollment status by email (legacy endpoint)
 */
router.get('/check', async (req, res) => {
  try {
    const { email, courseId } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let query = supabase
      .from('enrollments')
      .select('id, course_id, status, created_at, courses(title)')
      .eq('email', email.toLowerCase());

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: enrollments, error } = await query;

    if (error) {
      console.error('Check enrollment error:', error);
      return res.status(500).json({ error: 'Failed to check enrollment' });
    }

    res.json({ enrollments });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/enrollments/verify/:token
 * Verify access token and get enrollment info
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data: access, error } = await supabase
      .from('course_access')
      .select(`
        *,
        enrollments (
          id,
          name,
          email,
          course_id,
          courses (id, title, description)
        )
      `)
      .eq('access_token', token)
      .single();

    if (error || !access) {
      return res.status(404).json({ error: 'Invalid access token' });
    }

    // Check expiration
    if (new Date(access.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Access token has expired' });
    }

    // Check if revoked
    if (access.status !== 'active') {
      return res.status(401).json({ error: 'Access has been revoked' });
    }

    const needsPasswordSetup = !access.first_accessed_at;

    res.json({
      valid: true,
      needsPasswordSetup,
      enrollment: {
        name: access.enrollments.name,
        email: access.enrollments.email,
        course: access.enrollments.courses,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
