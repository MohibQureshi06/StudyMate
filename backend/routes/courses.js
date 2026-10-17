import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateCourseData } from '../validation.js';

const router = express.Router();

// Get all available courses
router.get('/list/all', async (req, res) => {
  try {
    const courses = await req.db.all(
      'SELECT id, name, abbreviation, color_accent FROM courses ORDER BY name'
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile's selected courses with stats
router.get('/:profileId/selected', async (req, res) => {
  try {
    const courses = await req.db.all(`
      SELECT 
        pc.id,
        c.id as course_id,
        c.name,
        c.abbreviation,
        c.color_accent,
        pc.total_lectures,
        pc.completed_lectures,
        pc.preparation_percentage,
        pc.added_at,
        pc.updated_at
      FROM profile_courses pc
      JOIN courses c ON pc.course_id = c.id
      WHERE pc.profile_id = ?
      ORDER BY c.name
    `, [req.params.profileId]);

    // Calculate stats for each course
    const coursesWithStats = courses.map(course => {
      const lectureCompletion = course.total_lectures > 0 
        ? (course.completed_lectures / course.total_lectures) * 100 
        : 0;
      return {
        ...course,
        lecture_completion_percentage: Math.round(lectureCompletion),
        pending_lectures: Math.max(0, course.total_lectures - course.completed_lectures)
      };
    });

    res.json(coursesWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add course to profile
router.post('/:profileId/add', async (req, res) => {
  try {
    const { course_id } = req.body;
    if (!course_id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if already added
    const existing = await req.db.get(
      'SELECT id FROM profile_courses WHERE profile_id = ? AND course_id = ?',
      [req.params.profileId, course_id]
    );
    if (existing) {
      return res.status(400).json({ error: 'Course already added to profile' });
    }

    const profileCourseId = uuidv4();
    await req.db.run(
      `INSERT INTO profile_courses (id, profile_id, course_id, total_lectures, completed_lectures, preparation_percentage)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [profileCourseId, req.params.profileId, course_id, 0, 0, 0]
    );

    // Create syllabus_content entry
    const syllabusId = uuidv4();
    await req.db.run(
      'INSERT INTO syllabus_content (id, profile_course_id, content) VALUES (?, ?, ?)',
      [syllabusId, profileCourseId, '']
    );

    const profileCourse = await req.db.get(
      `SELECT 
        pc.id,
        c.id as course_id,
        c.name,
        c.abbreviation,
        c.color_accent,
        pc.total_lectures,
        pc.completed_lectures,
        pc.preparation_percentage
      FROM profile_courses pc
      JOIN courses c ON pc.course_id = c.id
      WHERE pc.id = ?`,
      [profileCourseId]
    );

    res.status(201).json(profileCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove course from profile
router.delete('/:profileCourseId', async (req, res) => {
  try {
    await req.db.run(
      'DELETE FROM profile_courses WHERE id = ?',
      [req.params.profileCourseId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course lecture counts
router.put('/:profileCourseId', async (req, res) => {
  try {
    const { total_lectures, completed_lectures, preparation_percentage } = req.body;

    // Validate
    if (total_lectures !== undefined) {
      const total = parseInt(total_lectures);
      if (isNaN(total) || total < 0) {
        return res.status(400).json({ error: 'Total lectures must be non-negative' });
      }
    }

    if (completed_lectures !== undefined) {
      const completed = parseInt(completed_lectures);
      if (isNaN(completed) || completed < 0) {
        return res.status(400).json({ error: 'Completed lectures must be non-negative' });
      }
      
      // Check that completed doesn't exceed total
      const course = await req.db.get(
        'SELECT total_lectures FROM profile_courses WHERE id = ?',
        [req.params.profileCourseId]
      );
      const newTotal = total_lectures !== undefined ? parseInt(total_lectures) : course.total_lectures;
      if (completed > newTotal) {
        return res.status(400).json({ error: 'Completed lectures cannot exceed total lectures' });
      }
    }

    const updates = [];
    const values = [];

    if (total_lectures !== undefined) {
      updates.push('total_lectures = ?');
      values.push(parseInt(total_lectures));
    }
    if (completed_lectures !== undefined) {
      updates.push('completed_lectures = ?');
      values.push(parseInt(completed_lectures));
    }
    if (preparation_percentage !== undefined) {
      const prep = Math.max(0, Math.min(100, parseFloat(preparation_percentage)));
      updates.push('preparation_percentage = ?');
      values.push(prep);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.profileCourseId);

    await req.db.run(
      `UPDATE profile_courses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await req.db.get(
      `SELECT 
        pc.id,
        c.id as course_id,
        c.name,
        c.abbreviation,
        c.color_accent,
        pc.total_lectures,
        pc.completed_lectures,
        pc.preparation_percentage
      FROM profile_courses pc
      JOIN courses c ON pc.course_id = c.id
      WHERE pc.id = ?`,
      [req.params.profileCourseId]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course details
router.get('/detail/:profileCourseId', async (req, res) => {
  try {
    const course = await req.db.get(`
      SELECT 
        pc.id,
        pc.profile_id,
        c.id as course_id,
        c.name,
        c.abbreviation,
        c.color_accent,
        pc.total_lectures,
        pc.completed_lectures,
        pc.preparation_percentage,
        pc.added_at,
        pc.updated_at
      FROM profile_courses pc
      JOIN courses c ON pc.course_id = c.id
      WHERE pc.id = ?
    `, [req.params.profileCourseId]);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
