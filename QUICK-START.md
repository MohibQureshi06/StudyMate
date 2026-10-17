# ⚡ StudyMate - 5-Minute Quick Start

## What You Need
- ✓ Windows/Mac/Linux
- ✓ Node.js 18+ ([Download](https://nodejs.org/))

## Step 1: Install (2 minutes)

Open Command Prompt or PowerShell in the project folder:

```
npm install
```

Wait for completion (first time takes 2-3 minutes).

## Step 2: Start (30 seconds)

```
npm run dev
```

You should see:
```
StudyMate backend running on http://localhost:5000
VITE v5.0.0 ready in 234 ms → Local: http://localhost:5173
```

## Step 3: Open Browser (10 seconds)

Go to: **http://localhost:5173**

## 🎯 First Use Walkthrough

### 1. Create a Profile
- Click "Create"
- Enter your name (e.g., "My Study Session")
- Click "Create" again

### 2. Select Courses
- Check the courses you're studying
- Click "Continue"

### 3. Add Course Content
- Click any course card
- Enter total lectures and completed lectures
- Scroll down to add:
  - Course outline
  - Important topics
  - Study notes
  - Tasks

### 4. Check Dashboard
- See countdown to exams
- View today's tasks
- See preparation progress

### 5. Export Backup
- Go to Settings
- Click "Export Data"
- Save the JSON file somewhere safe

## 🚀 That's It!

Your application is now running locally with a working database.

## Common Questions

**Q: How do I access it from another computer?**
A: Use ngrok (see DEPLOYMENT.md for instructions)

**Q: Will my data be saved?**
A: Yes! Everything is saved in `studymate.db` in the project folder

**Q: Can I use it on my phone?**
A: Yes, but type the computer's IP:5173 in mobile browser (e.g., `192.168.1.100:5173`)

**Q: What if something breaks?**
A: Delete `studymate.db` to reset everything

## 📚 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup
- Check [README.md](./README.md) for full documentation
- See [TESTING.md](./TESTING.md) to verify features
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production use

## Stop the App

Press `Ctrl + C` in the terminal where `npm run dev` is running.

---

**Happy studying! 📚**
