const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { sendEnrollmentLink } = require('../config/email');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, verifyAdmin);

/**
 * GET /api/admin/enrollments
 * Get all enrollments (with filters)
 */
router.get('/enrollments', async (req, res) => {
  try {
    const { status, courseId, search } = req.query;

    let query = supabase
      .from('enrollments')
      .select(`
        *,
        courses (id, title, price)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: enrollments, error } = await query;

    if (error) {
      console.error('Get enrollments error:', error);
      return res.status(500).json({ error: 'Failed to fetch enrollments' });
    }

    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/enrollments/:id
 * Get single enrollment details
 */
router.get('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (id, title, price, description),
        course_access (id, access_token, status, expires_at, first_accessed_at, last_accessed_at)
      `)
      .eq('id', id)
      .single();

    if (error || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ enrollment });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/enrollments/:id/approve
 * Approve enrollment and generate access link
 */
router.post('/enrollments/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresInDays = 365 } = req.body; // Default 1 year access

    // Get enrollment
    const { data: enrollment, error: getError } = await supabase
      .from('enrollments')
      .select('*, courses(id, title)')
      .eq('id', id)
      .single();

    if (getError || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.status === 'approved') {
      return res.status(400).json({ error: 'Enrollment already approved' });
    }

    if (!enrollment.course_id || !enrollment.courses?.title) {
      return res.status(400).json({
        error: 'Course not assigned for this request. Use the Unlock Course tool to grant access.',
      });
    }

    // Check if user exists, if not create one
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', enrollment.email)
      .single();

    if (!user) {
      // Create user without password (they'll set it on first access)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: enrollment.name,
          email: enrollment.email,
          phone: enrollment.phone,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Temporary random password
          role: 'student',
          password_set: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('Create user error:', createError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
      user = newUser;
    }

    // Generate unique access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Calculate next monthly payment due date (1 month from approval)
    const nextPaymentDue = new Date();
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);

    // Update enrollment status
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'approved',
        user_id: user.id,
        approved_at: new Date().toISOString(),
        approved_by: req.user.id,
        next_payment_due: nextPaymentDue.toISOString(),
        monthly_payment_status: 'pending',
        last_payment_date: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Update enrollment error:', updateError);
      return res.status(500).json({ error: 'Failed to approve enrollment' });
    }

    // Create course access record
    const { data: courseAccess, error: accessError } = await supabase
      .from('course_access')
      .insert({
        enrollment_id: id,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (accessError) {
      console.error('Create access error:', accessError);
      return res.status(500).json({ error: 'Failed to create access token' });
    }

    // Send email with access link
    try {
      await sendEnrollmentLink(
        enrollment.email,
        enrollment.name,
        enrollment.courses.title,
        accessToken
      );
    } catch (emailError) {
      console.warn('Failed to send enrollment email:', emailError.message);
      // Don't fail the request, admin can resend manually
    }

    res.json({
      message: 'Enrollment approved successfully',
      accessToken,
      accessUrl: `${process.env.FRONTEND_URL}/access/${accessToken}`,
    });
  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/enrollments/:id/reject
 * Reject enrollment
 */
router.post('/enrollments/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: enrollment, error: getError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (getError || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.status !== 'pending') {
      return res.status(400).json({ error: 'Can only reject pending enrollments' });
    }

    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
        rejected_at: new Date().toISOString(),
        rejected_by: req.user.id,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Reject enrollment error:', updateError);
      return res.status(500).json({ error: 'Failed to reject enrollment' });
    }

    res.json({ message: 'Enrollment rejected' });
  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/enrollments/:id/resend-link
 * Resend access link email
 */
router.post('/enrollments/:id/resend-link', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses(title),
        course_access(access_token)
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error || !enrollment) {
      return res.status(404).json({ error: 'Approved enrollment not found' });
    }

    if (!enrollment.course_access || !enrollment.course_access.access_token) {
      return res.status(400).json({ error: 'No access token found' });
    }

    await sendEnrollmentLink(
      enrollment.email,
      enrollment.name,
      enrollment.courses.title,
      enrollment.course_access.access_token
    );

    res.json({ message: 'Access link sent successfully' });
  } catch (error) {
    console.error('Resend link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/enrollments/:id/revoke
 * Revoke course access
 */
router.post('/enrollments/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { error } = await supabase
      .from('course_access')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_reason: reason || null,
      })
      .eq('enrollment_id', id);

    if (error) {
      console.error('Revoke access error:', error);
      return res.status(500).json({ error: 'Failed to revoke access' });
    }

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get enrollment counts by status
    const { data: pendingCount } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    const { data: approvedCount } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('status', 'approved');

    const { data: totalCourses } = await supabase
      .from('courses')
      .select('id', { count: 'exact' });

    const { data: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'student');

    // Get recent enrollments
    const { data: recentEnrollments } = await supabase
      .from('enrollments')
      .select('id, name, email, status, created_at, courses(title)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      stats: {
        pendingEnrollments: pendingCount?.length || 0,
        approvedEnrollments: approvedCount?.length || 0,
        totalCourses: totalCourses?.length || 0,
        totalStudents: totalUsers?.length || 0,
      },
      recentEnrollments,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS (for manual course unlocking)
// ============================================================================

/**
 * GET /api/admin/users
 * Search and list users
 * Query: search (user_code, name, or email)
 */
router.get('/users', async (req, res) => {
  try {
    const { search, loggedInOnly, page = 1, limit = 20, includeEnrollments } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNumber - 1) * limitNumber;

    let query = supabase
      .from('users')
      .select('id, user_code, name, email, phone, role, created_at, last_login', { count: 'exact' })
      .order('last_login', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    if (loggedInOnly === 'true' || loggedInOnly === true) {
      query = query.not('last_login', 'is', null);
    }

    if (search) {
      // Search by user_code, name, or email
      query = query.or(`user_code.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // If includeEnrollments is true, fetch enrollment details for each user
    let usersWithEnrollments = users || [];
    if (includeEnrollments === 'true' && users && users.length > 0) {
      const userIds = users.map(u => u.id);
      
      // Get enrollment details for all users
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          id,
          user_id,
          status,
          course_id,
          courses (id, title)
        `)
        .in('user_id', userIds);

      // Map enrollments to users
      usersWithEnrollments = users.map(user => {
        const userEnrollments = (enrollments || []).filter(e => e.user_id === user.id);
        return {
          ...user,
          enrollments: userEnrollments,
          pending_enrollments: userEnrollments.filter(e => e.status === 'pending').length,
          approved_enrollments: userEnrollments.filter(e => e.status === 'active' || e.status === 'approved').length,
          total_enrollments: userEnrollments.length
        };
      });
    }

    res.json({ 
      users: usersWithEnrollments, 
      total: count,
      page: pageNumber,
      totalPages: Math.ceil((count || 0) / limitNumber)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/users/:userCode
 * Get user by user_code (human-readable ID)
 */
router.get('/users/:userCode', async (req, res) => {
  try {
    const { userCode } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, 
        user_code, 
        name, 
        email, 
        phone,
        role, 
        created_at,
        last_login
      `)
      .eq('user_code', userCode.toUpperCase())
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        unlocked_at,
        expires_at,
        courses (id, slug, title)
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    res.json({ 
      user,
      enrollments: enrollments || []
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/courses
 * Get all courses for dropdown selection
 */
router.get('/courses', async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, slug, title, price, status')
      .order('title', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }

    res.json({ courses: courses || [] });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/unlock-course
 * Manually unlock a course for a user
 * This is the main endpoint for admin to grant course access
 * 
 * Request body: { userId, courseId, expiresAt?, notes?, paymentReference? }
 */
router.post('/unlock-course', async (req, res) => {
  try {
    const { userId, courseId, expiresAt, notes, paymentReference } = req.body;

    // Validation
    if (!userId || !courseId) {
      return res.status(400).json({ error: 'User ID and Course ID are required' });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, user_code, name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        return res.status(400).json({ error: 'User is already enrolled in this course' });
      }
      
      // Reactivate existing enrollment
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          status: 'active',
          unlocked_by_admin_id: req.user.id,
          unlocked_at: new Date().toISOString(),
          expires_at: expiresAt || null,
          admin_notes: notes || null,
          payment_reference: paymentReference || null,
        })
        .eq('id', existingEnrollment.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to reactivate enrollment' });
      }

      return res.json({
        message: `Course "${course.title}" reactivated for ${user.name}`,
        enrollment_id: existingEnrollment.id
      });
    }

    // Create new enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        unlocked_by_admin_id: req.user.id,
        unlocked_at: new Date().toISOString(),
        status: 'active',
        expires_at: expiresAt || null,
        admin_notes: notes || null,
        payment_reference: paymentReference || null,
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Create enrollment error:', enrollError);
      return res.status(500).json({ error: 'Failed to create enrollment' });
    }

    // Update course total_students count
    await supabase
      .from('courses')
      .update({ total_students: course.total_students + 1 })
      .eq('id', courseId);

    res.status(201).json({
      message: `Course "${course.title}" unlocked for ${user.name} (${user.user_code})`,
      enrollment: {
        id: enrollment.id,
        user: { id: user.id, user_code: user.user_code, name: user.name, email: user.email },
        course: { id: course.id, title: course.title },
        unlocked_at: enrollment.unlocked_at,
        expires_at: enrollment.expires_at,
        status: enrollment.status
      }
    });
  } catch (error) {
    console.error('Unlock course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/revoke-enrollment
 * Revoke a user's course enrollment
 * 
 * Request body: { enrollmentId, reason? }
 */
router.post('/revoke-enrollment', async (req, res) => {
  try {
    const { enrollmentId, reason } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    const { data: enrollment, error: getError } = await supabase
      .from('enrollments')
      .select('id, user_id, course_id, users(name), courses(title)')
      .eq('id', enrollmentId)
      .single();

    if (getError || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'revoked',
        admin_notes: reason ? `Revoked: ${reason}` : 'Revoked by admin'
      })
      .eq('id', enrollmentId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to revoke enrollment' });
    }

    res.json({ 
      message: `Enrollment revoked for ${enrollment.users.name} - ${enrollment.courses.title}` 
    });
  } catch (error) {
    console.error('Revoke enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// MONTHLY PAYMENT TRACKING ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/monthly-payments
 * Get all enrollments with monthly payment status
 */
router.get('/monthly-payments', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        name,
        email,
        phone,
        status,
        approved_at,
        monthly_payment_amount,
        last_payment_date,
        next_payment_due,
        monthly_payment_status,
        courses (id, title),
        users (id, user_code, name, email)
      `)
      .eq('status', 'approved')
      .order('next_payment_due', { ascending: true, nullsFirst: false });

    if (status && status !== 'all') {
      query = query.eq('monthly_payment_status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error('Get monthly payments error:', error);
      return res.status(500).json({ error: 'Failed to fetch monthly payments' });
    }

    // Calculate days remaining for each payment
    const now = new Date();
    const paymentsWithTimer = (payments || []).map(payment => {
      let daysRemaining = null;
      let isOverdue = false;
      
      if (payment.next_payment_due) {
        const dueDate = new Date(payment.next_payment_due);
        const diffTime = dueDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysRemaining < 0;
      }

      return {
        ...payment,
        days_remaining: daysRemaining,
        is_overdue: isOverdue
      };
    });

    res.json({ payments: paymentsWithTimer });
  } catch (error) {
    console.error('Get monthly payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/monthly-payments/:enrollmentId/mark-paid
 * Mark monthly payment as paid and extend to next month
 */
router.post('/monthly-payments/:enrollmentId/mark-paid', async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const { data: enrollment, error: getError } = await supabase
      .from('enrollments')
      .select('*, users(name), courses(title)')
      .eq('id', enrollmentId)
      .single();

    if (getError || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Calculate next payment due date (1 month from now or from current due date if still in future)
    const now = new Date();
    let nextDue;
    
    if (enrollment.next_payment_due) {
      const currentDue = new Date(enrollment.next_payment_due);
      // If current due date is in the future, add 1 month to it
      // Otherwise, add 1 month from now
      if (currentDue > now) {
        nextDue = new Date(currentDue);
      } else {
        nextDue = new Date(now);
      }
    } else {
      nextDue = new Date(now);
    }
    nextDue.setMonth(nextDue.getMonth() + 1);

    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        last_payment_date: now.toISOString(),
        next_payment_due: nextDue.toISOString(),
        monthly_payment_status: 'paid'
      })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error('Mark paid error:', updateError);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    res.json({
      message: `Payment marked as paid for ${enrollment.users?.name || enrollment.name}`,
      next_payment_due: nextDue.toISOString()
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/monthly-payments/:enrollmentId/mark-unpaid
 * Mark monthly payment as unpaid/pending
 */
router.post('/monthly-payments/:enrollmentId/mark-unpaid', async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const { data: enrollment, error: getError } = await supabase
      .from('enrollments')
      .select('*, users(name)')
      .eq('id', enrollmentId)
      .single();

    if (getError || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Determine if it's overdue or pending
    const now = new Date();
    let status = 'pending';
    if (enrollment.next_payment_due) {
      const dueDate = new Date(enrollment.next_payment_due);
      if (dueDate < now) {
        status = 'overdue';
      }
    }

    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        monthly_payment_status: status
      })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error('Mark unpaid error:', updateError);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    res.json({
      message: `Payment marked as ${status} for ${enrollment.users?.name || enrollment.name}`
    });
  } catch (error) {
    console.error('Mark unpaid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
