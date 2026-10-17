import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all tasks for a profile
router.get('/profile/:profileId', async (req, res) => {
  try {
    const tasks = await req.db.all(
      `SELECT id, profile_id, profile_course_id, title, description, due_date, priority, is_completed, created_at, updated_at
       FROM tasks
       WHERE profile_id = ?
       ORDER BY is_completed ASC, due_date ASC, created_at DESC`,
      [req.params.profileId]
    );

    const tasksWithBoolean = tasks.map(t => ({
      ...t,
      is_completed: t.is_completed === 1
    }));

    res.json(tasksWithBoolean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific course
router.get('/course/:profileCourseId', async (req, res) => {
  try {
    const tasks = await req.db.all(
      `SELECT id, profile_id, profile_course_id, title, description, due_date, priority, is_completed, created_at, updated_at
       FROM tasks
       WHERE profile_course_id = ?
       ORDER BY is_completed ASC, due_date ASC, created_at DESC`,
      [req.params.profileCourseId]
    );

    const tasksWithBoolean = tasks.map(t => ({
      ...t,
      is_completed: t.is_completed === 1
    }));

    res.json(tasksWithBoolean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for today
router.get('/profile/:profileId/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const tasks = await req.db.all(
      `SELECT id, profile_id, profile_course_id, title, description, due_date, priority, is_completed, created_at, updated_at
       FROM tasks
       WHERE profile_id = ? AND due_date = ?
       ORDER BY priority DESC, created_at DESC`,
      [req.params.profileId, today]
    );

    const tasksWithBoolean = tasks.map(t => ({
      ...t,
      is_completed: t.is_completed === 1
    }));

    res.json(tasksWithBoolean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a task
router.post('/', async (req, res) => {
  try {
    const { profile_id, profile_course_id, title, description, due_date, priority } = req.body;

    if (!profile_id) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    // Validate date if provided
    if (due_date) {
      const date = new Date(due_date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    const taskId = uuidv4();
    await req.db.run(
      `INSERT INTO tasks (id, profile_id, profile_course_id, title, description, due_date, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        profile_id,
        profile_course_id || null,
        title.trim(),
        description || '',
        due_date || null,
        priority || 'medium'
      ]
    );

    const task = await req.db.get(
      'SELECT id, profile_id, profile_course_id, title, description, due_date, priority, is_completed, created_at, updated_at FROM tasks WHERE id = ?',
      [taskId]
    );

    res.status(201).json({
      ...task,
      is_completed: task.is_completed === 1
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a task
router.put('/:taskId', async (req, res) => {
  try {
    const { title, description, due_date, priority, is_completed, profile_course_id } = req.body;

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

    if (due_date !== undefined) {
      if (due_date && !isValidDate(due_date)) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      updates.push('due_date = ?');
      values.push(due_date || null);
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      updates.push('priority = ?');
      values.push(priority);
    }

    if (is_completed !== undefined) {
      updates.push('is_completed = ?');
      values.push(is_completed ? 1 : 0);
    }

    if (profile_course_id !== undefined) {
      updates.push('profile_course_id = ?');
      values.push(profile_course_id || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.taskId);

    await req.db.run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await req.db.get(
      'SELECT id, profile_id, profile_course_id, title, description, due_date, priority, is_completed, created_at, updated_at FROM tasks WHERE id = ?',
      [req.params.taskId]
    );

    res.json({
      ...updated,
      is_completed: updated.is_completed === 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
router.delete('/:taskId', async (req, res) => {
  try {
    await req.db.run('DELETE FROM tasks WHERE id = ?', [req.params.taskId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export default router;
