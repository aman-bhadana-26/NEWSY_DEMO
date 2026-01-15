# 🚀 Quick Setup Guide - NEWSY TECH

This guide will help you get NEWSY TECH up and running in under 10 minutes.

## ⚡ Quick Start (TL;DR)

```bash
# 1. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and NewsAPI key
npm run dev

# 2. Setup Frontend (in new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev

# 3. Open http://localhost:3000
```

## 📋 Step-by-Step Setup

### Step 1: Get Required API Keys

#### NewsAPI Key (Required)
1. Go to https://newsapi.org/register
2. Sign up for a free account
3. Copy your API key
4. Free tier includes 100 requests/day

#### MongoDB Setup (Choose One)

**Option A: MongoDB Atlas (Recommended - Free Cloud Database)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password

**Option B: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use connection string: `mongodb://localhost:27017/newsy_tech`

### Step 2: Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Use your MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsy_tech

# Generate a random secret (or use any long random string)
JWT_SECRET=my_super_secret_jwt_key_12345

# Your NewsAPI key
NEWS_API_KEY=your_actual_newsapi_key_here

FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📰 NEWSY TECH Backend API
🌍 Environment: development
MongoDB Connected: ...
```

### Step 3: Frontend Configuration

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 4: Access the Application

1. Open your browser
2. Go to `http://localhost:3000`
3. You should see the NEWSY TECH homepage with latest tech news!

## ✅ Verify Installation

### Test Backend
Open http://localhost:5000/api/health in your browser.

You should see:
```json
{
  "status": "OK",
  "message": "NEWSY TECH API is running"
}
```

### Test Frontend
1. Homepage should load with news articles
2. Try clicking different categories (AI, Startups, etc.)
3. Click "Sign Up" to create an account
4. Login with your credentials

## 🎯 First Steps After Setup

### 1. Create Your First Account
- Click "Sign Up" in the navigation
- Fill in your details
- Password must be at least 6 characters

### 2. Browse News
- Homepage shows all tech news
- Use category filters to browse specific topics
- Click any article to view details

### 3. Manage Your Profile
- Click on your name in the navigation
- View and edit your profile information
- Update your password if needed

## 🔧 Common Setup Issues

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Verify MongoDB is running (if local)
- Check connection string in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Check username/password in connection string

### Issue: "News not loading"
**Solution:**
- Verify NewsAPI key is correct in `backend/.env`
- Check you haven't exceeded API rate limit (100/day on free tier)
- Backend must be running on port 5000

### Issue: "Port already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Verify CORS settings in backend allow `http://localhost:3000`

## 📱 Testing on Mobile

To test on your phone while developing:

1. Find your computer's local IP address:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

2. Update backend `.env`:
```env
FRONTEND_URL=http://YOUR_IP:3000
```

3. Update frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_IP:5000/api
```

4. Access from phone: `http://YOUR_IP:3000`

## 🚀 Production Deployment Checklist

Before deploying to production:

### Backend
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Enable MongoDB authentication
- [ ] Set up proper error logging

### Frontend
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Test all pages and features
- [ ] Optimize images
- [ ] Run `npm run build` to check for errors

### Security
- [ ] Never commit `.env` files
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure proper CORS origins

## 📊 Development Workflow

### Running Both Servers
You need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Making Changes
- Backend changes auto-reload with nodemon
- Frontend changes auto-reload with Next.js
- Database changes require server restart

### Viewing Logs
- Backend logs: Check Terminal 1
- Frontend logs: Check Terminal 2 and browser console
- MongoDB logs: Use MongoDB Compass or Atlas UI

## 🎓 Learning Resources

### Next Steps
1. Customize the color theme in `frontend/styles/globals.css`
2. Add new news categories in `CategoryFilter.js`
3. Implement saved articles feature
4. Add user comments
5. Create admin dashboard

### Helpful Commands

```bash
# Backend
npm run dev          # Start with auto-reload
npm start           # Start production server
npm install <pkg>   # Add new package

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Check for code issues
```

## 💡 Pro Tips

1. **Use MongoDB Compass** - Visual tool for viewing/editing database
2. **Install React DevTools** - Browser extension for debugging React
3. **Use Postman** - Test API endpoints easily
4. **Enable ESLint** - Catch errors early
5. **Git ignore .env** - Never commit sensitive data

## 🆘 Getting Help

If you're stuck:

1. Check the main README.md for detailed documentation
2. Review error messages in terminal/console
3. Check MongoDB connection and NewsAPI key
4. Ensure all dependencies are installed
5. Try deleting `node_modules` and reinstalling

## ✨ Success Checklist

You're all set if:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:3000
- ✅ News articles loading on homepage
- ✅ Can create account and login
- ✅ Can view user profile
- ✅ Categories filter working
- ✅ Articles open in new tab

**Congratulations! You're ready to start developing! 🎉**

---

Need more help? Check the full README.md or the troubleshooting section.
