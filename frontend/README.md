# NEWSY TECH Frontend

Modern Next.js frontend for NEWSY TECH - Technology News Platform

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your backend API URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── components/          # Reusable React components
│   ├── Navbar.js       # Navigation bar
│   ├── Footer.js       # Footer component
│   ├── NewsCard.js     # Article card
│   ├── CategoryFilter.js
│   ├── Layout.js       # Page wrapper
│   └── LoadingSpinner.js
├── context/            # React Context
│   └── AuthContext.js  # Authentication state
├── pages/              # Next.js pages (routes)
│   ├── _app.js        # App wrapper
│   ├── index.js       # Homepage
│   ├── login.js       # Login page
│   ├── signup.js      # Signup page
│   ├── profile.js     # User profile
│   └── article/
│       └── [slug].js  # Article detail
├── styles/             # CSS modules
├── utils/              # Utility functions
│   ├── api.js         # API client
│   └── formatDate.js  # Date utilities
└── public/             # Static files
```

## 🎨 Pages

### Homepage (`/`)
- Latest tech news
- Category filtering
- Infinite scroll / Load more
- Responsive grid layout

### Login (`/login`)
- Email/password authentication
- Form validation
- Redirect after login

### Signup (`/signup`)
- User registration
- Password confirmation
- Email validation

### Profile (`/profile`)
- View user information
- Edit profile
- Change password
- Protected route

### Article Detail (`/article/[slug]`)
- Article information
- External link to source
- Back navigation

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🎨 Styling

### Color Theme
```css
--primary-red: #dc143c
--primary-blue: #0066cc
--dark-blue: #003d7a
--light-blue: #e6f2ff
--light-red: #ffe6eb
```

### CSS Architecture
- Global styles: `styles/globals.css`
- Component styles: CSS Modules (`.module.css`)
- Responsive breakpoints: 768px, 1024px

## 🧩 Components

### Navbar
- Logo and branding
- Category navigation
- Auth buttons (Login/Signup)
- User menu (when logged in)
- Mobile responsive menu

### NewsCard
- Article image
- Title and description
- Source and date
- Category badge
- Read more link

### CategoryFilter
- Category buttons
- Active state
- Icon indicators
- Responsive layout

### Layout
- Page wrapper
- SEO meta tags
- Navbar and Footer
- Consistent structure

### LoadingSpinner
- Loading indicator
- Customizable message
- Centered layout

## 🔐 Authentication

### AuthContext
Provides authentication state and methods:

```javascript
const { user, login, logout, register, updateUser, isAuthenticated } = useAuth();
```

### Protected Routes
```javascript
useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login');
  }
}, [isAuthenticated]);
```

## 📡 API Integration

### API Client (`utils/api.js`)

```javascript
import { authAPI, newsAPI, savedArticlesAPI } from '../utils/api';

// Authentication
await authAPI.login({ email, password });
await authAPI.register({ name, email, password });
await authAPI.getProfile();

// News
await newsAPI.getNews(category, page, pageSize);
await newsAPI.getHeadlines(page, pageSize);

// Saved Articles
await savedArticlesAPI.saveArticle(articleData);
await savedArticlesAPI.getSavedArticles();
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Features
- Hamburger menu
- Touch-friendly buttons
- Optimized images
- Stacked layouts

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

## ⚡ Performance

### Optimizations
- Next.js Image optimization
- Code splitting
- Lazy loading
- CSS modules (scoped styles)
- Minimal dependencies

### SEO
- Meta tags in Layout component
- Semantic HTML
- Descriptive titles
- Alt text for images

## 🎯 Features

- ✅ Server-side rendering (SSR)
- ✅ Static site generation (SSG)
- ✅ API routes
- ✅ Image optimization
- ✅ Code splitting
- ✅ Hot reload
- ✅ CSS modules
- ✅ TypeScript ready

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads with news
- [ ] Categories filter correctly
- [ ] Login/logout works
- [ ] Signup creates account
- [ ] Profile updates save
- [ ] Articles open correctly
- [ ] Mobile menu works
- [ ] Responsive on all devices

## 📦 Dependencies

### Core
- next - React framework
- react - UI library
- react-dom - React DOM renderer

### Utilities
- axios - HTTP client
- react-icons - Icon library

## 🔍 Troubleshooting

### Images not loading
- Check Next.js image domains in `next.config.js`
- Verify image URLs are valid
- Check network tab for errors

### API calls failing
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Check browser console for errors

### Styles not applying
- Clear `.next` folder
- Restart dev server
- Check CSS module naming

## 📝 Code Style

### Component Structure
```javascript
import { useState, useEffect } from 'react';
import styles from '../styles/Component.module.css';

export default function Component() {
  // State
  const [data, setData] = useState(null);

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}
```

## 📄 License

MIT
