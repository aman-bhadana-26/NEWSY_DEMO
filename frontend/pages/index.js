import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import CategoryFilter from '../components/CategoryFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import { newsAPI } from '../utils/api';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const { category = 'all' } = router.query;

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsAPI.getNews(category, pageNum, 20);
      
      if (pageNum === 1) {
        setNews(data.articles);
      } else {
        setNews((prev) => [...prev, ...data.articles]);
      }
      
      setHasMore(data.articles.length === 20);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNews(page + 1);
    }
  };

  const getCategoryName = (cat) => {
    const categoryNames = {
      all: 'Latest Tech News',
      ai: 'Artificial Intelligence',
      startups: 'Startups',
      software: 'Software Development',
      gadgets: 'Gadgets & Devices',
      cybersecurity: 'Cybersecurity',
    };
    return categoryNames[cat] || 'Tech News';
  };

  return (
    <Layout title={`${getCategoryName(category)} - NEWSY TECH`}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            <span className={styles.heroRed}>NEWSY</span>
            <span className={styles.heroBlue}>TECH</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your trusted source for the latest technology news
          </p>
        </div>
      </div>

      <div className="container">
        <CategoryFilter currentCategory={category} />

        <div className={styles.newsSection}>
          <h2 className={styles.sectionTitle}>{getCategoryName(category)}</h2>

          {loading && page === 1 ? (
            <LoadingSpinner message="Loading latest news..." />
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={() => fetchNews(1)} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className={styles.noNews}>
              <p>No news articles found for this category.</p>
            </div>
          ) : (
            <>
              <div className={styles.newsGrid}>
                {news.map((article, index) => (
                  <NewsCard
                    key={`${article.url}-${index}`}
                    article={article}
                    category={category !== 'all' ? category : null}
                  />
                ))}
              </div>

              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <button
                    onClick={loadMore}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Articles'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
