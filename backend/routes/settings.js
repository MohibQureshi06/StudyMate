import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get settings for a profile
router.get('/:profileId', async (req, res) => {
  try {
    let settings = await req.db.get(
      'SELECT id, profile_id, midterm_date, theme, created_at, updated_at FROM settings WHERE profile_id = ?',
      [req.params.profileId]
    );

    // If settings don't exist, create default ones
    if (!settings) {
      const settingsId = uuidv4();
      await req.db.run(
        'INSERT INTO settings (id, profile_id, midterm_date, theme) VALUES (?, ?, ?, ?)',
        [settingsId, req.params.profileId, '2026-11-02', 'light']
      );
      settings = await req.db.get(
        'SELECT id, profile_id, midterm_date, theme, created_at, updated_at FROM settings WHERE id = ?',
        [settingsId]
      );
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.put('/:profileId', async (req, res) => {
  try {
    const { midterm_date, theme } = req.body;

    // Validate date if provided
    if (midterm_date) {
      const date = new Date(midterm_date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme value' });
    }

    // Ensure settings exist
    let settings = await req.db.get(
      'SELECT id FROM settings WHERE profile_id = ?',
      [req.params.profileId]
    );

    if (!settings) {
      const settingsId = uuidv4();
      await req.db.run(
        'INSERT INTO settings (id, profile_id, midterm_date, theme) VALUES (?, ?, ?, ?)',
        [settingsId, req.params.profileId, midterm_date || '2026-11-02', theme || 'light']
      );
    } else {
      const updates = [];
      const values = [];

      if (midterm_date !== undefined) {
        updates.push('midterm_date = ?');
        values.push(midterm_date);
      }

      if (theme !== undefined) {
        updates.push('theme = ?');
        values.push(theme);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.profileId);

        await req.db.run(
          `UPDATE settings SET ${updates.join(', ')} WHERE profile_id = ?`,
          values
        );
      }
    }

    const updated = await req.db.get(
      'SELECT id, profile_id, midterm_date, theme, created_at, updated_at FROM settings WHERE profile_id = ?',
      [req.params.profileId]
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export profile data
router.get('/:profileId/export', async (req, res) => {
  try {
    const profile = await req.db.get(
      'SELECT id, name FROM profiles WHERE id = ?',
      [req.params.profileId]
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileCourses = await req.db.all(
      `SELECT id, course_id, total_lectures, completed_lectures, preparation_percentage
       FROM profile_courses WHERE profile_id = ?`,
      [req.params.profileId]
    );

    // Get all related data for each course
    const coursesWithData = await Promise.all(
      profileCourses.map(async (pc) => {
        const course = await req.db.get(
          'SELECT id, name, abbreviation FROM courses WHERE id = ?',
          [pc.course_id]
        );

        const lectures = await req.db.all(
          'SELECT id, title, duration, priority, is_completed FROM lectures WHERE profile_course_id = ?',
          [pc.id]
        );

        const syllabusTopics = await req.db.all(
          'SELECT id, title, description, is_completed, is_important, priority FROM syllabus_topics WHERE profile_course_id = ?',
          [pc.id]
        );

        const importantTopics = await req.db.all(
          'SELECT id, title, reason, priority, is_completed FROM important_topics WHERE profile_course_id = ?',
          [pc.id]
        );

        const notes = await req.db.all(
          'SELECT id, title, content, tags FROM notes WHERE profile_course_id = ?',
          [pc.id]
        );

        const syllabus = await req.db.get(
          'SELECT content FROM syllabus_content WHERE profile_course_id = ?',
          [pc.id]
        );

        return {
          profile_course_id: pc.id,
          course: course,
          total_lectures: pc.total_lectures,
          completed_lectures: pc.completed_lectures,
          preparation_percentage: pc.preparation_percentage,
          lectures: lectures,
          syllabus_content: syllabus?.content || '',
          syllabus_topics: syllabusTopics,
          important_topics: importantTopics,
          notes: notes
        };
      })
    );

    const tasks = await req.db.all(
      'SELECT id, profile_course_id, title, description, due_date, priority, is_completed FROM tasks WHERE profile_id = ?',
      [req.params.profileId]
    );

    const settings = await req.db.get(
      'SELECT midterm_date, theme FROM settings WHERE profile_id = ?',
      [req.params.profileId]
    );

    const exportData = {
      profile: profile,
      courses: coursesWithData,
      tasks: tasks,
      settings: settings,
      exported_at: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import profile data
router.post('/:profileId/import', async (req, res) => {
  try {
    const { exportData } = req.body;

    if (!exportData) {
      return res.status(400).json({ error: 'Export data is required' });
    }

    // Verify profile exists
    const profile = await req.db.get(
      'SELECT id FROM profiles WHERE id = ?',
      [req.params.profileId]
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Clear existing data for this profile
    await req.db.run('DELETE FROM tasks WHERE profile_id = ?', [req.params.profileId]);
    await req.db.run('DELETE FROM profile_courses WHERE profile_id = ?', [req.params.profileId]);

    // Import courses and related data
    for (const courseData of exportData.courses) {
      const profileCourseId = uuidv4();
      const course = courseData.course;

      // Get course ID from name
      const courseRecord = await req.db.get(
        'SELECT id FROM courses WHERE name = ?',
        [course.name]
      );

      if (courseRecord) {
        // Create profile_course entry
        await req.db.run(
          `INSERT INTO profile_courses (id, profile_id, course_id, total_lectures, completed_lectures, preparation_percentage)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            profileCourseId,
            req.params.profileId,
            courseRecord.id,
            courseData.total_lectures,
            courseData.completed_lectures,
            courseData.preparation_percentage
          ]
        );

        // Create syllabus content
        await req.db.run(
          'INSERT OR REPLACE INTO syllabus_content (id, profile_course_id, content) VALUES (?, ?, ?)',
          [uuidv4(), profileCourseId, courseData.syllabus_content]
        );

        // Import lectures
        for (const lecture of courseData.lectures) {
          await req.db.run(
            `INSERT INTO lectures (id, profile_course_id, title, duration, priority, is_completed)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), profileCourseId, lecture.title, lecture.duration, lecture.priority, lecture.is_completed ? 1 : 0]
          );
        }

        // Import syllabus topics
        for (const topic of courseData.syllabus_topics) {
          await req.db.run(
            `INSERT INTO syllabus_topics (id, profile_course_id, title, description, is_completed, is_important, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(),
              profileCourseId,
              topic.title,
              topic.description,
              topic.is_completed ? 1 : 0,
              topic.is_important ? 1 : 0,
              topic.priority
            ]
          );
        }

        // Import important topics
        for (const topic of courseData.important_topics) {
          await req.db.run(
            `INSERT INTO important_topics (id, profile_course_id, title, reason, priority, is_completed)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), profileCourseId, topic.title, topic.reason, topic.priority, topic.is_completed ? 1 : 0]
          );
        }

        // Import notes
        for (const note of courseData.notes) {
          await req.db.run(
            `INSERT INTO notes (id, profile_course_id, title, content, tags)
             VALUES (?, ?, ?, ?, ?)`,
            [uuidv4(), profileCourseId, note.title, note.content, note.tags]
          );
        }
      }
    }

    // Import tasks
    for (const task of exportData.tasks) {
      const profileCourse = await req.db.get(
        'SELECT id FROM profile_courses WHERE profile_id = ? LIMIT 1',
        [req.params.profileId]
      );

      await req.db.run(
        `INSERT INTO tasks (id, profile_id, profile_course_id, title, description, due_date, priority, is_completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.params.profileId,
          profileCourse?.id || null,
          task.title,
          task.description,
          task.due_date,
          task.priority,
          task.is_completed ? 1 : 0
        ]
      );
    }

    // Import settings if provided
    if (exportData.settings) {
      await req.db.run(
        `UPDATE settings SET midterm_date = ?, theme = ?, updated_at = CURRENT_TIMESTAMP
         WHERE profile_id = ?`,
        [exportData.settings.midterm_date, exportData.settings.theme, req.params.profileId]
      );
    }

    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
