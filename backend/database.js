import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.db.configure('busyTimeout', 5000);
  }

  initialize() {
    this.db.serialize(() => {
      // Profiles table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Courses table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          abbreviation TEXT,
          color_accent TEXT DEFAULT '#3b82f6'
        )
      `);

      // Profile-Course relationships
      this.db.run(`
        CREATE TABLE IF NOT EXISTS profile_courses (
          id TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL,
          course_id TEXT NOT NULL,
          total_lectures INTEGER DEFAULT 0,
          completed_lectures INTEGER DEFAULT 0,
          preparation_percentage REAL DEFAULT 0,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
          FOREIGN KEY (course_id) REFERENCES courses(id),
          UNIQUE(profile_id, course_id)
        )
      `);

      // Lectures table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS lectures (
          id TEXT PRIMARY KEY,
          profile_course_id TEXT NOT NULL,
          title TEXT,
          duration TEXT,
          priority TEXT DEFAULT 'medium',
          is_completed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_course_id) REFERENCES profile_courses(id) ON DELETE CASCADE
        )
      `);

      // Syllabus topics
      this.db.run(`
        CREATE TABLE IF NOT EXISTS syllabus_topics (
          id TEXT PRIMARY KEY,
          profile_course_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          is_completed INTEGER DEFAULT 0,
          is_important INTEGER DEFAULT 0,
          priority TEXT DEFAULT 'medium',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_course_id) REFERENCES profile_courses(id) ON DELETE CASCADE
        )
      `);

      // Important topics (dedicated table for ease of querying)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS important_topics (
          id TEXT PRIMARY KEY,
          profile_course_id TEXT NOT NULL,
          title TEXT NOT NULL,
          reason TEXT,
          priority TEXT DEFAULT 'high',
          is_completed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_course_id) REFERENCES profile_courses(id) ON DELETE CASCADE
        )
      `);

      // Notes
      this.db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          profile_course_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_course_id) REFERENCES profile_courses(id) ON DELETE CASCADE
        )
      `);

      // Tasks
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL,
          profile_course_id TEXT,
          title TEXT NOT NULL,
          description TEXT,
          due_date DATE,
          priority TEXT DEFAULT 'medium',
          is_completed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
          FOREIGN KEY (profile_course_id) REFERENCES profile_courses(id) ON DELETE SET NULL
        )
      `);

      // Syllabus content (stored as full text for each course)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS syllabus_content (
          id TEXT PRIMARY KEY,
          profile_course_id TEXT NOT NULL UNIQUE,
          content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_course_id) REFERENCES profile_courses(id) ON DELETE CASCADE
        )
      `);

      // Settings
      this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL UNIQUE,
          midterm_date DATE DEFAULT '2026-11-02',
          theme TEXT DEFAULT 'light',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        )
      `);

      // Initialize 7 courses
      const coursesData = [
        { name: 'Design and Analysis of Algorithms', abbreviation: 'DAA', color: '#3b82f6' },
        { name: 'Linear Algebra', abbreviation: 'LA', color: '#8b5cf6' },
        { name: 'Introduction to Management', abbreviation: 'ITM', color: '#ec4899' },
        { name: 'Data Structures and Algorithms', abbreviation: 'DSA', color: '#f59e0b' },
        { name: 'Full Stack Theory', abbreviation: 'FST', color: '#10b981' },
        { name: 'Operating Systems Theory', abbreviation: 'OST', color: '#06b6d4' },
        { name: 'Artificial Intelligence', abbreviation: 'AI', color: '#f97316' }
      ];

      coursesData.forEach(course => {
        const id = uuidv4();
        this.db.run(
          `INSERT OR IGNORE INTO courses (id, name, abbreviation, color_accent) VALUES (?, ?, ?, ?)`,
          [id, course.name, course.abbreviation, course.color]
        );
      });

      console.log('Database initialized successfully');
    });
  }

  // Promise-based database methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default Database;
