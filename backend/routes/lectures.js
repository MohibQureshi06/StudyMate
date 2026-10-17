import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateLectureData } from '../validation.js';

const router = express.Router();

// Get all lectures for a course
router.get('/:profileCourseId', async (req, res) => {
  try {
    const lectures = await req.db.all(
      `SELECT id, profile_course_id, title, duration, priority, is_completed, created_at, updated_at
       FROM lectures
       WHERE profile_course_id = ?
       ORDER BY created_at ASC`,
      [req.params.profileCourseId]
    );

    const lecturesWithBoolean = lectures.map(l => ({
      ...l,
      is_completed: l.is_completed === 1
    }));

    res.json(lecturesWithBoolean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a lecture
router.post('/', async (req, res) => {
  try {
    const { profile_course_id, title, duration, priority, is_completed } = req.body;
    validateLectureData({ profile_course_id, title, duration, priority });

    const lectureId = uuidv4();
    await req.db.run(
      `INSERT INTO lectures (id, profile_course_id, title, duration, priority, is_completed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lectureId, profile_course_id, title || '', duration || '', priority || 'medium', is_completed ? 1 : 0]
    );

    // Recalculate course stats
    await recalculateCourseStats(req.db, profile_course_id);

    const lecture = await req.db.get(
      'SELECT id, profile_course_id, title, duration, priority, is_completed, created_at, updated_at FROM lectures WHERE id = ?',
      [lectureId]
    );

    res.status(201).json({
      ...lecture,
      is_completed: lecture.is_completed === 1
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a lecture
router.put('/:lectureId', async (req, res) => {
  try {
    const { title, duration, priority, is_completed } = req.body;

    // Get lecture to find profile_course_id
    const lecture = await req.db.get(
      'SELECT profile_course_id FROM lectures WHERE id = ?',
      [req.params.lectureId]
    );

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(duration);
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

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.lectureId);

    await req.db.run(
      `UPDATE lectures SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Recalculate stats
    await recalculateCourseStats(req.db, lecture.profile_course_id);

    const updated = await req.db.get(
      'SELECT id, profile_course_id, title, duration, priority, is_completed, created_at, updated_at FROM lectures WHERE id = ?',
      [req.params.lectureId]
    );

    res.json({
      ...updated,
      is_completed: updated.is_completed === 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a lecture
router.delete('/:lectureId', async (req, res) => {
  try {
    const lecture = await req.db.get(
      'SELECT profile_course_id FROM lectures WHERE id = ?',
      [req.params.lectureId]
    );

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    await req.db.run('DELETE FROM lectures WHERE id = ?', [req.params.lectureId]);

    // Recalculate stats
    await recalculateCourseStats(req.db, lecture.profile_course_id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to recalculate course stats based on lectures
async function recalculateCourseStats(db, profileCourseId) {
  const lectures = await db.all(
    'SELECT is_completed FROM lectures WHERE profile_course_id = ?',
    [profileCourseId]
  );

  const total = lectures.length;
  const completed = lectures.filter(l => l.is_completed === 1).length;

  await db.run(
    'UPDATE profile_courses SET total_lectures = ?, completed_lectures = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [total, completed, profileCourseId]
  );
}

export default router;
