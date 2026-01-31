import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// News API
export const newsAPI = {
  getNews: async (category = 'all', page = 1, pageSize = 20, search = null) => {
    const params = { category, page, pageSize };
    
    // Add search parameter if provided
    if (search) {
      params.search = search;
    }
    
    const response = await api.get('/news', {
      params: params,
    });
    return response.data;
  },

  getHeadlines: async (page = 1, pageSize = 10) => {
    const response = await api.get('/news/headlines', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getTrendingNews: async (page = 1, pageSize = 30) => {
    const response = await api.get('/news/trending', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getArticleContent: async (url) => {
    const response = await api.post('/news/article-content', { url });
    return response.data;
  },
};

// Saved Articles API
export const savedArticlesAPI = {
  saveArticle: async (articleData) => {
    const response = await api.post('/saved', articleData);
    return response.data;
  },

  getSavedArticles: async () => {
    const response = await api.get('/saved');
    return response.data;
  },

  deleteSavedArticle: async (articleId) => {
    const response = await api.delete(`/saved/${articleId}`);
    return response.data;
  },
};

// My News API
export const myNewsAPI = {
  getMyNews: async (page = 1, pageSize = 20, refresh = false) => {
    const params = { page, pageSize };
    
    // Add timestamp to force cache bypass on refresh
    if (refresh) {
      params._t = Date.now();
    }
    
    const response = await api.get('/my-news', { params });
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/my-news/preferences');
    return response.data;
  },

  updatePreferences: async (topics) => {
    const response = await api.put('/my-news/preferences', { topics });
    return response.data;
  },

  saveArticle: async (articleData) => {
    const response = await api.post('/my-news/save', articleData);
    return response.data;
  },

  unsaveArticle: async (articleUrl) => {
    const encodedUrl = encodeURIComponent(articleUrl);
    const response = await api.delete(`/my-news/save/${encodedUrl}`);
    return response.data;
  },

  getSavedArticles: async () => {
    const response = await api.get('/my-news/saved');
    return response.data;
  },
};

export default api;
