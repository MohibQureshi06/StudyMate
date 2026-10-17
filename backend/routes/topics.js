import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get syllabus content
router.get('/:profileCourseId/syllabus', async (req, res) => {
  try {
    const syllabus = await req.db.get(
      'SELECT id, profile_course_id, content, created_at, updated_at FROM syllabus_content WHERE profile_course_id = ?',
      [req.params.profileCourseId]
    );

    if (!syllabus) {
      return res.json({ id: '', profile_course_id: req.params.profileCourseId, content: '', created_at: null, updated_at: null });
    }

    res.json(syllabus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update syllabus content
router.put('/:profileCourseId/syllabus', async (req, res) => {
  try {
    const { content } = req.body;

    const existing = await req.db.get(
      'SELECT id FROM syllabus_content WHERE profile_course_id = ?',
      [req.params.profileCourseId]
    );

    if (existing) {
      await req.db.run(
        'UPDATE syllabus_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE profile_course_id = ?',
        [content || '', req.params.profileCourseId]
      );
    } else {
      const id = uuidv4();
      await req.db.run(
        'INSERT INTO syllabus_content (id, profile_course_id, content) VALUES (?, ?, ?)',
        [id, req.params.profileCourseId, content || '']
      );
    }

    const updated = await req.db.get(
      'SELECT id, profile_course_id, content, created_at, updated_at FROM syllabus_content WHERE profile_course_id = ?',
      [req.params.profileCourseId]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get syllabus topics
router.get('/:profileCourseId/topics', async (req, res) => {
  try {
    const topics = await req.db.all(
      `SELECT id, profile_course_id, title, description, is_completed, is_important, priority, created_at, updated_at
       FROM syllabus_topics
       WHERE profile_course_id = ?
       ORDER BY created_at DESC`,
      [req.params.profileCourseId]
    );

    const topicsWithBoolean = topics.map(t => ({
      ...t,
      is_completed: t.is_completed === 1,
      is_important: t.is_important === 1
    }));

    res.json(topicsWithBoolean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a syllabus topic
router.post('/:profileCourseId/topics', async (req, res) => {
  try {
    const { title, description, priority, is_important, is_completed } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Topic title is required' });
    }

    const topicId = uuidv4();
    await req.db.run(
      `INSERT INTO syllabus_topics (id, profile_course_id, title, description, priority, is_important, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        topicId,
        req.params.profileCourseId,
        title.trim(),
        description || '',
        priority || 'medium',
        is_important ? 1 : 0,
        is_completed ? 1 : 0
      ]
    );

    const topic = await req.db.get(
      'SELECT id, profile_course_id, title, description, is_completed, is_important, priority, created_at, updated_at FROM syllabus_topics WHERE id = ?',
      [topicId]
    );

    res.status(201).json({
      ...topic,
      is_completed: topic.is_completed === 1,
      is_important: topic.is_important === 1
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a topic
router.put('/:topicId', async (req, res) => {
  try {
    const { title, description, is_completed, is_important, priority } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (is_completed !== undefined) {
      updates.push('is_completed = ?');
      values.push(is_completed ? 1 : 0);
    }

    if (is_important !== undefined) {
      updates.push('is_important = ?');
      values.push(is_important ? 1 : 0);
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      updates.push('priority = ?');
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.topicId);

    await req.db.run(
      `UPDATE syllabus_topics SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await req.db.get(
      'SELECT id, profile_course_id, title, description, is_completed, is_important, priority, created_at, updated_at FROM syllabus_topics WHERE id = ?',
      [req.params.topicId]
    );

    res.json({
      ...updated,
      is_completed: updated.is_completed === 1,
      is_important: updated.is_important === 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a topic
router.delete('/:topicId', async (req, res) => {
  try {
    await req.db.run('DELETE FROM syllabus_topics WHERE id = ?', [req.params.topicId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get important topics for a course
router.get('/:profileCourseId/important', async (req, res) => {
  try {
    const topics = await req.db.all(
      `SELECT id, profile_course_id, title, reason, priority, is_completed, created_at, updated_at
       FROM important_topics
       WHERE profile_course_id = ?
       ORDER BY priority DESC, created_at DESC`,
      [req.params.profileCourseId]
    );

    const topicsWithBoolean = topics.map(t => ({
      ...t,
      is_completed: t.is_completed === 1
    }));

    res.json(topicsWithBoolean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an important topic
router.post('/:profileCourseId/important', async (req, res) => {
  try {
    const { title, reason, priority } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Topic title is required' });
    }

    const topicId = uuidv4();
    await req.db.run(
      `INSERT INTO important_topics (id, profile_course_id, title, reason, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [topicId, req.params.profileCourseId, title.trim(), reason || '', priority || 'high']
    );

    const topic = await req.db.get(
      'SELECT id, profile_course_id, title, reason, priority, is_completed, created_at, updated_at FROM important_topics WHERE id = ?',
      [topicId]
    );

    res.status(201).json({
      ...topic,
      is_completed: topic.is_completed === 1
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an important topic
router.put('/:topicId/important', async (req, res) => {
  try {
    const { title, reason, is_completed, priority } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (reason !== undefined) {
      updates.push('reason = ?');
      values.push(reason);
    }

    if (is_completed !== undefined) {
      updates.push('is_completed = ?');
      values.push(is_completed ? 1 : 0);
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      updates.push('priority = ?');
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.topicId);

    await req.db.run(
      `UPDATE important_topics SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await req.db.get(
      'SELECT id, profile_course_id, title, reason, priority, is_completed, created_at, updated_at FROM important_topics WHERE id = ?',
      [req.params.topicId]
    );

    res.json({
      ...updated,
      is_completed: updated.is_completed === 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an important topic
router.delete('/:topicId/important', async (req, res) => {
  try {
    await req.db.run('DELETE FROM important_topics WHERE id = ?', [req.params.topicId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
