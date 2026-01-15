import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { newsAPI } from '../utils/api';
import { FaFire, FaCalendarWeek } from 'react-icons/fa';
import styles from '../styles/Trending.module.css';

export default function Trending() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingNews();
  }, []);

  const fetchTrendingNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch trending news from the past week
      const data = await newsAPI.getTrendingNews(1, 30);
      
      console.log('Trending API Response:', data); // Debug log
      
      // Check if articles exist and have data
      if (data && data.articles && data.articles.length > 0) {
        setNews(data.articles);
      } else {
        console.warn('No articles in response:', data);
        // Fallback: try to fetch regular news instead
        const fallbackData = await newsAPI.getNews('all', 1, 30);
        setNews(fallbackData.articles || []);
      }
    } catch (err) {
      console.error('Error fetching trending news:', err);
      setError('Failed to load trending news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get current week date range
  const getWeekDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    const options = { month: 'short', day: 'numeric' };
    return `${firstDay.toLocaleDateString('en-US', options)} - ${lastDay.toLocaleDateString('en-US', options)}`;
  };

  return (
    <Layout title="Trending Tech News This Week - NEWSY TECH">
      <div className={styles.trendingPage}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <div className={styles.fireIcon}>
                <FaFire />
              </div>
              <h1 className={styles.heroTitle}>
                <span className={styles.trendingText}>Trending</span>
                <span className={styles.thisWeek}>This Week</span>
              </h1>
              <p className={styles.heroSubtitle}>
                <FaCalendarWeek /> {getWeekDateRange()}
              </p>
              <p className={styles.heroDescription}>
                Discover the most popular and talked-about technology stories of the week
              </p>
            </div>
          </div>
        </div>

        {/* Trending News Section */}
        <div className="container">
          <div className={styles.trendingSection}>
            {loading ? (
              <LoadingSpinner message="Loading trending news..." />
            ) : error ? (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={fetchTrendingNews} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            ) : news.length === 0 ? (
              <div className={styles.noNews}>
                <p>No trending news available at the moment.</p>
              </div>
            ) : (
              <>
                <div className={styles.statsBar}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{news.length}</span>
                    <span className={styles.statLabel}>Trending Stories</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>🔥</span>
                    <span className={styles.statLabel}>Hot Topics</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>7</span>
                    <span className={styles.statLabel}>Days Coverage</span>
                  </div>
                </div>

                <div className={styles.newsGrid}>
                  {news.map((article, index) => (
                    <div key={`${article.url}-${index}`} className={styles.newsItem}>
                      <div className={styles.trendingBadge}>
                        <FaFire /> #{index + 1}
                      </div>
                      <NewsCard article={article} category="trending" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
