-- Lesson Comments + Replies + Reactions Migration
-- Run this in your Supabase SQL editor

-- Main comments table (replies use parent_id)
CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS lesson_comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES lesson_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍','❤️','😂','😮','🔥','🙏')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_id ON lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent_id ON lesson_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user_id ON lesson_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comment_reactions_comment_id ON lesson_comment_reactions(comment_id);

-- RLS
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON lesson_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON lesson_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update comments" ON lesson_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete comments" ON lesson_comments FOR DELETE USING (true);

CREATE POLICY "Anyone can read reactions" ON lesson_comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can insert reactions" ON lesson_comment_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete reactions" ON lesson_comment_reactions FOR DELETE USING (true);
