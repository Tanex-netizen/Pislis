-- =============================================================================
-- MIGRATION: Fix Security Advisor Warnings
-- Date: 2026-01-26
-- Issues: 
--   1. Function search_path not set (4 functions)
--   2. RLS policies with USING(true) not scoped to service_role (3 policies)
-- =============================================================================

-- =============================================================================
-- FIX 1: Set search_path on all functions to prevent injection attacks
-- =============================================================================

-- Fix generate_user_code function
ALTER FUNCTION public.generate_user_code() SET search_path = public;

-- Fix update_updated_at_column function  
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Fix is_user_enrolled function
ALTER FUNCTION public.is_user_enrolled(UUID, UUID) SET search_path = public;

-- Fix get_course_progress function
ALTER FUNCTION public.get_course_progress(UUID, UUID) SET search_path = public;

-- =============================================================================
-- FIX 2: Replace overly permissive RLS policies with properly scoped ones
-- The old policies applied to ALL roles, we need them to apply ONLY to service_role
-- =============================================================================

-- Drop the old permissive policies
DROP POLICY IF EXISTS service_role_all ON users;
DROP POLICY IF EXISTS service_role_all_enrollments ON enrollments;
DROP POLICY IF EXISTS service_role_all_progress ON course_progress;

-- Recreate with proper service_role scoping
CREATE POLICY service_role_all ON users 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY service_role_all_enrollments ON enrollments 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY service_role_all_progress ON course_progress 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- =============================================================================
-- VERIFICATION QUERIES (run after migration)
-- =============================================================================
-- Check functions have search_path set:
-- SELECT proname, proconfig 
-- FROM pg_proc 
-- WHERE proname IN ('generate_user_code', 'update_updated_at_column', 'is_user_enrolled', 'get_course_progress');
-- Expected: proconfig should show search_path=public

-- Check RLS policies are scoped to service_role:
-- SELECT policyname, roles 
-- FROM pg_policies 
-- WHERE policyname LIKE 'service_role%';
-- Expected: roles should show {service_role}
