-- =============================================================================
-- Darwin Education - Updated Database Schema for JWT Auth & Manual Enrollment
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- Stores all user accounts with role-based access (student, admin, instructor)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Human-readable User ID for admin reference (e.g., "USR-001234")
  user_code VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  -- Role determines access level: student (default), admin, instructor
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  -- Tracks if user has set their own password (false = needs password setup)
  password_set BOOLEAN DEFAULT true,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate user_code on insert
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a human-readable code like "USR-001234"
  NEW.user_code := 'USR-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING(user_code FROM 5) AS INTEGER)), 0) + 1 FROM users)::TEXT,
    6, '0'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_code
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.user_code IS NULL)
  EXECUTE FUNCTION generate_user_code();

-- =============================================================================
-- COURSES TABLE
-- Stores course information with pricing and status
-- =============================================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- URL-friendly slug for course pages (e.g., "fb-automation-mastery")
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  -- Short description for cards/previews
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  -- Original price for showing discounts
  original_price DECIMAL(10, 2),
  category VARCHAR(100) DEFAULT 'General',
  level VARCHAR(50) DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_hours INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  -- Course status: draft (hidden), published (visible), archived (hidden but preserved)
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  rating DECIMAL(2, 1) DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  -- What students will learn (JSON array of strings)
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  -- Course requirements/prerequisites (JSON array of strings)
  requirements JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- COURSE MODULES TABLE
-- Sections within a course (e.g., "Module 1: Introduction")
-- =============================================================================
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  -- Order in which modules appear (0, 1, 2, etc.)
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- COURSE LESSONS TABLE
-- Individual lessons within modules
-- =============================================================================
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  -- Lesson content (can be markdown/HTML)
  content TEXT,
  video_url TEXT,
  -- Order within the module
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  -- Free preview lessons can be viewed without enrollment
  is_free_preview BOOLEAN DEFAULT false,
  -- Lesson type: video, text, quiz, assignment
  lesson_type VARCHAR(20) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
  -- Additional resources (JSON array of {title, url, type})
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ENROLLMENTS TABLE
-- Tracks which users have access to which courses
-- Admin manually creates enrollments to grant course access
-- =============================================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- User who has access to the course
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  -- Course they have access to
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  -- Admin who granted access
  unlocked_by_admin_id UUID REFERENCES users(id),
  -- When access was granted
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  -- Enrollment status: active (can access), expired (time-limited access ended), revoked (manually removed)
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  -- Optional: when enrollment expires (NULL = lifetime access)
  expires_at TIMESTAMPTZ,
  -- Notes from admin about this enrollment
  admin_notes TEXT,
  -- Payment reference if applicable
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate enrollments
  UNIQUE(user_id, course_id)
);

-- =============================================================================
-- COURSE PROGRESS TABLE
-- Tracks user progress through course lessons
-- =============================================================================
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  -- Has the user completed this lesson?
  completed BOOLEAN DEFAULT false,
  -- Progress percentage (0-100)
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  -- Last video position in seconds
  last_position INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One progress record per user per lesson
  UNIQUE(user_id, lesson_id)
);

-- =============================================================================
-- USER SESSIONS TABLE
-- Tracks active user sessions for security
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- JWT token ID for invalidation
  token_id VARCHAR(255) UNIQUE NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_lesson ON course_progress(lesson_id);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at timestamp on row changes
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON course_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert default admin user (password: Pislis@123 - CHANGE IN PRODUCTION!)
INSERT INTO users (name, email, password, role, password_set)
VALUES (
  'Admin',
  'pisliskontint@gmail.com',
  '$2a$12$aHnSBkxOHTLiNY0ecKS3s.09r1CV0qtCdKwOeIu00ZX3SrfFFsGBC', -- bcrypt hash for 'Pislis@123'
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample course
INSERT INTO courses (slug, title, short_description, description, price, original_price, category, level, duration_hours, status, learning_outcomes, requirements)
VALUES (
  'fb-automation-mastery',
  'Facebook Automation Mastery',
  'Master Facebook automation and organic growth strategies to monetize your page.',
  'Complete guide to automating Facebook page growth and monetizing organically without ads. Learn proven strategies that have helped 3,200+ students grow their pages.',
  4999,
  7999,
  'Social Media',
  'Beginner',
  12,
  'published',
  '["Understand Facebook algorithm and content distribution", "Set up automated posting and engagement", "Grow followers organically without ads", "Monetize your page through multiple streams", "Avoid account restrictions and bans"]'::jsonb,
  '["A Facebook account", "Basic computer skills", "2-3 hours per week commitment"]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample modules for the course
INSERT INTO course_modules (course_id, title, description, order_index, duration_minutes)
SELECT 
  c.id,
  m.title,
  m.description,
  m.order_index,
  m.duration_minutes
FROM courses c
CROSS JOIN (
  VALUES 
    ('Introduction to Facebook Automation', 'Learn the basics of Facebook automation and what this course covers', 0, 30),
    ('Setting Up Your Facebook Account', 'Create and optimize your Facebook account for maximum reach', 1, 45),
    ('Content Strategy', 'Develop a winning content strategy that attracts followers', 2, 60),
    ('Automation Tools', 'Master the tools that will automate your workflow', 3, 90),
    ('Monetization Strategies', 'Turn your followers into income through multiple revenue streams', 4, 75)
) AS m(title, description, order_index, duration_minutes)
WHERE c.slug = 'fb-automation-mastery'
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO course_lessons (module_id, title, content, order_index, duration_minutes, is_free_preview, lesson_type)
SELECT 
  cm.id,
  l.title,
  l.content,
  l.order_index,
  l.duration_minutes,
  l.is_free_preview,
  l.lesson_type
FROM course_modules cm
JOIN courses c ON cm.course_id = c.id
CROSS JOIN (
  VALUES 
    ('Introduction to Facebook Automation', 0, 0, 'Welcome to the course', 'Welcome to Facebook Automation Mastery! In this lesson, we will cover what you will learn.', 10, true, 'video'),
    ('Introduction to Facebook Automation', 0, 1, 'Course Overview', 'A detailed overview of all modules and what to expect.', 15, true, 'video'),
    ('Setting Up Your Facebook Account', 1, 0, 'Creating a Safe Account', 'Learn how to create a Facebook account that won''t get restricted.', 20, false, 'video'),
    ('Setting Up Your Facebook Account', 1, 1, 'Profile Optimization', 'Optimize your profile for maximum credibility and reach.', 15, false, 'video'),
    ('Content Strategy', 2, 0, 'Finding Your Niche', 'Discover the perfect niche for your Facebook page.', 25, false, 'video'),
    ('Content Strategy', 2, 1, 'Content Calendar', 'Create a content calendar that drives engagement.', 20, false, 'video'),
    ('Automation Tools', 3, 0, 'Tool Overview', 'Overview of the best automation tools available.', 30, false, 'video'),
    ('Automation Tools', 3, 1, 'Setting Up Automation', 'Step-by-step guide to setting up your automation workflow.', 45, false, 'video'),
    ('Monetization Strategies', 4, 0, 'Ad Revenue', 'How to qualify for and maximize Facebook ad revenue.', 30, false, 'video'),
    ('Monetization Strategies', 4, 1, 'Affiliate Marketing', 'Leverage your audience for affiliate income.', 25, false, 'video')
) AS l(module_title, module_order, order_index, title, content, duration_minutes, is_free_preview, lesson_type)
WHERE c.slug = 'fb-automation-mastery' AND cm.order_index = l.module_order
ON CONFLICT DO NOTHING;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if a user is enrolled in a course
CREATE OR REPLACE FUNCTION is_user_enrolled(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments
    WHERE user_id = p_user_id
      AND course_id = p_course_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's course progress percentage
CREATE OR REPLACE FUNCTION get_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons
  FROM course_lessons cl
  JOIN course_modules cm ON cl.module_id = cm.id
  WHERE cm.course_id = p_course_id;
  
  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO completed_lessons
  FROM course_progress cp
  JOIN course_lessons cl ON cp.lesson_id = cl.id
  JOIN course_modules cm ON cl.module_id = cm.id
  WHERE cp.user_id = p_user_id
    AND cm.course_id = p_course_id
    AND cp.completed = true;
  
  RETURN (completed_lessons * 100 / total_lessons);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (Optional but recommended for Supabase)
-- =============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data (unless admin)
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

-- Enrollments visible to the enrolled user or admins
CREATE POLICY enrollments_select_own ON enrollments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Progress visible to the user who made it
CREATE POLICY progress_select_own ON course_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role can do everything (for backend API)
CREATE POLICY service_role_all ON users FOR ALL USING (true);
CREATE POLICY service_role_all_enrollments ON enrollments FOR ALL USING (true);
CREATE POLICY service_role_all_progress ON course_progress FOR ALL USING (true);
