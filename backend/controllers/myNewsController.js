const axios = require('axios');
const User = require('../models/User');

/**
 * @desc    Get personalized news based on user preferences
 * @route   GET /api/my-news
 * @access  Private
 */
const getMyNews = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const userId = req.user.id;

    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userTopics = user.preferences?.topics || ['all'];
    
    // If no topics selected or only 'all', show general tech news
    if (userTopics.length === 0 || (userTopics.length === 1 && userTopics[0] === 'all')) {
      return getGeneralTechNews(page, pageSize, res);
    }

    // Build search query based on user topics
    const topicKeywords = {
      ai: 'artificial intelligence OR machine learning OR AI OR neural networks',
      startups: 'startup OR venture capital OR tech startup OR funding',
      software: 'software OR programming OR developer OR coding',
      gadgets: 'gadgets OR smartphone OR technology devices OR hardware',
      cybersecurity: 'cybersecurity OR data breach OR hacking OR security'
    };

    // Combine all user topic keywords
    const searchQuery = userTopics
      .filter(topic => topic !== 'all')
      .map(topic => `(${topicKeywords[topic] || topic})`)
      .join(' OR ');

    // Fetch personalized news from NewsAPI
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: searchQuery || 'technology',
          language: 'en',
          sortBy: 'publishedAt',
          page: page,
          pageSize: pageSize,
          apiKey: process.env.NEWS_API_KEY
        }
      });

      const articlesReceived = response.data.articles.length;
      const isLastPage = articlesReceived < pageSize;

      console.log(`MY NEWS API - Page ${page}: Received ${articlesReceived} articles, Total: ${response.data.totalResults}, isLastPage: ${isLastPage}`);

      res.json({
        success: true,
        totalResults: response.data.totalResults,
        articles: response.data.articles,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        isLastPage: isLastPage,
        userTopics: userTopics
      });
    } catch (apiError) {
      console.error('NewsAPI Error:', apiError.message);
      // Return mock data if API fails
      return getMockPersonalizedNews(userTopics, page, pageSize, res);
    }

  } catch (error) {
    console.error('Get My News Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personalized news',
      error: error.message
    });
  }
};

/**
 * @desc    Update user topic preferences
 * @route   PUT /api/my-news/preferences
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topics } = req.body;

    // Validate topics
    const validTopics = ['all', 'ai', 'startups', 'software', 'gadgets', 'cybersecurity'];
    const invalidTopics = topics.filter(topic => !validTopics.includes(topic));
    
    if (invalidTopics.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid topics: ${invalidTopics.join(', ')}`
      });
    }

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.topics': topics },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      topics: user.preferences.topics
    });

  } catch (error) {
    console.error('Update Preferences Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Get user preferences
 * @route   GET /api/my-news/preferences
 * @access  Private
 */
const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      topics: user.preferences?.topics || ['all'],
      savedArticles: user.preferences?.savedArticles || []
    });

  } catch (error) {
    console.error('Get Preferences Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Save/bookmark an article
 * @route   POST /api/my-news/save
 * @access  Private
 */
const saveArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, url, urlToImage, source, author, description, content, publishedAt } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if article is already saved
    const alreadySaved = user.preferences?.savedArticles?.some(
      article => article.url === url
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Article already saved'
      });
    }

    // Add article to saved articles
    if (!user.preferences) {
      user.preferences = { topics: ['all'], savedArticles: [] };
    }
    if (!user.preferences.savedArticles) {
      user.preferences.savedArticles = [];
    }

    user.preferences.savedArticles.unshift({
      title,
      url,
      urlToImage,
      source,
      author,
      description,
      content,
      publishedAt,
      savedAt: new Date()
    });

    // Limit to 100 saved articles
    if (user.preferences.savedArticles.length > 100) {
      user.preferences.savedArticles = user.preferences.savedArticles.slice(0, 100);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Article saved successfully',
      savedArticles: user.preferences.savedArticles
    });

  } catch (error) {
    console.error('Save Article Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving article',
      error: error.message
    });
  }
};

/**
 * @desc    Remove saved article
 * @route   DELETE /api/my-news/save/:articleUrl
 * @access  Private
 */
const unsaveArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const articleUrl = decodeURIComponent(req.params.articleUrl);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.preferences?.savedArticles) {
      return res.status(404).json({
        success: false,
        message: 'No saved articles found'
      });
    }

    // Remove article from saved articles
    user.preferences.savedArticles = user.preferences.savedArticles.filter(
      article => article.url !== articleUrl
    );

    await user.save();

    res.json({
      success: true,
      message: 'Article removed from saved',
      savedArticles: user.preferences.savedArticles
    });

  } catch (error) {
    console.error('Unsave Article Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing saved article',
      error: error.message
    });
  }
};

/**
 * @desc    Get saved articles
 * @route   GET /api/my-news/saved
 * @access  Private
 */
const getSavedArticles = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      savedArticles: user.preferences?.savedArticles || []
    });

  } catch (error) {
    console.error('Get Saved Articles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved articles',
      error: error.message
    });
  }
};

// Helper function for general tech news
const getGeneralTechNews = async (page, pageSize, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'technology OR tech OR software OR AI OR startup',
        language: 'en',
        sortBy: 'publishedAt',
        page: page,
        pageSize: pageSize,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    const articlesReceived = response.data.articles.length;
    const isLastPage = articlesReceived < pageSize;

    res.json({
      success: true,
      totalResults: response.data.totalResults,
      articles: response.data.articles,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      isLastPage: isLastPage,
      userTopics: ['all']
    });
  } catch (error) {
    console.error('General Tech News Error:', error);
    return getMockPersonalizedNews(['all'], page, pageSize, res);
  }
};

// Helper function for mock data
const getMockPersonalizedNews = (topics, page, pageSize, res) => {
  const mockArticles = [
    {
      source: { id: null, name: 'TechCrunch' },
      author: 'Sarah Johnson',
      title: 'AI Revolution: New Language Model Achieves Human-Level Understanding',
      description: 'Breakthrough in artificial intelligence as researchers develop a model with unprecedented comprehension capabilities.',
      url: 'https://example.com/ai-breakthrough',
      urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=AI+News',
      publishedAt: new Date().toISOString(),
      content: 'A groundbreaking achievement in AI research...'
    },
    {
      source: { id: null, name: 'Wired' },
      author: 'Michael Chen',
      title: 'Startup Raises $100M to Revolutionize Cloud Computing',
      description: 'Silicon Valley startup secures massive funding round to build next-generation infrastructure.',
      url: 'https://example.com/startup-funding',
      urlToImage: 'https://via.placeholder.com/800x400/dc143c/ffffff?text=Startup+News',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      content: 'In a major funding announcement...'
    },
    {
      source: { id: null, name: 'The Verge' },
      author: 'Emily Rodriguez',
      title: 'New Smartphone Feature Could Change How We Use Devices',
      description: 'Latest gadget innovation promises to transform mobile computing experience.',
      url: 'https://example.com/smartphone-feature',
      urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Gadgets',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      content: 'Tech giant unveils revolutionary feature...'
    }
  ];

  res.json({
    success: true,
    totalResults: mockArticles.length,
    articles: mockArticles,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    isLastPage: true,
    userTopics: topics,
    note: 'Using mock data - NewsAPI unavailable'
  });
};

module.exports = {
  getMyNews,
  updatePreferences,
  getPreferences,
  saveArticle,
  unsaveArticle,
  getSavedArticles
};
