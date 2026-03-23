/**
 * Lesson Comments Routes
 * Supports: list, post, reply, edit, delete, react
 */

const express = require('express');
const supabase = require('../config/supabase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const USER_SELECT = `id, lesson_id, parent_id, content, edited, created_at, user_id, users ( name, user_code, avatar_url, role )`;

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '🙏'];

/** GET /api/comments/:lessonId — all top-level + replies + reactions */
router.get('/:lessonId', verifyToken, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    if (isNaN(lessonId) || lessonId < 1) return res.status(400).json({ error: 'Invalid lesson ID' });

    const { data: comments, error } = await supabase
      .from('lesson_comments')
      .select(USER_SELECT)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: 'Failed to fetch comments' });

    // Fetch reactions for all comments in one query
    const commentIds = (comments || []).map(c => c.id);
    let reactions = [];
    if (commentIds.length > 0) {
      const { data: rxData } = await supabase
        .from('lesson_comment_reactions')
        .select('id, comment_id, user_id, emoji')
        .in('comment_id', commentIds);
      reactions = rxData || [];
    }

    // Attach reactions to each comment
    const reactionsByComment = {};
    for (const r of reactions) {
      if (!reactionsByComment[r.comment_id]) reactionsByComment[r.comment_id] = [];
      reactionsByComment[r.comment_id].push(r);
    }
    const enriched = (comments || []).map(c => ({ ...c, reactions: reactionsByComment[c.id] || [] }));

    res.json({ comments: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** POST /api/comments/:lessonId — new top-level comment */
router.post('/:lessonId', verifyToken, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    if (isNaN(lessonId) || lessonId < 1) return res.status(400).json({ error: 'Invalid lesson ID' });

    const { content } = req.body;
    const trimmed = (content || '').trim();
    if (!trimmed) return res.status(400).json({ error: 'Comment cannot be empty' });
    if (trimmed.length > 1000) return res.status(400).json({ error: 'Comment cannot exceed 1000 characters' });

    const { data: comment, error } = await supabase
      .from('lesson_comments')
      .insert({ lesson_id: lessonId, user_id: req.user.id, content: trimmed })
      .select(USER_SELECT)
      .single();

    if (error) return res.status(500).json({ error: 'Failed to post comment' });
    res.status(201).json({ comment: { ...comment, reactions: [] } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** POST /api/comments/:lessonId/reply/:parentId — reply to a comment */
router.post('/:lessonId/reply/:parentId', verifyToken, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const { parentId } = req.params;
    if (isNaN(lessonId) || lessonId < 1) return res.status(400).json({ error: 'Invalid lesson ID' });

    const { content } = req.body;
    const trimmed = (content || '').trim();
    if (!trimmed) return res.status(400).json({ error: 'Reply cannot be empty' });
    if (trimmed.length > 1000) return res.status(400).json({ error: 'Reply cannot exceed 1000 characters' });

    // Verify parent exists
    const { data: parent } = await supabase.from('lesson_comments').select('id').eq('id', parentId).single();
    if (!parent) return res.status(404).json({ error: 'Parent comment not found' });

    const { data: reply, error } = await supabase
      .from('lesson_comments')
      .insert({ lesson_id: lessonId, user_id: req.user.id, parent_id: parentId, content: trimmed })
      .select(USER_SELECT)
      .single();

    if (error) return res.status(500).json({ error: 'Failed to post reply' });
    res.status(201).json({ comment: { ...reply, reactions: [] } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** PATCH /api/comments/:commentId — edit own comment */
router.patch('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const trimmed = (content || '').trim();
    if (!trimmed) return res.status(400).json({ error: 'Content cannot be empty' });
    if (trimmed.length > 1000) return res.status(400).json({ error: 'Comment cannot exceed 1000 characters' });

    const { data: existing } = await supabase.from('lesson_comments').select('id, user_id').eq('id', commentId).single();
    if (!existing) return res.status(404).json({ error: 'Comment not found' });
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: updated, error } = await supabase
      .from('lesson_comments')
      .update({ content: trimmed, edited: true, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(USER_SELECT)
      .single();

    if (error) return res.status(500).json({ error: 'Failed to edit comment' });
    res.json({ comment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** DELETE /api/comments/:commentId — delete own comment (admin can delete any) */
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { data: existing } = await supabase.from('lesson_comments').select('id, user_id').eq('id', commentId).single();
    if (!existing) return res.status(404).json({ error: 'Comment not found' });
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { error } = await supabase.from('lesson_comments').delete().eq('id', commentId);
    if (error) return res.status(500).json({ error: 'Failed to delete comment' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** POST /api/comments/:commentId/react — toggle a reaction */
router.post('/:commentId/react', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;

    if (!ALLOWED_EMOJIS.includes(emoji)) {
      return res.status(400).json({ error: 'Invalid emoji' });
    }

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('lesson_comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', req.user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      // Toggle off
      await supabase.from('lesson_comment_reactions').delete().eq('id', existing.id);
      return res.json({ action: 'removed', emoji });
    } else {
      // Add reaction
      await supabase.from('lesson_comment_reactions').insert({ comment_id: commentId, user_id: req.user.id, emoji });
      return res.json({ action: 'added', emoji });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

/**
 * GET /api/comments/:lessonId
 * Get all comments for a lesson (all enrolled students can see)
 */
router.get('/:lessonId', verifyToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lessonIdNum = parseInt(lessonId, 10);

    if (isNaN(lessonIdNum) || lessonIdNum < 1) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    const { data: comments, error } = await supabase
      .from('lesson_comments')
      .select(`
        id,
        lesson_id,
        content,
        created_at,
        user_id,
        users (
          name,
          user_code,
          avatar_url,
          role
        )
      `)
      .eq('lesson_id', lessonIdNum)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    res.json({ comments: comments || [] });
  } catch (err) {
    console.error('Unexpected error fetching comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/comments/:lessonId
 * Post a comment on a lesson
 */
router.post('/:lessonId', verifyToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content } = req.body;
    const lessonIdNum = parseInt(lessonId, 10);

    if (isNaN(lessonIdNum) || lessonIdNum < 1) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    if (trimmed.length > 1000) {
      return res.status(400).json({ error: 'Comment cannot exceed 1000 characters' });
    }

    const { data: comment, error } = await supabase
      .from('lesson_comments')
      .insert({
        lesson_id: lessonIdNum,
        user_id: req.user.id,
        content: trimmed,
      })
      .select(`
        id,
        lesson_id,
        content,
        created_at,
        user_id,
        users (
          name,
          user_code,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      return res.status(500).json({ error: 'Failed to post comment' });
    }

    res.status(201).json({ comment });
  } catch (err) {
    console.error('Unexpected error posting comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Delete a comment — users can delete their own, admin can delete any
 */
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Fetch the comment first to check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('lesson_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isOwner = existing.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    const { error: deleteError } = await supabase
      .from('lesson_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Unexpected error deleting comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
