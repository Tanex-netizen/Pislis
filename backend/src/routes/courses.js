const express = require('express');
const supabase = require('../config/supabase');
const { verifyToken, verifyAdmin, verifyCourseAccess, optionalAuth, verifyEnrollment } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/courses
 * Get all published courses (public)
 */
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;

    let query = supabase
      .from('courses')
      .select('id, slug, title, short_description, description, price, original_price, category, level, duration_hours, thumbnail_url, rating, total_students')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (level) {
      query = query.eq('level', level);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('Get courses error:', error);
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/courses/slug/:slug
 * Get course overview by slug (public - for course landing page)
 * Shows course info, syllabus outline, but not full lesson content
 */
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        slug,
        title,
        short_description,
        description,
        price,
        original_price,
        category,
        level,
        duration_hours,
        thumbnail_url,
        preview_video_url,
        rating,
        total_students,
        learning_outcomes,
        requirements,
        course_modules (
          id,
          title,
          description,
          order_index,
          duration_minutes,
          course_lessons (
            id,
            title,
            duration_minutes,
            is_free_preview,
            lesson_type
          )
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Sort modules and lessons
    if (course.course_modules) {
      course.course_modules.sort((a, b) => a.order_index - b.order_index);
      course.course_modules.forEach(module => {
        if (module.course_lessons) {
          module.course_lessons.sort((a, b) => a.order_index - b.order_index);
        }
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status, expires_at')
        .eq('user_id', req.user.id)
        .eq('course_id', course.id)
        .in('status', ['active', 'approved'])
        .single();

      isEnrolled = enrollment && (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());
    }

    res.json({ 
      course,
      isEnrolled,
      user: req.user ? { id: req.user.id, user_code: req.user.user_code } : null
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/courses/:courseId/content
 * Get full course content (protected - requires enrollment)
 * This is what enrolled users see on the /learn page
 */
router.get('/:courseId/content', verifyToken, verifyEnrollment, async (req, res) => {
  try {
    const { courseId } = req.params;

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        slug,
        title,
        description,
        duration_hours,
        course_modules (
          id,
          title,
          description,
          order_index,
          duration_minutes,
          course_lessons (
            id,
            title,
            content,
            video_url,
            order_index,
            duration_minutes,
            lesson_type,
            resources
          )
        )
      `)
      .eq('id', courseId)
      .single();

    if (error || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Sort modules and lessons
    if (course.course_modules) {
      course.course_modules.sort((a, b) => a.order_index - b.order_index);
      course.course_modules.forEach(module => {
        if (module.course_lessons) {
          module.course_lessons.sort((a, b) => a.order_index - b.order_index);
        }
      });
    }

    // Get user's progress for this course
    const { data: progress } = await supabase
      .from('course_progress')
      .select('lesson_id, completed, progress_percent, last_position')
      .eq('user_id', req.user.id)
      .eq('course_id', courseId);

    // Convert progress to lookup map
    const progressMap = {};
    (progress || []).forEach(p => {
      progressMap[p.lesson_id] = p;
    });

    res.json({ 
      course,
      progress: progressMap,
      enrollment: req.enrollment
    });
  } catch (error) {
    console.error('Get course content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/courses/:courseId/lesson/:lessonId
 * Get single lesson content (protected)
 */
router.get('/:courseId/lesson/:lessonId', verifyToken, verifyEnrollment, async (req, res) => {
  try {
    const { lessonId } = req.params;

    const { data: lesson, error } = await supabase
      .from('course_lessons')
      .select(`
        id,
        title,
        content,
        video_url,
        duration_minutes,
        lesson_type,
        resources,
        course_modules (
          id,
          title,
          course_id
        )
      `)
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get user's progress for this lesson
    const { data: progress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('lesson_id', lessonId)
      .single();

    res.json({ lesson, progress });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/courses/:courseId/progress
 * Update lesson progress
 */
router.post('/:courseId/progress', verifyToken, verifyEnrollment, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, completed, progressPercent, lastPosition } = req.body;

    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID is required' });
    }

    // Upsert progress
    const { data: progress, error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: req.user.id,
        course_id: courseId,
        lesson_id: lessonId,
        completed: completed || false,
        progress_percent: progressPercent || 0,
        last_position: lastPosition || 0,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,lesson_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Update progress error:', error);
      return res.status(500).json({ error: 'Failed to update progress' });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/courses/user/enrolled
 * Get user's enrolled courses (with progress)
 */
router.get('/user/enrolled', verifyToken, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
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
          duration_hours
        )
      `)
      .eq('user_id', req.user.id)
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get enrolled courses error:', error);
      return res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }

    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/courses (Admin only)
 * Create new course
 */
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, price, category, level, duration, thumbnail_url } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required' });
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        price,
        category: category || 'General',
        level: level || 'Beginner',
        duration_hours: duration || 0,
        thumbnail_url,
        status: 'draft',
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create course error:', error);
      return res.status(500).json({ error: 'Failed to create course' });
    }

    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
