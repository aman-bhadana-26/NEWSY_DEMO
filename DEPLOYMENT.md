# 🚀 Deployment Guide - NEWSY TECH

Complete guide for deploying NEWSY TECH to production.

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Environment variables configured
- [ ] MongoDB Atlas database set up
- [ ] NewsAPI key obtained
- [ ] Strong JWT secret generated
- [ ] CORS configured for production URL
- [ ] Error logging configured
- [ ] Database indexes created

### Frontend
- [ ] API URL updated to production backend
- [ ] Build tested locally (`npm run build`)
- [ ] All pages tested
- [ ] Images optimized
- [ ] SEO meta tags verified
- [ ] Analytics configured (optional)

---

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new project: "NEWSY TECH"

### 2. Create Cluster

1. Click "Build a Database"
2. Choose "Shared" (Free tier - M0)
3. Select cloud provider and region (closest to your users)
4. Name your cluster: "newsy-tech-cluster"
5. Click "Create Cluster"

### 3. Configure Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `newsy_admin`
5. Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Configure Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's IP address
5. Click "Confirm"

### 5. Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `newsy_tech`

Example:
```
mongodb+srv://newsy_admin:YOUR_PASSWORD@newsy-tech-cluster.xxxxx.mongodb.net/newsy_tech?retryWrites=true&w=majority
```

---

## 🔧 Backend Deployment

### Option 1: Render (Recommended)

#### 1. Prepare Repository

Ensure your code is pushed to GitHub/GitLab/Bitbucket.

#### 2. Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub/GitLab
3. Authorize Render to access your repositories

#### 3. Create Web Service

1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - **Name:** `newsy-tech-backend`
   - **Region:** Choose closest to users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

#### 4. Add Environment Variables

Click "Advanced" → "Add Environment Variable":

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://newsy_admin:PASSWORD@cluster.mongodb.net/newsy_tech
JWT_SECRET=generate_a_very_long_random_string_here_32_chars_minimum
NEWS_API_KEY=your_newsapi_key_from_newsapi_org
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 5. Deploy

1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Your backend URL: `https://newsy-tech-backend.onrender.com`

#### 6. Test Deployment

```bash
curl https://newsy-tech-backend.onrender.com/api/health
```

---

### Option 2: Heroku

#### 1. Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login
```

#### 2. Create Heroku App

```bash
cd backend
heroku create newsy-tech-backend
```

#### 3. Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set NEWS_API_KEY="your_newsapi_key"
heroku config:set FRONTEND_URL="https://your-frontend.vercel.app"
```

#### 4. Deploy

```bash
git push heroku main
```

#### 5. Open App

```bash
heroku open
```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **newsy-tech**
- Directory? **./frontend**
- Override settings? **N**

#### 4. Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

Enter your backend URL:
```
https://newsy-tech-backend.onrender.com/api
```

#### 5. Deploy to Production

```bash
vercel --prod
```

Your site will be live at: `https://newsy-tech.vercel.app`

---

### Option 2: Vercel Dashboard

#### 1. Push to GitHub

Ensure your code is on GitHub.

#### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### 3. Add Environment Variables

In "Environment Variables" section:
```
NEXT_PUBLIC_API_URL = https://newsy-tech-backend.onrender.com/api
```

#### 4. Deploy

Click "Deploy" and wait 2-3 minutes.

---

### Option 3: Netlify

#### 1. Build Configuration

Create `frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### 2. Deploy via Netlify CLI

```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

---

## 🔐 Security Hardening

### Backend Security

#### 1. Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Update CORS

In `backend/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### 3. Add Rate Limiting

```bash
cd backend
npm install express-rate-limit
```

Update `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

#### 4. Add Helmet for Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Frontend Security

#### 1. Environment Variables

Never commit `.env.local` to Git.

#### 2. API Key Protection

Never expose API keys in frontend code. Always proxy through backend.

---

## 📊 Monitoring & Logging

### Backend Monitoring

#### 1. Add Morgan for Logging

```bash
cd backend
npm install morgan
```

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

#### 2. Error Tracking (Optional)

Use services like:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [Datadog](https://www.datadoghq.com)

### Frontend Monitoring

#### 1. Add Analytics

Google Analytics, Plausible, or Vercel Analytics.

#### 2. Performance Monitoring

Use Vercel Analytics or Lighthouse CI.

---

## 🔄 Continuous Deployment

### GitHub Actions (Backend)

Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Vercel Auto-Deploy (Frontend)

Vercel automatically deploys on Git push. No configuration needed!

---

## 🧪 Testing Production

### Backend Tests

```bash
# Health check
curl https://newsy-tech-backend.onrender.com/api/health

# Get news
curl https://newsy-tech-backend.onrender.com/api/news?category=ai

# Register user
curl -X POST https://newsy-tech-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

### Frontend Tests

1. Visit your production URL
2. Test all pages
3. Test authentication flow
4. Test news loading
5. Test on mobile devices
6. Check browser console for errors

---

## 🔧 Post-Deployment

### 1. Update CORS

Update backend `FRONTEND_URL` to production URL:

```bash
# Render
# Update in Render dashboard environment variables

# Heroku
heroku config:set FRONTEND_URL=https://newsy-tech.vercel.app
```

### 2. Custom Domain (Optional)

#### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records

#### Render
1. Go to Settings → Custom Domains
2. Add your domain
3. Configure DNS

### 3. SSL Certificate

Both Vercel and Render provide free SSL certificates automatically.

### 4. Database Backups

Set up MongoDB Atlas automated backups:
1. Go to Clusters → Backup
2. Enable Cloud Backup
3. Configure backup schedule

---

## 📈 Scaling

### Backend Scaling

#### Render
- Upgrade to paid plan for auto-scaling
- Add more instances

#### Heroku
```bash
heroku ps:scale web=2
```

### Database Scaling

#### MongoDB Atlas
- Upgrade cluster tier
- Enable sharding
- Add read replicas

### Frontend Scaling

Vercel handles scaling automatically!

---

## 🐛 Troubleshooting

### Backend Issues

**Issue:** Can't connect to MongoDB
```bash
# Check connection string
# Verify IP whitelist in MongoDB Atlas
# Check database user credentials
```

**Issue:** CORS errors
```bash
# Verify FRONTEND_URL matches exactly
# Check CORS middleware configuration
```

### Frontend Issues

**Issue:** API calls failing
```bash
# Check NEXT_PUBLIC_API_URL
# Verify backend is running
# Check browser console
```

**Issue:** Build fails
```bash
# Run `npm run build` locally
# Check for TypeScript/ESLint errors
# Verify all dependencies installed
```

---

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Backend deployed to Render/Heroku
- [ ] Environment variables set
- [ ] Backend health check passes
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] CORS configured correctly
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] News loading works
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backups configured

---

## 🎉 Success!

Your NEWSY TECH application is now live!

**Next Steps:**
1. Share your app URL
2. Monitor performance
3. Gather user feedback
4. Plan new features
5. Keep dependencies updated

---

**Need Help?**

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

---

**Last Updated:** January 2026
