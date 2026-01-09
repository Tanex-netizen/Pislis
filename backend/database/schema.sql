-- Darwin Education Database Schema for Supabase
-- Run this in the Supabase SQL Editor































CREATE INDEX IF NOT EXISTS idx_enrollments_next_payment_due ON enrollments(next_payment_due);CREATE INDEX IF NOT EXISTS idx_enrollments_monthly_payment_status ON enrollments(monthly_payment_status);-- Create index for monthly payment status queriesWHERE status = 'approved' AND next_payment_due IS NULL AND approved_at IS NOT NULL;    END      ELSE 'pending'      WHEN approved_at + INTERVAL '1 month' < NOW() THEN 'overdue'    monthly_payment_status = CASE SET next_payment_due = approved_at + INTERVAL '1 month',UPDATE enrollments -- Update existing approved enrollments to set next_payment_due based on approved_atEND $$;  WHEN duplicate_object THEN NULL;EXCEPTION  CHECK (monthly_payment_status IN ('paid', 'pending', 'overdue'));  ADD CONSTRAINT enrollments_monthly_payment_status_check   ALTER TABLE enrollments BEGINDO $$-- Add constraint for monthly_payment_statusADD COLUMN IF NOT EXISTS monthly_payment_status VARCHAR(20) DEFAULT 'pending';ADD COLUMN IF NOT EXISTS next_payment_due TIMESTAMPTZ,ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,ADD COLUMN IF NOT EXISTS monthly_payment_amount DECIMAL(10, 2) DEFAULT 100,ALTER TABLE enrollments -- Add monthly payment tracking columns to enrollments table
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  password_set BOOLEAN DEFAULT true,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category VARCHAR(100) DEFAULT 'General',
  level VARCHAR(50) DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_hours INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  rating DECIMAL(2, 1) DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course modules (sections within a course)
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons (individual lessons within modules)
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table (enrollment requests)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  payment_proof_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  -- Monthly payment tracking fields
  monthly_payment_amount DECIMAL(10, 2) DEFAULT 100,
  last_payment_date TIMESTAMPTZ,
  next_payment_due TIMESTAMPTZ,
  monthly_payment_status VARCHAR(20) DEFAULT 'pending' CHECK (monthly_payment_status IN ('paid', 'pending', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course access tokens (secure access links)
CREATE TABLE IF NOT EXISTS course_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  device_fingerprint TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions (for device tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course progress (track user progress)
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percent INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
CREATE INDEX IF NOT EXISTS idx_course_access_token ON course_access(access_token);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user (change password in production!)
INSERT INTO users (name, email, password, role, password_set)
VALUES (
  'Admin',
  'pisliskontint@gmail.com',
  '$2a$12$aHnSBkxOHTLiNY0ecKS3s.09r1CV0qtCdKwOeIu00ZX3SrfFFsGBC', -- password: Pislis@123
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (title, description, price, category, level, duration_hours, status)
VALUES 
  (
    'Web Development Fundamentals',
    'Learn HTML, CSS, and JavaScript from scratch. Build responsive websites and understand the fundamentals of web development.',
    2999,
    'Development',
    'Beginner',
    24,
    'published'
  ),
  (
    'Advanced React & Next.js',
    'Master modern React patterns, hooks, context API, and server-side rendering with Next.js. Build production-ready applications.',
    3999,
    'Development',
    'Advanced',
    32,
    'published'
  ),
  (
    'UI/UX Design Masterclass',
    'Create stunning user interfaces and experiences using Figma. Learn design principles, prototyping, and user research.',
    3499,
    'Design',
    'Intermediate',
    28,
    'published'
  ),
  (
    'Digital Marketing Essentials',
    'Learn SEO, social media marketing, email marketing, and paid advertising strategies to grow any business online.',
    2499,
    'Marketing',
    'Beginner',
    20,
    'published'
  ),
  (
    'Data Science with Python',
    'Analyze data, create visualizations, and build machine learning models using Python, Pandas, and Scikit-learn.',
    4499,
    'Data Science',
    'Intermediate',
    40,
    'published'
  ),
  (
    'Mobile App Development',
    'Build iOS and Android apps with React Native. Learn to create, test, and publish apps to app stores.',
    4999,
    'Development',
    'Intermediate',
    36,
    'published'
  )
ON CONFLICT DO NOTHING;

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published courses
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
