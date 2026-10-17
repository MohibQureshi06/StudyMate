import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from './database.js';
import profileRoutes from './routes/profiles.js';
import courseRoutes from './routes/courses.js';
import lectureRoutes from './routes/lectures.js';
import topicRoutes from './routes/topics.js';
import noteRoutes from './routes/notes.js';
import taskRoutes from './routes/tasks.js';
import settingsRoutes from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
const db = new Database(join(__dirname, '..', 'studymate.db'));
db.initialize();

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// API Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend dist folder (PRODUCTION)
const distPath = join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Frontend not built. Run: npm run build' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ StudyMate is running!`);
  console.log(`\n   🌐 Open: http://localhost:${PORT}`);
  console.log(`   📡 API: http://localhost:${PORT}/api\n`);
});
