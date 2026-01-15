const axios = require('axios');

/**
 * @desc    Get tech news from NewsAPI
 * @route   GET /api/news
 * @access  Public
 */
const getNews = async (req, res) => {
  try {
    const { category, page = 1, pageSize = 20 } = req.query;

    // Define tech-related keywords for different categories
    const categoryKeywords = {
      ai: 'artificial intelligence OR machine learning OR AI',
      startups: 'startup OR venture capital OR tech startup',
      software: 'software OR programming OR developer',
      gadgets: 'gadgets OR smartphone OR technology devices',
      cybersecurity: 'cybersecurity OR data breach OR hacking',
      all: 'technology OR tech OR software OR AI OR startup'
    };

    const searchQuery = categoryKeywords[category] || categoryKeywords.all;

    // Fetch news from NewsAPI
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: searchQuery,
        language: 'en',
        sortBy: 'publishedAt',
        page: page,
        pageSize: pageSize,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    res.json({
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('News API Error:', error.response?.data || error.message);
    
    // Return mock data if API fails (for development)
    if (process.env.NODE_ENV === 'development') {
      res.json({
        success: true,
        totalResults: 3,
        articles: [
          {
            source: { id: null, name: 'TechCrunch' },
            author: 'Sample Author',
            title: 'Latest AI Breakthrough in Machine Learning',
            description: 'Researchers have made significant progress in AI technology...',
            url: 'https://techcrunch.com/sample',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=AI+News',
            publishedAt: new Date().toISOString(),
            content: 'Sample content for development...'
          },
          {
            source: { id: null, name: 'The Verge' },
            author: 'Tech Reporter',
            title: 'New Startup Raises $50M for Revolutionary Tech',
            description: 'A promising startup has secured major funding...',
            url: 'https://theverge.com/sample',
            urlToImage: 'https://via.placeholder.com/800x400/dc143c/ffffff?text=Startup+News',
            publishedAt: new Date().toISOString(),
            content: 'Sample content for development...'
          },
          {
            source: { id: null, name: 'Wired' },
            author: 'Security Expert',
            title: 'Major Cybersecurity Threat Discovered',
            description: 'Security researchers have identified a new vulnerability...',
            url: 'https://wired.com/sample',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Security+News',
            publishedAt: new Date().toISOString(),
            content: 'Sample content for development...'
          }
        ],
        page: 1,
        pageSize: 20
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news',
        error: error.message
      });
    }
  }
};

/**
 * @desc    Get top tech headlines
 * @route   GET /api/news/headlines
 * @access  Public
 */
const getHeadlines = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'technology',
        language: 'en',
        page: page,
        pageSize: pageSize,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    res.json({
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('News API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch headlines',
      error: error.message
    });
  }
};

/**
 * @desc    Get trending tech news from the past week
 * @route   GET /api/news/trending
 * @access  Public
 */
const getTrendingNews = async (req, res) => {
  try {
    const { page = 1, pageSize = 30 } = req.query;

    // Get date from 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const fromDate = weekAgo.toISOString().split('T')[0];

    // Fetch trending news from the past week, sorted by popularity
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'technology OR tech OR AI OR startup OR gadgets',
        language: 'en',
        from: fromDate,
        sortBy: 'popularity', // Sort by popularity for trending
        page: page,
        pageSize: pageSize,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    res.json({
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      dateRange: {
        from: fromDate,
        to: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Trending News API Error:', error.response?.data || error.message);
    
    // Return mock data if API fails (for development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock trending data for development');
      res.json({
        success: true,
        totalResults: 12,
        articles: [
          {
            source: { id: null, name: 'TechCrunch' },
            author: 'Tech Reporter',
            title: '🔥 Breaking: Major AI Breakthrough Transforms Industry',
            description: 'This week\'s hottest story: Revolutionary AI technology changes everything...',
            url: 'https://techcrunch.com/sample-trending-1',
            urlToImage: 'https://via.placeholder.com/800x400/dc143c/ffffff?text=Trending+AI',
            publishedAt: new Date().toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'The Verge' },
            author: 'Innovation Writer',
            title: '🚀 Startup Unicorn: $1B Valuation in Record Time',
            description: 'The tech world is buzzing about this incredible success story...',
            url: 'https://theverge.com/sample-trending-2',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Trending+Startup',
            publishedAt: new Date().toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'Wired' },
            author: 'Security Analyst',
            title: '⚠️ Massive Security Breach Affects Millions',
            description: 'Cybersecurity experts warn about widespread vulnerability...',
            url: 'https://wired.com/sample-trending-3',
            urlToImage: 'https://via.placeholder.com/800x400/ff4500/ffffff?text=Trending+Security',
            publishedAt: new Date().toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'Ars Technica' },
            author: 'Hardware Expert',
            title: 'Next-Gen Processors Break Performance Records',
            description: 'Latest processors deliver unprecedented computing power...',
            url: 'https://arstechnica.com/sample-trending-4',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Trending+Hardware',
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'TechCrunch' },
            author: 'Mobile Expert',
            title: 'Revolutionary Smartphone Features Coming This Year',
            description: 'Top smartphone makers reveal groundbreaking innovations...',
            url: 'https://techcrunch.com/sample-trending-5',
            urlToImage: 'https://via.placeholder.com/800x400/dc143c/ffffff?text=Trending+Mobile',
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'The Verge' },
            author: 'Cloud Specialist',
            title: 'Cloud Computing Costs Drop by 50%',
            description: 'Major cloud providers announce significant price reductions...',
            url: 'https://theverge.com/sample-trending-6',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Trending+Cloud',
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'Engadget' },
            author: 'Gaming Reporter',
            title: 'VR Gaming Reaches New Heights with Latest Technology',
            description: 'Virtual reality gaming experiences become more immersive...',
            url: 'https://engadget.com/sample-trending-7',
            urlToImage: 'https://via.placeholder.com/800x400/ff4500/ffffff?text=Trending+VR',
            publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'CNET' },
            author: 'Software Developer',
            title: 'Open Source Project Gains Massive Community Support',
            description: 'Developers worldwide contribute to revolutionary open source initiative...',
            url: 'https://cnet.com/sample-trending-8',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Trending+OpenSource',
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'TechRadar' },
            author: 'Network Expert',
            title: '5G Networks Expand to Rural Areas Nationwide',
            description: 'Telecommunications companies accelerate 5G rollout...',
            url: 'https://techradar.com/sample-trending-9',
            urlToImage: 'https://via.placeholder.com/800x400/dc143c/ffffff?text=Trending+5G',
            publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'ZDNet' },
            author: 'Enterprise Tech',
            title: 'Enterprise Software Market Sees Record Growth',
            description: 'Business technology adoption accelerates across industries...',
            url: 'https://zdnet.com/sample-trending-10',
            urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Trending+Enterprise',
            publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'MIT Technology Review' },
            author: 'Research Analyst',
            title: 'Quantum Computing Makes Commercial Debut',
            description: 'First commercial quantum computers become available for businesses...',
            url: 'https://technologyreview.com/sample-trending-11',
            urlToImage: 'https://via.placeholder.com/800x400/ff4500/ffffff?text=Trending+Quantum',
            publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          },
          {
            source: { id: null, name: 'VentureBeat' },
            author: 'AI Researcher',
            title: 'Machine Learning Models Achieve Human-Level Performance',
            description: 'Latest AI models demonstrate remarkable capabilities...',
            url: 'https://venturebeat.com/sample-trending-12',
            urlToImage: 'https://via.placeholder.com/800x400/dc143c/ffffff?text=Trending+ML',
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            content: 'Trending content...'
          }
        ],
        page: 1,
        pageSize: 30,
        dateRange: {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending news',
        error: error.message
      });
    }
  }
};

module.exports = {
  getNews,
  getHeadlines,
  getTrendingNews
};
