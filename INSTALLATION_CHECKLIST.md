# ✅ NEWSY TECH - Installation Checklist

Use this checklist to ensure proper installation and setup.

## 📋 Pre-Installation Requirements

### System Requirements
- [ ] Node.js v16 or higher installed
- [ ] npm v8 or higher installed
- [ ] MongoDB installed (local) OR MongoDB Atlas account
- [ ] Git installed (optional, for version control)
- [ ] Code editor (VS Code recommended)
- [ ] Modern web browser (Chrome, Firefox, Edge)

### Check Versions
```bash
node --version   # Should be v16+
npm --version    # Should be v8+
mongod --version # If using local MongoDB
```

### API Keys Required
- [ ] NewsAPI key from https://newsapi.org/register
- [ ] MongoDB Atlas connection string (if using cloud)

---

## 🔧 Backend Installation

### Step 1: Navigate to Backend
```bash
cd backend
```
- [ ] Confirmed in backend directory

### Step 2: Install Dependencies
```bash
npm install
```
- [ ] All packages installed successfully
- [ ] No error messages
- [ ] `node_modules` folder created

### Step 3: Create Environment File
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```
- [ ] `.env` file created in backend folder

### Step 4: Configure Environment Variables
Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/newsy_tech
JWT_SECRET=your_super_secret_jwt_key_change_this
NEWS_API_KEY=your_newsapi_key_here
FRONTEND_URL=http://localhost:3000
```

- [ ] PORT set to 5000
- [ ] NODE_ENV set to development
- [ ] MONGODB_URI configured (local or Atlas)
- [ ] JWT_SECRET changed to secure random string
- [ ] NEWS_API_KEY added from NewsAPI.org
- [ ] FRONTEND_URL set to http://localhost:3000

### Step 5: Start MongoDB (if local)
```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```
- [ ] MongoDB service running
- [ ] No connection errors

### Step 6: Test Backend
```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📰 NEWSY TECH Backend API
🌍 Environment: development
MongoDB Connected: localhost
```

- [ ] Server started on port 5000
- [ ] MongoDB connected successfully
- [ ] No error messages

### Step 7: Test Backend API
Open new terminal:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"OK","message":"NEWSY TECH API is running"}
```

- [ ] Health check returns OK
- [ ] Backend is accessible

---

## 🎨 Frontend Installation

### Step 1: Navigate to Frontend
Open NEW terminal window:
```bash
cd frontend
```
- [ ] Confirmed in frontend directory
- [ ] Backend still running in other terminal

### Step 2: Install Dependencies
```bash
npm install
```
- [ ] All packages installed successfully
- [ ] No error messages
- [ ] `node_modules` folder created

### Step 3: Create Environment File
```bash
# Windows
copy .env.example .env.local

# Mac/Linux
cp .env.example .env.local
```
- [ ] `.env.local` file created in frontend folder

### Step 4: Configure Environment Variables
Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

- [ ] NEXT_PUBLIC_API_URL set to http://localhost:5000/api
- [ ] Matches backend URL

### Step 5: Start Frontend
```bash
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000
```

- [ ] Server started on port 3000
- [ ] No error messages
- [ ] Compilation successful

### Step 6: Access Application
Open browser: http://localhost:3000

- [ ] Homepage loads
- [ ] News articles visible
- [ ] No console errors (F12)
- [ ] Images loading
- [ ] Navigation working

---

## 🧪 Feature Testing

### Test 1: Browse News
- [ ] Homepage displays news articles
- [ ] Articles have images, titles, descriptions
- [ ] "Read More" links work
- [ ] Loading spinner appears initially

### Test 2: Category Filtering
- [ ] Click "AI" category
- [ ] News updates to AI-related articles
- [ ] Try other categories (Startups, Software, etc.)
- [ ] "All News" shows all articles

### Test 3: User Registration
- [ ] Click "Sign Up" button
- [ ] Fill in registration form
  - Name: Test User
  - Email: test@test.com
  - Password: test123
  - Confirm Password: test123
- [ ] Click "Sign Up"
- [ ] Redirected to homepage
- [ ] User name appears in navigation

### Test 4: User Login
- [ ] Click "Logout" (if logged in)
- [ ] Click "Login" button
- [ ] Enter credentials:
  - Email: test@test.com
  - Password: test123
- [ ] Click "Login"
- [ ] Successfully logged in
- [ ] User name appears in navigation

### Test 5: User Profile
- [ ] Click on user name in navigation
- [ ] Profile page loads
- [ ] User information displayed
- [ ] Click "Edit Profile"
- [ ] Change name
- [ ] Click "Save Changes"
- [ ] Profile updated successfully

### Test 6: Article Detail
- [ ] Click on any article card
- [ ] Article detail page loads
- [ ] "Read Full Article" button visible
- [ ] Click button opens article in new tab
- [ ] "Back to News" button works

### Test 7: Mobile Responsiveness
- [ ] Open browser DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Test on mobile view (375px width)
- [ ] Hamburger menu appears
- [ ] Menu opens when clicked
- [ ] All features work on mobile

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Server running on http://localhost:5000
- [ ] MongoDB connected
- [ ] Health endpoint responds: http://localhost:5000/api/health
- [ ] News endpoint works: http://localhost:5000/api/news
- [ ] No errors in terminal

### Frontend Verification
- [ ] Server running on http://localhost:3000
- [ ] Homepage loads with news
- [ ] No errors in browser console (F12)
- [ ] All pages accessible (/, /login, /signup, /profile)
- [ ] Styling applied correctly
- [ ] Images loading

### Database Verification
```bash
# Open MongoDB shell
mongosh

# Use database
use newsy_tech

# Check collections
show collections

# Should see: users, savedarticles

# Check users
db.users.find()
```

- [ ] Database `newsy_tech` exists
- [ ] Collections created
- [ ] Test user exists in database

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```
- [ ] Port freed
- [ ] Backend starts successfully

**Issue: MongoDB connection failed**
- [ ] MongoDB service is running
- [ ] Connection string is correct
- [ ] Database user has permissions (if Atlas)
- [ ] IP whitelisted (if Atlas)

**Issue: News not loading**
- [ ] NewsAPI key is valid
- [ ] Not exceeded API rate limit (100/day free)
- [ ] Internet connection active

### Frontend Issues

**Issue: Port 3000 already in use**
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```
- [ ] Port freed
- [ ] Frontend starts successfully

**Issue: Cannot connect to backend**
- [ ] Backend is running
- [ ] NEXT_PUBLIC_API_URL is correct
- [ ] No typos in URL
- [ ] CORS configured properly

**Issue: Images not loading**
- [ ] Check next.config.js image domains
- [ ] Check browser console for errors
- [ ] Verify image URLs are valid

---

## 📊 Installation Success Criteria

### All Green Checkmarks
- [ ] Node.js and npm installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Backend running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend .env.local configured
- [ ] Frontend running on port 3000
- [ ] Can register new user
- [ ] Can login
- [ ] Can view profile
- [ ] News articles loading
- [ ] Categories working
- [ ] Mobile responsive
- [ ] No console errors

### Performance Check
- [ ] Homepage loads in < 3 seconds
- [ ] News fetches in < 2 seconds
- [ ] Navigation is smooth
- [ ] No lag or freezing

---

## 🎉 Next Steps

After successful installation:

1. **Customize the App**
   - [ ] Change color theme in `globals.css`
   - [ ] Update logo/branding
   - [ ] Add more categories

2. **Add Features**
   - [ ] Implement saved articles
   - [ ] Add comments
   - [ ] Create admin panel

3. **Deploy to Production**
   - [ ] Follow DEPLOYMENT.md
   - [ ] Set up MongoDB Atlas
   - [ ] Deploy backend to Render
   - [ ] Deploy frontend to Vercel

4. **Optimize**
   - [ ] Add caching
   - [ ] Implement rate limiting
   - [ ] Set up monitoring

---

## 📞 Getting Help

If you encounter issues:

1. **Check Documentation**
   - README.md - Full documentation
   - SETUP_GUIDE.md - Detailed setup
   - QUICK_START.md - Quick reference

2. **Review Error Messages**
   - Backend: Check terminal output
   - Frontend: Check browser console (F12)
   - Database: Check MongoDB logs

3. **Common Solutions**
   - Restart servers
   - Clear node_modules and reinstall
   - Check environment variables
   - Verify API keys
   - Check MongoDB connection

4. **Debug Steps**
   ```bash
   # Backend
   cd backend
   npm run dev
   # Watch for errors
   
   # Frontend
   cd frontend
   npm run dev
   # Check browser console
   ```

---

## ✅ Final Verification

Run through this final checklist:

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# ✅ Server running on port 5000
# ✅ MongoDB Connected

# Terminal 2 - Frontend
cd frontend
npm run dev
# ✅ Server running on port 3000

# Browser
# ✅ Open http://localhost:3000
# ✅ News articles visible
# ✅ Can register/login
# ✅ All features working
```

---

**🎊 Congratulations!**

If all items are checked, your NEWSY TECH application is successfully installed and running!

**Happy Coding! 🚀**

---

**Installation Date:** _______________

**Installed By:** _______________

**Notes:** _______________________________________________
