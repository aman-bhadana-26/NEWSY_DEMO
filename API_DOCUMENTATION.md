# NEWSY TECH API Documentation

Complete API reference for NEWSY TECH backend services.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: Required, max 50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "message": "User already exists"
}
```

---

### Login User

Authenticate existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### Get User Profile

Retrieve authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

---

### Update User Profile

Update authenticated user's information.

**Endpoint:** `PUT /api/auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "newpassword123"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Updated",
  "email": "john.new@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📰 News Endpoints

### Get Tech News

Fetch technology news articles with filtering.

**Endpoint:** `GET /api/news`

**Query Parameters:**
- `category` (optional): Filter by category
  - Values: `all`, `ai`, `startups`, `software`, `gadgets`, `cybersecurity`
  - Default: `all`
- `page` (optional): Page number
  - Default: `1`
- `pageSize` (optional): Articles per page
  - Default: `20`
  - Max: `100`

**Example Request:**
```
GET /api/news?category=ai&page=1&pageSize=20
```

**Success Response (200):**
```json
{
  "success": true,
  "totalResults": 150,
  "articles": [
    {
      "source": {
        "id": "techcrunch",
        "name": "TechCrunch"
      },
      "author": "John Smith",
      "title": "Latest AI Breakthrough in Machine Learning",
      "description": "Researchers have made significant progress...",
      "url": "https://techcrunch.com/article",
      "urlToImage": "https://techcrunch.com/image.jpg",
      "publishedAt": "2024-01-15T10:00:00Z",
      "content": "Full article content..."
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to fetch news",
  "error": "API rate limit exceeded"
}
```

---

### Get Top Headlines

Fetch top technology headlines.

**Endpoint:** `GET /api/news/headlines`

**Query Parameters:**
- `page` (optional): Page number, default: `1`
- `pageSize` (optional): Headlines per page, default: `10`

**Example Request:**
```
GET /api/news/headlines?page=1&pageSize=10
```

**Success Response (200):**
```json
{
  "success": true,
  "totalResults": 50,
  "articles": [...],
  "page": 1,
  "pageSize": 10
}
```

---

## 💾 Saved Articles Endpoints

### Save Article

Save an article to user's collection.

**Endpoint:** `POST /api/saved`

**Authentication:** Required

**Request Body:**
```json
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

**Success Response (201):**
```json
{
  "success": true,
  "article": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f191e810c19729de860ea",
    "title": "Article Title",
    "description": "Article description",
    "url": "https://example.com/article",
    "urlToImage": "https://example.com/image.jpg",
    "publishedAt": "2024-01-15T10:00:00Z",
    "source": "TechCrunch",
    "category": "ai",
    "savedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Article already saved"
}
```

---

### Get Saved Articles

Retrieve all saved articles for authenticated user.

**Endpoint:** `GET /api/saved`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "articles": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f191e810c19729de860ea",
      "title": "Article Title",
      "description": "Article description",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2024-01-15T10:00:00Z",
      "source": "TechCrunch",
      "category": "ai",
      "savedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### Delete Saved Article

Remove an article from saved collection.

**Endpoint:** `DELETE /api/saved/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: MongoDB ObjectId of the saved article

**Example Request:**
```
DELETE /api/saved/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Article removed"
}
```

**Error Response (404):**
```json
{
  "message": "Article not found"
}
```

**Error Response (401):**
```json
{
  "message": "Not authorized"
}
```

---

## 🏥 Health Check

### API Health Check

Check if API is running.

**Endpoint:** `GET /api/health`

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "NEWSY TECH API is running"
}
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔒 Error Handling

All error responses follow this format:

```json
{
  "message": "Human-readable error message",
  "error": "Detailed error (development only)"
}
```

---

## 🚀 Rate Limiting

### NewsAPI Limits
- Free tier: 100 requests per day
- Developer tier: 250 requests per day
- Business tier: Unlimited

### Recommendations
- Cache news responses on frontend
- Implement pagination
- Use appropriate page sizes

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get News
```bash
curl -X GET "http://localhost:5000/api/news?category=ai&page=1&pageSize=10"
```

### Save Article
```bash
curl -X POST http://localhost:5000/api/saved \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Article","url":"https://example.com","source":"Test"}'
```

---

## 📝 Notes

1. **JWT Tokens**: Tokens expire after 30 days
2. **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
3. **CORS**: Configured to accept requests from frontend URL
4. **News Data**: Fetched from NewsAPI.org in real-time
5. **Database**: MongoDB with Mongoose ODM

---

## 🔗 Related Documentation

- [Main README](README.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

---

**Last Updated:** January 2026
