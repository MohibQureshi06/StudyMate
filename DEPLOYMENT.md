# 🚀 StudyMate - Deployment & Production Guide

## Local Deployment (Localhost)

### Development Mode (Quick Start)
```powershell
cd "C:\Users\Mohib Qureshi\Desktop\Course cover app"
npm run dev
```

Access: http://localhost:5173

### Separate Terminals (Advanced)
**Terminal 1:**
```powershell
npm run dev:backend
```

**Terminal 2:**
```powershell
npm run dev:frontend
```

## Production Build

### Step 1: Build Frontend
```powershell
npm run build
```

Creates optimized `frontend/dist` folder (~500KB gzipped).

### Step 2: Configure Backend for Production

Edit `backend/server.js` to serve the built frontend:

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, '../frontend/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});
```

### Step 3: Start Production Server
```powershell
set NODE_ENV=production
npm start
```

Access: http://localhost:5000

## Remote Access with ngrok

### Prerequisites
- Download ngrok: https://ngrok.com/download
- Free account (optional, for persistent URLs)

### Step 1: Start Backend
```powershell
npm run dev:backend
```

Wait for: `StudyMate backend running on http://localhost:5000`

### Step 2: Expose via ngrok
Open new terminal:
```powershell
ngrok http 5000
```

You'll see:
```
Forwarding    https://xxxx-xx-xxx-xx-x.ngrok.io -> http://localhost:5000
```

Note the public URL.

### Step 3: Access Remotely
```
https://xxxx-xx-xxx-xx-x.ngrok.io
```

Or with built frontend:
```
https://xxxx-xx-xxx-xx-x.ngrok.io/
```

### Step 4: Update Frontend Configuration (Optional)

For static frontend serving, update `frontend/.env.production`:

```
VITE_API_URL=https://xxxx-xx-xxx-xx-x.ngrok.io/api
```

Update `frontend/src/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

## Docker Deployment

### Dockerfile (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY backend ./backend
COPY frontend ./frontend

RUN cd frontend && npm install && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Build & Run
```powershell
docker build -t studymate .
docker run -p 5000:5000 -v ./studymate.db:/app/studymate.db studymate
```

## Security for Remote Access

### ⚠️ Important Security Considerations

When exposing via ngrok, implement access controls:

### Option 1: Simple API Token

Edit `backend/server.js`:
```javascript
const API_TOKEN = process.env.API_TOKEN || 'change-me-in-production';

app.use('/api', (req, res, next) => {
  const token = req.headers['x-api-token'];
  if (token !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

Frontend `api.js`:
```javascript
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'X-API-Token': process.env.VITE_API_TOKEN
  }
});
```

### Option 2: Basic Auth

```javascript
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
  users: { 'user': process.env.PASSWORD || 'password' },
  challenge: true
}));
```

### Option 3: Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

## Environment Variables

Create `.env` in project root:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_PATH=./studymate.db

# Security
API_TOKEN=your-secure-token-here
CORS_ORIGIN=https://yourdomain.com

# Optional
LOG_LEVEL=info
```

Load in `backend/server.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
const API_TOKEN = process.env.API_TOKEN;
```

## Reverse Proxy Setup (Nginx)

For production on a domain:

`/etc/nginx/sites-available/studymate`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/studymate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Backup Strategy

### Automated Backups

Create `backup.js`:
```javascript
import fs from 'fs';
import { execSync } from 'child_process';

const timestamp = new Date().toISOString().split('T')[0];
const backupPath = `./backups/studymate-${timestamp}.db`;

fs.mkdirSync('./backups', { recursive: true });
execSync(`cp studymate.db ${backupPath}`);
console.log(`Backup created: ${backupPath}`);
```

Schedule with npm script or cron job.

## Monitoring

### Health Check Endpoint
```
GET http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T10:00:00Z"
}
```

Monitor with:
```bash
while true; do
  curl http://localhost:5000/api/health
  sleep 60
done
```

### Error Logging

Add Winston logger:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});
```

## Scaling

### Horizontal Scaling (Multiple Instances)

1. Use a reverse proxy (Nginx, HAProxy)
2. Run multiple backend instances on different ports
3. Use Redis for session management
4. Use shared database (upgrade from SQLite to PostgreSQL)

### Database Migration (SQLite to PostgreSQL)

For production use with multiple instances, migrate to PostgreSQL:

```javascript
import pg from 'pg';

const client = new pg.Client({
  user: 'studymate',
  host: 'localhost',
  database: 'studymate_db',
  password: process.env.DB_PASSWORD,
  port: 5432,
});
```

## SSL/TLS Certificate

For HTTPS (required for production):

### Let's Encrypt (Free)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### In Nginx:
```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

## Performance Optimization

### Frontend
- ✓ Already using Vite (fast bundling)
- ✓ Tailwind CSS with tree-shaking
- ✓ Code splitting automatic
- ✓ Images optimized (use WebP)

### Backend
- ✓ Add database indexing
- ✓ Use connection pooling
- ✓ Add caching headers
- ✓ Enable gzip compression

```javascript
import compression from 'compression';
app.use(compression());
```

## Troubleshooting Production

### Port Conflicts
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Locks
```powershell
del studymate.db
npm start
```

### Memory Issues
- Monitor with `top` or Task Manager
- Increase Node heap if needed: `node --max-old-space-size=4096`

### Slow Performance
- Check database indexes
- Review API response times
- Monitor database file size
- Check network latency (if remote)

## Monitoring Checklist

Before going live:

- [ ] Database backups scheduled
- [ ] Error logging configured
- [ ] Health check endpoint working
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Secrets not in code (use .env)
- [ ] Database indexed appropriately
- [ ] SSL/TLS certificate installed
- [ ] Firewall configured
- [ ] Monitoring alerts set up

---

**Your application is now ready for production!**
