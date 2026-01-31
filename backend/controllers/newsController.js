const axios = require('axios');
const cheerio = require('cheerio');
const { parse } = require('node-html-parser');

/**
 * @desc    Get tech news from NewsAPI
 * @route   GET /api/news
 * @access  Public
 */
const getNews = async (req, res) => {
  try {
    const { category, page = 1, pageSize = 20, search } = req.query;

    let searchQuery;

    // If user provides a search keyword, use it directly
    if (search && search.trim()) {
      // Combine user search with category if not 'all'
      if (category && category !== 'all') {
        const categoryKeywords = {
          ai: 'artificial intelligence OR machine learning OR AI',
          startups: 'startup OR venture capital',
          software: 'software OR programming',
          gadgets: 'gadgets OR smartphone OR devices',
          cybersecurity: 'cybersecurity OR security'
        };
        
        // Combine user search term with category context
        searchQuery = `${search.trim()} AND (${categoryKeywords[category]})`;
      } else {
        // Just use the user's search term
        searchQuery = search.trim();
      }
    } else {
      // Default category-based search
      const categoryKeywords = {
        ai: 'artificial intelligence OR machine learning OR AI',
        startups: 'startup OR venture capital OR tech startup',
        software: 'software OR programming OR developer',
        gadgets: 'gadgets OR smartphone OR technology devices',
        cybersecurity: 'cybersecurity OR data breach OR hacking',
        all: 'technology OR tech OR software OR AI OR startup'
      };
      searchQuery = categoryKeywords[category] || categoryKeywords.all;
    }

    console.log('NewsAPI Search Query:', searchQuery);

    // Fetch news from NewsAPI
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: searchQuery,
        language: 'en',
        sortBy: search ? 'relevancy' : 'publishedAt', // Sort by relevancy if searching
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
      searchQuery: search || null
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

/**
 * Helper function to extract article content using web scraping
 */
const scrapeArticleContent = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer, ads, etc.
    $('script, style, nav, footer, iframe, .ad, .advertisement, .social-share, .comments, header, aside').remove();

    // Try to find article content using common selectors
    let content = '';
    let title = '';
    let author = '';

    // Extract title
    title = $('h1').first().text().trim() || 
            $('title').text().trim() || 
            $('meta[property="og:title"]').attr('content') || '';

    // Extract author
    author = $('meta[name="author"]').attr('content') || 
             $('.author').first().text().trim() || 
             $('[rel="author"]').first().text().trim() || '';

    // Try multiple content selectors (ordered by specificity)
    const contentSelectors = [
      'article',
      '[role="article"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main article',
      'main',
      '.story-body',
      '.article-body'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        // Extract all paragraph text
        const paragraphs = element.find('p').map((i, el) => $(el).text().trim()).get();
        if (paragraphs.length > 3) { // At least 3 paragraphs
          content = paragraphs.filter(p => p.length > 50).join('\n\n');
          if (content.length > 500) { // At least 500 chars
            break;
          }
        }
      }
    }

    // Fallback: get all paragraphs from body
    if (!content || content.length < 500) {
      const allParagraphs = $('p').map((i, el) => $(el).text().trim()).get();
      content = allParagraphs
        .filter(p => p.length > 50 && !p.includes('cookie') && !p.includes('privacy'))
        .slice(0, 20) // First 20 paragraphs
        .join('\n\n');
    }

    return {
      title,
      author,
      content,
      success: content.length > 300
    };
  } catch (error) {
    console.error('Scraping error:', error.message);
    return { success: false, content: '', title: '', author: '' };
  }
};

/**
 * @desc    Get full article content from URL
 * @route   POST /api/news/article-content
 * @access  Public
 */
const getArticleContent = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Article URL is required'
      });
    }

    console.log(`Attempting to extract content from: ${url}`);

    // Method 1: Try direct web scraping (most reliable)
    const scrapedData = await scrapeArticleContent(url);
    
    if (scrapedData.success && scrapedData.content.length > 300) {
      console.log('✅ Successfully extracted via web scraping');
      return res.json({
        success: true,
        article: {
          title: scrapedData.title,
          author: scrapedData.author,
          content: scrapedData.content,
          publishedDate: '',
          image: '',
          siteName: new URL(url).hostname,
          method: 'web-scraping'
        }
      });
    }

    // Method 2: Try ArticleXtractor API as fallback
    try {
      console.log('Trying ArticleXtractor API...');
      const extractorResponse = await axios.post('https://articlextractor.com/api/extract', {
        url: url
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (extractorResponse.data && extractorResponse.data.data) {
        const articleData = extractorResponse.data.data;
        const content = articleData.text || articleData.content || '';
        
        if (content.length > 300) {
          console.log('✅ Successfully extracted via ArticleXtractor');
          return res.json({
            success: true,
            article: {
              title: articleData.title || '',
              author: articleData.author || '',
              content: content,
              publishedDate: articleData.date || '',
              image: articleData.image || articleData.top_image || '',
              siteName: articleData.site_name || '',
              method: 'articlextractor'
            }
          });
        }
      }
    } catch (apiError) {
      console.log('ArticleXtractor API failed:', apiError.message);
    }

    // Method 3: If both fail, return partial content or error
    if (scrapedData.content.length > 100) {
      console.log('⚠️ Returning partial content');
      return res.json({
        success: true,
        partial: true,
        article: {
          title: scrapedData.title,
          author: scrapedData.author,
          content: scrapedData.content,
          publishedDate: '',
          image: '',
          siteName: new URL(url).hostname,
          method: 'partial-scraping'
        }
      });
    }

    // All methods failed
    throw new Error('Unable to extract sufficient content from article');

  } catch (error) {
    console.error('❌ Article extraction error:', error.message);
    
    res.json({
      success: false,
      message: 'Unable to extract full article content. The article may be behind a paywall, require JavaScript rendering, or have strong anti-scraping protection.',
      error: error.message
    });
  }
};

module.exports = {
  getNews,
  getHeadlines,
  getTrendingNews,
  getArticleContent
};
