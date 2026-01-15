# NEWSY TECH Backend API

RESTful API for NEWSY TECH - Technology News Platform

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 📋 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update User Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "newpassword123"
}
```

### News

#### Get Tech News
```http
GET /api/news?category=ai&page=1&pageSize=20
```

Query Parameters:
- `category` - all, ai, startups, software, gadgets, cybersecurity
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)

#### Get Top Headlines
```http
GET /api/news/headlines?page=1&pageSize=10
```

### Saved Articles (Protected)

#### Save Article
```http
POST /api/saved
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Article Title",
  "description": "Article description",
  "url": "https://example.com/article",
  "urlToImage": "https://example.com/image.jpg",
  "publishedAt": "2024-01-15T10:00:00Z",
  "source": "TechCrunch",
  "category": "ai"
}
```

#### Get Saved Articles
```http
GET /api/saved
Authorization: Bearer <token>
```

#### Delete Saved Article
```http
DELETE /api/saved/:id
Authorization: Bearer <token>
```

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/newsy_tech
JWT_SECRET=your_jwt_secret
NEWS_API_KEY=your_newsapi_key
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### SavedArticle
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  url: String,
  urlToImage: String,
  publishedAt: Date,
  source: String,
  category: String,
  savedAt: Date
}
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## 📦 Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - CORS middleware
- dotenv - Environment variables
- axios - HTTP client
- express-validator - Input validation

## 🔒 Security

- JWT token authentication
- bcrypt password hashing (10 salt rounds)
- CORS protection
- Input validation
- Protected routes middleware

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## 🧪 Testing

Test endpoints using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get news
curl http://localhost:5000/api/news?category=ai
```

## 🚀 Deployment

### Heroku
```bash
heroku create newsy-tech-backend
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NEWS_API_KEY=your_news_api_key
```

### Render
1. Create new Web Service
2. Connect repository
3. Set environment variables
4. Deploy

## 📄 License

MIT
