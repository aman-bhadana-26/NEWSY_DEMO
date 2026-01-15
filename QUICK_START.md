# ⚡ NEWSY TECH - Quick Start Commands

Fast reference for common commands and operations.

## 🚀 Initial Setup

```bash
# 1. Get NewsAPI Key
# Visit: https://newsapi.org/register

# 2. Setup MongoDB
# Option A: MongoDB Atlas (Cloud - Recommended)
# Visit: https://www.mongodb.com/cloud/atlas

# Option B: Local MongoDB
# Download: https://www.mongodb.com/try/download/community
```

## 📦 Installation

```bash
# Install Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your keys

# Install Frontend (in new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
```

## 🏃 Running the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Access: http://localhost:3000
```

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/newsy_tech
JWT_SECRET=your_secret_key_here
NEWS_API_KEY=your_newsapi_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🧪 Testing

```bash
# Test Backend Health
curl http://localhost:5000/api/health

# Test News Endpoint
curl http://localhost:5000/api/news?category=ai

# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 📁 Project Structure

```
newsy_demo/
├── backend/          # Node.js + Express API
│   ├── config/       # Database config
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── server.js     # Entry point
├── frontend/         # Next.js React app
│   ├── components/   # React components
│   ├── pages/        # Next.js pages
│   ├── styles/       # CSS modules
│   └── utils/        # Helper functions
└── README.md
```

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Development (auto-reload)
npm run dev

# Production
npm start

# Install package
npm install package-name

# Check logs
# Watch terminal output
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Production build
npm run build

# Start production
npm start

# Lint code
npm run lint
```

## 🗄️ Database Operations

```bash
# Start MongoDB (Local)
# Windows: mongod
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Stop MongoDB
# Windows: Ctrl+C in mongod terminal
# Mac: brew services stop mongodb-community
# Linux: sudo systemctl stop mongod

# MongoDB Shell
mongosh

# Use database
use newsy_tech

# View collections
show collections

# View users
db.users.find()

# Clear users
db.users.deleteMany({})
```

## 🔧 Common Issues & Fixes

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status mongod

# Restart MongoDB
# Mac: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod
```

### Module Not Found
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Cache
```
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
```

## 🚀 Deployment Commands

### Backend (Render)
```bash
# Push to GitHub
git add .
git commit -m "Deploy backend"
git push origin main

# Render auto-deploys from GitHub
```

### Frontend (Vercel)
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

## 📊 Useful URLs

### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Backend Health: http://localhost:5000/api/health
- MongoDB: mongodb://localhost:27017

### External Services
- NewsAPI: https://newsapi.org/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Vercel: https://vercel.com
- Render: https://render.com

## 🎯 API Endpoints Quick Reference

```
# Authentication
POST   /api/auth/register      # Register user
POST   /api/auth/login         # Login user
GET    /api/auth/profile       # Get profile (auth)
PUT    /api/auth/profile       # Update profile (auth)

# News
GET    /api/news               # Get news
GET    /api/news/headlines     # Get headlines

# Saved Articles
POST   /api/saved              # Save article (auth)
GET    /api/saved              # Get saved (auth)
DELETE /api/saved/:id          # Delete saved (auth)

# Health
GET    /api/health             # Health check
```

## 🔐 Generate Secure Keys

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Random Password
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

## 📱 Test on Mobile

```bash
# Find your IP
# Windows: ipconfig
# Mac/Linux: ifconfig

# Update .env files with your IP
# Backend: FRONTEND_URL=http://YOUR_IP:3000
# Frontend: NEXT_PUBLIC_API_URL=http://YOUR_IP:5000/api

# Access from phone: http://YOUR_IP:3000
```

## 🎨 Customize Theme

Edit `frontend/styles/globals.css`:

```css
:root {
  --primary-red: #dc143c;    /* Change this */
  --primary-blue: #0066cc;   /* Change this */
  --dark-blue: #003d7a;
  --light-blue: #e6f2ff;
  --light-red: #ffe6eb;
}
```

## 📝 Git Commands

```bash
# Initialize
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/username/newsy-tech.git
git push -u origin main

# Update
git add .
git commit -m "Update message"
git push
```

## 🔄 Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all
npm update

# Update specific package
npm install package-name@latest

# Security audit
npm audit
npm audit fix
```

## 📚 Documentation

- Main README: [README.md](README.md)
- Setup Guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- API Docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)

## 💡 Pro Tips

1. **Keep terminals open** - One for backend, one for frontend
2. **Use nodemon** - Backend auto-reloads on changes
3. **Check console** - Browser console shows frontend errors
4. **MongoDB Compass** - Visual database management tool
5. **Postman** - Test API endpoints easily
6. **React DevTools** - Debug React components
7. **Git branches** - Use branches for new features

## 🎉 Success Checklist

- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] MongoDB connected
- [x] NewsAPI key working
- [x] Can register/login
- [x] News articles loading
- [x] Categories working
- [x] Profile page accessible

## 🆘 Need Help?

1. Check error messages in terminal
2. Check browser console (F12)
3. Review documentation
4. Check MongoDB connection
5. Verify API keys
6. Try restarting servers

---

**Happy Coding! 🚀**

Keep this file handy for quick reference during development!
