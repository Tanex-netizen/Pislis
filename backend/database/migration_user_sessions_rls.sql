-- =============================================================================
-- MIGRATION: Enable RLS on user_sessions table
-- Date: 2026-01-26
-- Issue: user_sessions table was missing Row Level Security
-- =============================================================================

-- Enable RLS on user_sessions table
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR user_sessions
-- =============================================================================

-- Users can only SELECT their own sessions
CREATE POLICY user_sessions_select_own ON user_sessions
  FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = user_id::text);

-- Users can only INSERT sessions for themselves
CREATE POLICY user_sessions_insert_own ON user_sessions
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only UPDATE their own sessions
CREATE POLICY user_sessions_update_own ON user_sessions
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only DELETE their own sessions
CREATE POLICY user_sessions_delete_own ON user_sessions
  FOR DELETE 
  TO authenticated 
  USING (auth.uid()::text = user_id::text);

-- =============================================================================
-- SERVICE ROLE BYPASS
-- Allows the backend API (using service_role key) to manage all sessions
-- =============================================================================
CREATE POLICY service_role_all_sessions ON user_sessions 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- VERIFICATION QUERY (run after migration to confirm)
-- =============================================================================
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'user_sessions';
-- Expected result: rowsecurity = true
