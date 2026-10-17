import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateProfileName } from '../validation.js';

const router = express.Router();

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await req.db.all(
      'SELECT id, name, created_at, updated_at FROM profiles ORDER BY created_at DESC'
    );
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const validatedName = validateProfileName(name);

    // Check if profile count < 5
    const profiles = await req.db.all('SELECT id FROM profiles');
    if (profiles.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 profiles allowed' });
    }

    // Check if name already exists
    const existing = await req.db.get(
      'SELECT id FROM profiles WHERE name = ?',
      [validatedName]
    );
    if (existing) {
      return res.status(400).json({ error: 'Profile name already exists' });
    }

    const profileId = uuidv4();
    await req.db.run(
      'INSERT INTO profiles (id, name) VALUES (?, ?)',
      [profileId, validatedName]
    );

    // Create default settings for profile
    const settingsId = uuidv4();
    await req.db.run(
      'INSERT INTO settings (id, profile_id, midterm_date, theme) VALUES (?, ?, ?, ?)',
      [settingsId, profileId, '2026-11-02', 'light']
    );

    const profile = await req.db.get(
      'SELECT id, name, created_at, updated_at FROM profiles WHERE id = ?',
      [profileId]
    );
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await req.db.get(
      'SELECT id, name, created_at, updated_at FROM profiles WHERE id = ?',
      [req.params.id]
    );
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile name
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const validatedName = validateProfileName(name);

    // Check if new name already exists (excluding current profile)
    const existing = await req.db.get(
      'SELECT id FROM profiles WHERE name = ? AND id != ?',
      [validatedName, req.params.id]
    );
    if (existing) {
      return res.status(400).json({ error: 'Profile name already exists' });
    }

    await req.db.run(
      'UPDATE profiles SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [validatedName, req.params.id]
    );

    const profile = await req.db.get(
      'SELECT id, name, created_at, updated_at FROM profiles WHERE id = ?',
      [req.params.id]
    );
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete profile
router.delete('/:id', async (req, res) => {
  try {
    await req.db.run('DELETE FROM profiles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
