import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all notes for a course
router.get('/:profileCourseId', async (req, res) => {
  try {
    const notes = await req.db.all(
      `SELECT id, profile_course_id, title, content, tags, created_at, updated_at
       FROM notes
       WHERE profile_course_id = ?
       ORDER BY updated_at DESC`,
      [req.params.profileCourseId]
    );

    const notesWithParsedTags = notes.map(n => ({
      ...n,
      tags: n.tags ? n.tags.split(',').map(t => t.trim()).filter(t => t) : []
    }));

    res.json(notesWithParsedTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a note
router.post('/', async (req, res) => {
  try {
    const { profile_course_id, title, content, tags } = req.body;

    if (!profile_course_id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Note title is required' });
    }

    const noteId = uuidv4();
    const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');

    await req.db.run(
      `INSERT INTO notes (id, profile_course_id, title, content, tags)
       VALUES (?, ?, ?, ?, ?)`,
      [noteId, profile_course_id, title.trim(), content || '', tagsString]
    );

    const note = await req.db.get(
      'SELECT id, profile_course_id, title, content, tags, created_at, updated_at FROM notes WHERE id = ?',
      [noteId]
    );

    res.status(201).json({
      ...note,
      tags: note.tags ? note.tags.split(',').map(t => t.trim()).filter(t => t) : []
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single note
router.get('/:noteId/detail', async (req, res) => {
  try {
    const note = await req.db.get(
      'SELECT id, profile_course_id, title, content, tags, created_at, updated_at FROM notes WHERE id = ?',
      [req.params.noteId]
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      ...note,
      tags: note.tags ? note.tags.split(',').map(t => t.trim()).filter(t => t) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put('/:noteId', async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }

    if (tags !== undefined) {
      const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');
      updates.push('tags = ?');
      values.push(tagsString);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.noteId);

    await req.db.run(
      `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await req.db.get(
      'SELECT id, profile_course_id, title, content, tags, created_at, updated_at FROM notes WHERE id = ?',
      [req.params.noteId]
    );

    res.json({
      ...updated,
      tags: updated.tags ? updated.tags.split(',').map(t => t.trim()).filter(t => t) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
router.delete('/:noteId', async (req, res) => {
  try {
    await req.db.run('DELETE FROM notes WHERE id = ?', [req.params.noteId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
