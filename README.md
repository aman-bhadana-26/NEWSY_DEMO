# NEWSY TECH - Modern Tech News Platform

![NEWSY TECH](https://via.placeholder.com/1200x300/0066cc/ffffff?text=NEWSY+TECH+-+Latest+Technology+News)

A full-stack modern technology news web application with a professional red and blue theme. Built with Next.js, Node.js, Express, and MongoDB.

## 🚀 Features

### Frontend
- ✅ **Modern UI/UX** - Clean, professional design with red and blue color palette
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **SEO-Friendly** - Optimized meta tags and semantic HTML
- ✅ **Category Filtering** - Browse news by AI, Startups, Software, Gadgets, Cybersecurity
- ✅ **Trending News** - Weekly trending tech stories with fire animation
- ✅ **Full Article Reading** - Read complete articles on NEWSY TECH (no external redirects)
- ✅ **User Authentication** - Secure login and signup with JWT
- ✅ **User Profiles** - Personalized user dashboard
- ✅ **Real-time News** - Live technology news from NewsAPI

### Backend
- ✅ **RESTful API** - Well-structured API endpoints
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcrypt for secure password storage
- ✅ **MongoDB Database** - Scalable NoSQL database
- ✅ **Protected Routes** - Middleware for authenticated endpoints
- ✅ **News API Integration** - Fetch live tech news securely
- ✅ **Article Content Extraction** - Fetch full article content from source URLs

### Security
- ✅ **Environment Variables** - Secure API key storage
- ✅ **CORS Protection** - Configured for frontend-backend communication
- ✅ **Input Validation** - Server-side validation
- ✅ **Password Encryption** - bcrypt hashing

## 📁 Project Structure

```
newsy_demo/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── newsController.js     # News fetching logic
│   │   └── savedArticlesController.js
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── SavedArticle.js       # Saved articles schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── newsRoutes.js         # News endpoints
│   │   └── savedArticlesRoutes.js
│   ├── utils/
│   │   └── generateToken.js      # JWT token generation
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # Express server
│
├── frontend/
│   ├── components/
│   │   ├── Navbar.js             # Navigation bar
│   │   ├── Footer.js             # Footer component
│   │   ├── NewsCard.js           # News article card
│   │   ├── CategoryFilter.js    # Category selector
│   │   ├── Layout.js             # Page layout wrapper
│   │   └── LoadingSpinner.js    # Loading component
│   ├── context/
│   │   └── AuthContext.js        # Authentication context
│   ├── pages/
│   │   ├── _app.js               # Next.js app wrapper
│   │   ├── index.js              # Homepage
│   │   ├── login.js              # Login page
│   │   ├── signup.js             # Signup page
│   │   ├── profile.js            # User profile page
│   │   └── article/
│   │       └── [slug].js         # Article detail page
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   ├── Home.module.css
│   │   ├── Navbar.module.css
│   │   ├── Footer.module.css
│   │   ├── NewsCard.module.css
│   │   ├── CategoryFilter.module.css
│   │   ├── Auth.module.css
│   │   ├── Profile.module.css
│   │   ├── Article.module.css
│   │   └── LoadingSpinner.module.css
│   ├── utils/
│   │   ├── api.js                # API client
│   │   └── formatDate.js         # Date formatting utilities
│   ├── .env.local                # Frontend environment variables
│   ├── .env.example              # Environment template
│   ├── next.config.js            # Next.js configuration
│   └── package.json
│
└── README.md                     # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** CSS Modules + Global CSS
- **HTTP Client:** Axios
- **Icons:** React Icons
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Security:** CORS, express-validator
- **HTTP Client:** Axios (for NewsAPI)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
- **NewsAPI Key** - [Get free API key](https://newsapi.org/register)

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project Directory

```bash
cd newsy_demo
```

### 2. Backend Setup

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/newsy_tech

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsy_tech?retryWrites=true&w=majority

# JWT Secret (Change this to a random secure string)
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production

# News API Configuration
# Get your API key from https://newsapi.org/
NEWS_API_KEY=your_newsapi_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Start MongoDB (if using local installation)
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

#### Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

#### Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
Create a `.env.local` file in the `frontend` directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 Usage

### Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Browse the latest tech news on the homepage
3. Filter news by category (AI, Startups, Software, Gadgets, Cybersecurity)
4. Click on any article to view details
5. Sign up for an account to access user features
6. Login to view and edit your profile

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

#### News Endpoints
- `GET /api/news` - Get tech news (Query params: category, page, pageSize)
- `GET /api/news/headlines` - Get top headlines

#### Saved Articles Endpoints (Protected)
- `POST /api/saved` - Save an article
- `GET /api/saved` - Get user's saved articles
- `DELETE /api/saved/:id` - Delete saved article

### Testing the API

You can test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get news
curl http://localhost:5000/api/news?category=ai

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 🎨 Color Theme

The application uses a professional red and blue color palette:

- **Primary Blue:** `#0066cc`
- **Dark Blue:** `#003d7a`
- **Light Blue:** `#e6f2ff`
- **Primary Red:** `#dc143c`
- **Light Red:** `#ffe6eb`
- **Text Dark:** `#1a1a1a`
- **Text Gray:** `#666666`
- **Background White:** `#ffffff`
- **Background Gray:** `#f5f5f5`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1200px and up)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Protected Routes** - Middleware authentication
- **Environment Variables** - Secure configuration
- **CORS Protection** - Configured origins
- **Input Validation** - Server-side validation
- **XSS Protection** - React's built-in protection

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

#### Render
1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect your repository
4. Set environment variables
5. Deploy

#### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create newsy-tech-backend
git subtree push --prefix backend heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NEWS_API_KEY=your_news_api_key
```

### Frontend Deployment (Vercel)

#### Vercel (Recommended for Next.js)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow the prompts
5. Set environment variable: `NEXT_PUBLIC_API_URL=your_backend_url`

Or deploy via [Vercel Dashboard](https://vercel.com):
1. Import your repository
2. Select `frontend` as root directory
3. Add environment variables
4. Deploy

### MongoDB Atlas Setup (Cloud Database)

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Update `MONGODB_URI` in backend `.env`

## 🧪 Development Tips

### Hot Reload
Both frontend and backend support hot reload during development:
- Frontend: Next.js automatically reloads on file changes
- Backend: nodemon watches for changes and restarts server

### Debugging
- Backend logs are displayed in the terminal
- Frontend errors appear in browser console
- Use React DevTools for component debugging
- Use MongoDB Compass for database inspection

### Adding New Features
1. Backend: Add routes → controllers → models
2. Frontend: Add pages → components → styles
3. Update API client in `utils/api.js`
4. Test thoroughly before deployment

## 📝 Environment Variables Reference

### Backend (.env)
```env
PORT=5000                          # Server port
NODE_ENV=development               # Environment (development/production)
MONGODB_URI=mongodb://...          # MongoDB connection string
JWT_SECRET=your_secret_key         # JWT signing secret
NEWS_API_KEY=your_api_key          # NewsAPI.org API key
FRONTEND_URL=http://localhost:3000 # Frontend URL for CORS
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api  # Backend API URL
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Ensure port 5000 is not in use

**Frontend won't connect to backend:**
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend

**News not loading:**
- Verify NewsAPI key is valid
- Check API rate limits (free tier: 100 requests/day)
- Check browser console for errors

**Authentication not working:**
- Clear browser localStorage
- Check JWT_SECRET is set in backend
- Verify token is being sent in requests

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [React Icons](https://react-icons.github.io/react-icons/)

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for modern tech news enthusiasts

## 🎉 Acknowledgments

- News data powered by [NewsAPI.org](https://newsapi.org)
- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- Inspired by professional editorial platforms

---

**Happy Coding! 🚀**

For questions or issues, please check the troubleshooting section or create an issue in the repository.
