# 🚀 StudyMate - Quick Start Guide

## Windows Installation & Setup

### Step 1: Open Command Prompt or PowerShell

Navigate to the project folder:
```
cd "C:\Users\Mohib Qureshi\Desktop\Course cover app"
```

### Step 2: Install Dependencies

Run this command (may take 2-5 minutes):
```
npm install
```

This will install all required packages for both frontend and backend.

### Step 3: Start the Application

**Option A: Start Both Simultaneously**
```
npm run dev
```

This opens the Vite dev server with automatic backend handling.

**Option B: Start Separately (Recommended for Debugging)**

Open two terminals/command prompts, both in the project folder:

**Terminal 1 - Backend**:
```
npm run dev:backend
```

Wait for: `StudyMate backend running on http://localhost:5000`

**Terminal 2 - Frontend**:
```
npm run dev:frontend
```

Wait for: `VITE v5.0.0 ready in 234 ms`

### Step 4: Open in Browser

Once both are running, open:
```
http://localhost:5173
```

You should see the StudyMate welcome screen.

## What to Do Next

1. **Create a Profile**: Click "Create" and enter your name
2. **Select Courses**: Check the 7 courses you want to study
3. **Click Continue**: Go to your personal dashboard
4. **Add Course Content**:
   - Click on any course card
   - Enter total lectures
   - Add course outline/syllabus
   - Mark important topics
   - Save study notes
5. **Track Progress**: Update lecture counts and preparation percentage
6. **Check Dashboard**: See countdown, tasks, and overall progress

## Troubleshooting

### npm install fails
- Make sure Node.js is installed: `node --version`
- Delete `node_modules` folder and try again
- Clear npm cache: `npm cache clean --force`

### Port 5000 or 5173 already in use
Edit `backend/server.js` or `frontend/vite.config.js` to use different ports

### Can't see changes in browser
- Hard refresh: Ctrl + Shift + R (Windows)
- Clear browser cache
- Check browser console (F12) for errors

### Database errors
- Delete `studymate.db` file to reset (loses all data)
- Check folder permissions

## First Time Usage

The app will automatically:
1. Create the SQLite database (`studymate.db`)
2. Initialize all tables
3. Populate 7 courses
4. Create default settings

## Stopping the Application

Press `Ctrl + C` in each terminal to stop.

## Building for Production

When ready to deploy:
```
npm run build
```

This creates an optimized `frontend/dist` folder.

## Next Steps

- Read `README.md` for full documentation
- See Remote Access section for ngrok setup
- Check API endpoints documentation
- Export and backup your data regularly

---

**Need help?** Check the README.md for comprehensive documentation.
