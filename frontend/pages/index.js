import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import TopStories from '../components/TopStories';
import ExploreCategories from '../components/ExploreCategories';
import TopTrending from '../components/TopTrending';
import CategoryBriefs from '../components/CategoryBriefs';
import CategoryPage from '../components/CategoryPage';
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
      <div className="container">
        {/* Homepage Sections - Only show on 'all' category without search */}
        {!search && category === 'all' ? (
          <>
            {/* Loading State */}
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
                <p>No news articles found.</p>
              </div>
            ) : (
              <>
                {/* Top Stories Section */}
                <TopStories stories={news} />

                {/* Explore Categories Section */}
                <ExploreCategories />

                {/* Top Trending Section */}
                <TopTrending news={news} />

                {/* Category Briefs Section */}
                <CategoryBriefs news={news} />
              </>
            )}
          </>
        ) : (
          /* Category Pages and Search Results – Magazine Layout */
          <>
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
              <CategoryPage
                category={category}
                news={news}
                totalResults={totalResults}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
                lastUpdated={news.length > 0 ? `${Math.floor((Date.now() - new Date(news[0]?.publishedAt)) / 60000)} minutes ago` : null}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
