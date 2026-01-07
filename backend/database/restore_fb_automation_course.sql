-- Restore Facebook Automation Mastery Course
-- Run this in Supabase SQL Editor

-- Insert the course
INSERT INTO courses (
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
  status,
  created_at
) VALUES (
  'fb-automation-mastery',
  'Facebook Automation Mastery',
  'Master Facebook automation and organic growth strategies to monetize your page.',
  'Complete guide to automating Facebook page growth and monetizing organically without ads. Learn proven strategies that have helped 3,000+ students grow their pages.',
  4999,
  9999,
  'Social Media',
  'Beginner',
  12,
  NULL,
  NULL,
  5.0,
  0,
  '["Understand Facebook algorithm and content distribution", "Set up automated posting and engagement", "Grow followers organically without ads", "Avoid account restrictions and bans", "Monetize your page through multiple streams"]'::jsonb,
  '["A Facebook account", "Basic computer skills", "2-3 hours per week commitment"]'::jsonb,
  'published',
  NOW()
) RETURNING id;

-- Note: After running the above, copy the returned course ID and use it below
-- Replace 'YOUR_COURSE_ID_HERE' with the actual UUID returned

-- Insert Module 1: Introduction to Facebook Automation
INSERT INTO course_modules (
  course_id,
  title,
  description,
  order_index,
  duration_minutes
) VALUES (
  'YOUR_COURSE_ID_HERE',
  'Introduction to Facebook Automation',
  'Get started with Facebook automation basics',
  1,
  90
) RETURNING id;

-- Insert lessons for Module 1 (replace MODULE_ID with returned ID)
INSERT INTO course_lessons (
  module_id,
  title,
  content,
  video_url,
  order_index,
  duration_minutes,
  lesson_type,
  is_free_preview
) VALUES 
(
  'MODULE_1_ID',
  'Understanding Facebook Algorithm',
  '<p>Learn how the Facebook algorithm works and how to leverage it for organic reach.</p>',
  NULL,
  1,
  30,
  'video',
  false
),
(
  'MODULE_1_ID',
  'Setting Up Your Automation Tools',
  '<p>Step-by-step guide to setting up automation tools safely.</p>',
  NULL,
  2,
  30,
  'video',
  false
);

-- Insert Module 2: Content Strategy
INSERT INTO course_modules (
  course_id,
  title,
  description,
  order_index,
  duration_minutes
) VALUES (
  'YOUR_COURSE_ID_HERE',
  'Setting Up Your Facebook Account',
  'Optimize your account for automation',
  2,
  105
) RETURNING id;

-- Insert Module 3: Automation Tools
INSERT INTO course_modules (
  course_id,
  title,
  description,
  order_index,
  duration_minutes
) VALUES (
  'YOUR_COURSE_ID_HERE',
  'Content Strategy',
  'Create engaging content that converts',
  3,
  90
) RETURNING id;

-- Insert Module 4: Monetization Strategies
INSERT INTO course_modules (
  course_id,
  title,
  description,
  order_index,
  duration_minutes
) VALUES (
  'YOUR_COURSE_ID_HERE',
  'Automation Tools',
  'Master the best automation tools',
  4,
  135
) RETURNING id;

-- Insert Module 5: Scaling & Growth
INSERT INTO course_modules (
  course_id,
  title,
  description,
  order_index,
  duration_minutes
) VALUES (
  'YOUR_COURSE_ID_HERE',
  'Monetization Strategies',
  'Turn your page into a revenue stream',
  5,
  120
) RETURNING id;
