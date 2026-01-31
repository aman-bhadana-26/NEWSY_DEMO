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
  const { category = 'all', search } = router.query;

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Reset when category or search changes
    setNews([]);
    setPage(1);
    setHasMore(true);
    fetchNews(1);
  }, [category, search]);

  const fetchNews = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      // Pass search query to API - backend will handle the search
      const queryParams = {
        category,
        page: pageNum,
        pageSize: 20
      };
      
      // Add search parameter if exists
      if (search && search.trim()) {
        queryParams.search = search.trim();
      }
      
      // Fetch news with search parameter
      const data = await newsAPI.getNews(
        queryParams.category,
        queryParams.page,
        queryParams.pageSize,
        queryParams.search
      );
      
      if (pageNum === 1) {
        setNews(data.articles);
      } else {
        setNews((prev) => [...prev, ...data.articles]);
      }
      
      setTotalResults(data.totalResults || 0);
      setHasMore(data.articles.length === 20 && news.length + data.articles.length < data.totalResults);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
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

  const getPageTitle = () => {
    if (search) {
      const catName = category !== 'all' ? ` in ${getCategoryName(category)}` : '';
      return `Search Results for "${search}"${catName}`;
    }
    return getCategoryName(category);
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{getPageTitle()}</h2>
            {totalResults > 0 && (
              <p className={styles.resultsCount}>
                Showing <strong>{news.length}</strong> of <strong>{totalResults.toLocaleString()}</strong> articles
              </p>
            )}
          </div>

          {loading && page === 1 ? (
            <LoadingSpinner message="Loading latest news..." />
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={() => fetchNews(1)} className={styles.retryButton}>
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

              {/* Load More Button */}
              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <button
                    onClick={loadMore}
                    className={styles.loadMoreButton}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className={styles.spinner}></span>
                        Loading More Articles...
                      </>
                    ) : (
                      <>
                        📰 Load More News
                      </>
                    )}
                  </button>
                  {!loadingMore && (
                    <p className={styles.loadMoreHint}>
                      {totalResults - news.length > 0 
                        ? `${(totalResults - news.length).toLocaleString()} more articles available`
                        : 'More articles available'}
                    </p>
                  )}
                </div>
              )}

              {/* End of Results */}
              {!hasMore && news.length > 0 && (
                <div className={styles.endOfResults}>
                  <div className={styles.endLine}></div>
                  <p>You've reached the end of {getCategoryName(category)}</p>
                  <div className={styles.endLine}></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
