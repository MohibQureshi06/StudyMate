# 📚 StudyMate - Personal Exam Preparation Manager

A complete, fully functional web application to manage your exam preparation. Create profiles, track lecture progress, manage courses, save notes, and monitor your preparation percentage across multiple subjects.

## ✨ Features

### Profile Management
- Create up to 5 independent study profiles
- Each profile has completely separate data
- Rename and delete profiles
- Quick profile switching

### Course Management
- Select from 7 pre-configured courses:
  - Design and Analysis of Algorithms (DAA)
  - Linear Algebra (LA)
  - Introduction to Management (ITM)
  - Data Structures and Algorithms (DSA)
  - Full Stack Theory (FST)
  - Operating Systems Theory (OST)
  - Artificial Intelligence (AI)
- Add/remove courses anytime
- Color-coded course cards

### Lecture Tracking
- Set total lectures per course
- Track completed lectures
- Automatic pending calculation
- Visual progress bars

### Preparation Tracking
- Lecture completion percentage (automatic)
- Exam preparation percentage (manual slider 0-100%)
- Overall preparation average across courses
- Clear distinction between lecture progress and exam readiness

### Course Workspace
Multiple sections per course:
- **Overview**: Quick statistics and progress
- **Course Outline/Syllabus**: Add and manage syllabus content
- **Important Topics**: Mark and track high-priority topics
- **Notes**: Create, edit, and organize course notes with tags
- **Tasks**: Course-specific study tasks with due dates and priorities

### Exam Countdown
- Default date: November 2, 2026
- Customizable exam start date
- Real-time days remaining calculation
- Color-coded urgency indicators
- Countdown banner on dashboard

### Dashboard
- Greeting with profile name
- Current date display
- Days remaining until exams
- Key statistics (courses, lectures, preparation %)
- Today's tasks
- Priority courses (by lowest preparation %)
- Course overview cards with all key metrics

### Settings
- Change midterm exam date
- Light/dark theme support
- Full data export (JSON)
- Data import from backups
- Secure local data storage

## 🏗️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (prepared for future use)
- **HTTP Client**: Axios
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Package Manager**: npm

## 📂 Project Structure

```
studymate/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProfileSelection.jsx
│   │   │   ├── CourseSelection.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CourseWorkspace.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   └── Toast.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── validation.js
│   ├── routes/
│   │   ├── profiles.js
│   │   ├── courses.js
│   │   ├── lectures.js
│   │   ├── topics.js
│   │   ├── notes.js
│   │   ├── tasks.js
│   │   └── settings.js
├── package.json
├── studymate.db (created on first run)
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Download from https://nodejs.org/)
- npm (comes with Node.js)
- Windows, macOS, or Linux

### Installation

1. **Extract or navigate to the project folder**:
   ```powershell
   cd "C:\Users\Mohib Qureshi\Desktop\Course cover app"
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

   This will install both frontend and backend dependencies.

3. **Start both frontend and backend simultaneously**:
   ```powershell
   npm run dev
   ```

   Or run them separately:
   
   **Terminal 1 - Start Backend** (port 5000):
   ```powershell
   npm run dev:backend
   ```

   **Terminal 2 - Start Frontend** (port 5173):
   ```powershell
   npm run dev:frontend
   ```

4. **Open your browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

## 📖 Database Schema

### Tables

#### `profiles`
- `id` (TEXT): Primary key
- `name` (TEXT): Profile name (unique)
- `created_at` (DATETIME): Creation timestamp
- `updated_at` (DATETIME): Last update timestamp

#### `courses`
- `id` (TEXT): Primary key
- `name` (TEXT): Course name
- `abbreviation` (TEXT): Course abbreviation
- `color_accent` (TEXT): Hex color for UI

#### `profile_courses`
- `id` (TEXT): Primary key
- `profile_id` (TEXT): Foreign key to profiles
- `course_id` (TEXT): Foreign key to courses
- `total_lectures` (INTEGER): Total lectures in course
- `completed_lectures` (INTEGER): Lectures completed
- `preparation_percentage` (REAL): Manual exam prep percentage
- `added_at` (DATETIME): When course was added to profile
- `updated_at` (DATETIME): Last update

#### `lectures`
- `id` (TEXT): Primary key
- `profile_course_id` (TEXT): Foreign key
- `title` (TEXT): Lecture title
- `duration` (TEXT): Lecture duration
- `priority` (TEXT): low/medium/high
- `is_completed` (INTEGER): 0 or 1
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `syllabus_content`
- `id` (TEXT): Primary key
- `profile_course_id` (TEXT): Foreign key (unique)
- `content` (TEXT): Full syllabus text
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `syllabus_topics`
- `id` (TEXT): Primary key
- `profile_course_id` (TEXT): Foreign key
- `title` (TEXT): Topic title
- `description` (TEXT): Topic description
- `is_completed` (INTEGER): Completion status
- `is_important` (INTEGER): Importance flag
- `priority` (TEXT): low/medium/high
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `important_topics`
- `id` (TEXT): Primary key
- `profile_course_id` (TEXT): Foreign key
- `title` (TEXT): Topic title
- `reason` (TEXT): Why it's important
- `priority` (TEXT): low/medium/high
- `is_completed` (INTEGER): Completion status
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `notes`
- `id` (TEXT): Primary key
- `profile_course_id` (TEXT): Foreign key
- `title` (TEXT): Note title
- `content` (TEXT): Note content
- `tags` (TEXT): Comma-separated tags
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `tasks`
- `id` (TEXT): Primary key
- `profile_id` (TEXT): Foreign key to profiles
- `profile_course_id` (TEXT): Optional foreign key (NULL for profile-level tasks)
- `title` (TEXT): Task title
- `description` (TEXT): Task description
- `due_date` (DATE): Task due date
- `priority` (TEXT): low/medium/high
- `is_completed` (INTEGER): Completion status
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### `settings`
- `id` (TEXT): Primary key
- `profile_id` (TEXT): Foreign key (unique)
- `midterm_date` (DATE): Exam start date
- `theme` (TEXT): light/dark
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## 🔌 API Endpoints

All endpoints are prefixed with `/api`.

### Profiles
- `GET /profiles` - List all profiles
- `POST /profiles` - Create new profile
- `GET /profiles/:id` - Get profile details
- `PUT /profiles/:id` - Rename profile
- `DELETE /profiles/:id` - Delete profile

### Courses
- `GET /courses/list/all` - Get all available courses
- `GET /courses/:profileId/selected` - Get courses for profile
- `POST /courses/:profileId/add` - Add course to profile
- `DELETE /courses/:profileCourseId` - Remove course from profile
- `PUT /courses/:profileCourseId` - Update course data
- `GET /courses/detail/:profileCourseId` - Get course details

### Lectures
- `GET /lectures/:profileCourseId` - Get all lectures for course
- `POST /lectures` - Create lecture
- `PUT /lectures/:lectureId` - Update lecture
- `DELETE /lectures/:lectureId` - Delete lecture

### Topics & Syllabus
- `GET /topics/:profileCourseId/syllabus` - Get syllabus
- `PUT /topics/:profileCourseId/syllabus` - Update syllabus
- `GET /topics/:profileCourseId/topics` - Get topics
- `POST /topics/:profileCourseId/topics` - Create topic
- `PUT /topics/:topicId` - Update topic
- `DELETE /topics/:topicId` - Delete topic
- `GET /topics/:profileCourseId/important` - Get important topics
- `POST /topics/:profileCourseId/important` - Create important topic
- `PUT /topics/:topicId/important` - Update important topic
- `DELETE /topics/:topicId/important` - Delete important topic

### Notes
- `GET /notes/:profileCourseId` - Get all notes for course
- `POST /notes` - Create note
- `GET /notes/:noteId/detail` - Get note details
- `PUT /notes/:noteId` - Update note
- `DELETE /noteId` - Delete note

### Tasks
- `GET /tasks/profile/:profileId` - Get all tasks for profile
- `GET /tasks/course/:profileCourseId` - Get tasks for course
- `GET /tasks/profile/:profileId/today` - Get today's tasks
- `POST /tasks` - Create task
- `PUT /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task

### Settings
- `GET /settings/:profileId` - Get profile settings
- `PUT /settings/:profileId` - Update settings
- `GET /settings/:profileId/export` - Export profile data (JSON)
- `POST /settings/:profileId/import` - Import profile data

## 🌐 Remote Access with ngrok

### Step 1: Install ngrok

Download from https://ngrok.com/download

Extract and add to your PATH, or run from the extracted folder.

### Step 2: Expose Backend via ngrok

With the backend running on port 5000, open a new terminal and run:

```powershell
ngrok http 5000
```

This will show:
```
Forwarding                    https://xxxx-xx-xxx-xx-x.ngrok.io -> http://localhost:5000
```

Note the public URL (e.g., `https://xxxx-xx-xxx-xx-x.ngrok.io`).

### Step 3: Update Frontend API URL

For production remote access, update the API base in `frontend/src/api.js`:

```javascript
const API_BASE = 'https://xxxx-xx-xxx-xx-x.ngrok.io/api';
```

Or create an environment configuration.

### Step 4: Build Frontend for Production

```powershell
npm run build
```

This creates a `frontend/dist` folder with optimized production files.

### Step 5: Serve Frontend Through Backend

Create a static file handler in your Express backend:

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});
```

Then restart the backend and access:
- https://xxxx-xx-xxx-xx-x.ngrok.io

## ⚠️ Security Notes for Remote Access

### When Using ngrok:

1. **Authentication**: ngrok URLs are public. Consider adding:
   - Simple password protection
   - API key authentication
   - IP whitelist

2. **Data Safety**:
   - Your database file is never exposed
   - Only API endpoints are accessible
   - Static files are served through the backend

3. **Example - Simple Password Protection**:

```javascript
app.use('/api', (req, res, next) => {
  const token = req.headers['x-api-token'];
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

4. **Best Practices**:
   - Use HTTPS (ngrok automatically provides this)
   - Don't share ngrok URL publicly
   - Regenerate tokens/passwords regularly
   - Monitor access logs
   - Keep backend secure with firewall rules

## 📦 Building for Production

### Frontend Build

```powershell
npm run build
```

Creates optimized production files in `frontend/dist/`.

### Environment Setup

Create `.env` in the backend folder:

```
PORT=5000
NODE_ENV=production
DATABASE_PATH=./studymate.db
API_TOKEN=your-secure-token-here
```

### Starting Production Server

```powershell
npm start
```

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or specify different ports:

```powershell
# Backend on different port
set PORT=5001
npm run dev:backend

# Frontend proxy to different backend
# Update vite.config.js target
```

### Database Errors

- Delete `studymate.db` to reset (will lose all data)
- Check folder permissions
- Ensure backend has write access to the workspace

### Frontend Not Loading

- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)
- Verify backend is running and accessible

### ngrok Connection Issues

- Update ngrok to latest version
- Check firewall settings
- Restart ngrok if URL expires
- Use a paid ngrok plan for stable URLs

## 📋 API Response Format

All responses are JSON:

### Success (2xx)
```json
{
  "id": "uuid",
  "name": "Profile Name",
  "created_at": "2026-01-01T10:00:00Z"
}
```

### Error (4xx/5xx)
```json
{
  "error": "Error message",
  "status": 400
}
```

## 🔐 Data Privacy

- All data stored locally in SQLite database
- No cloud storage
- No user tracking
- No external API calls (except file operations)
- Database file never exposed through API
- Static files separated from sensitive data

## 📝 Usage Tips

1. **Start with Profile Creation**: Create 1-2 profiles to organize different study sessions
2. **Add All Courses First**: Select all your courses, even if you haven't started them
3. **Set Lecture Counts**: Enter total lectures for each course (you can adjust anytime)
4. **Use Important Topics**: Mark high-priority topics for quick reference
5. **Save Notes Frequently**: Use the notes section for quick thought capture
6. **Create Tasks**: Break down study work into manageable tasks
7. **Track Preparation**: Manually update exam preparation as you progress
8. **Export Backups**: Regularly export your data as backup

## 📞 Support

For issues or improvements:

1. Check the database schema above
2. Review API endpoints documentation
3. Check browser console for errors (F12)
4. Verify both frontend and backend are running
5. Try hard refresh (Ctrl+Shift+R)

## 📄 License

This is a personal study management application. Feel free to modify and use as needed.

## 🎯 Future Enhancements

Potential features for future versions:
- Study recommendations based on preparation levels
- Calendar view of tasks and deadlines
- PDF export of study plans
- Mobile app version
- Multi-user collaboration
- Study time tracking
- Performance analytics
- Timetable scheduling
- Mock exams and practice tests
- Study material import from URLs

## ✅ Verification Checklist

Before considering the project complete, verify:

- ✓ Can create up to 5 profiles
- ✓ Each profile stores independent data
- ✓ Can select any combination of 7 courses
- ✓ Can enter total and completed lectures
- ✓ Pending lectures calculated correctly
- ✓ Lecture completion and exam prep tracked separately
- ✓ Midterm countdown uses November 2, 2026 by default
- ✓ Can edit syllabus and mark topics complete
- ✓ Can save important topics and notes
- ✓ Can create and complete study tasks
- ✓ Dashboard displays accurate statistics
- ✓ All data survives restart
- ✓ Application works on desktop and mobile
- ✓ Can run locally on localhost
- ✓ Can expose through ngrok securely
- ✓ README contains complete documentation

---

**Built with ❤️ for exam preparation success**
