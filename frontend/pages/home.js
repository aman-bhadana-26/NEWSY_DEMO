import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { TopStoriesSkeleton, NewsGridSkeleton } from '../components/Skeleton';
import TopStories from '../components/TopStories';
import ExploreCategories from '../components/ExploreCategories';
import TopTrending from '../components/TopTrending';
import CategoryBriefs from '../components/CategoryBriefs';
import CategoryPage from '../components/CategoryPage';
import { newsAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/timeAgo';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { category = 'all', search, from, to, source, author } = router.query;

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Reset when category, search, or advanced filters change
    setNews([]);
    setPage(1);
    setHasMore(true);
    fetchNews(1);
  }, [category, search, from, to, source, author]);

  const fetchNews = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const filters = {};
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (source && source.trim()) filters.source = source.trim();
      if (author && author.trim()) filters.author = author.trim();

      // Fetch news with search parameter and advanced filters
      const data = await newsAPI.getNews(
        category,
        pageNum,
        20,
        search && search.trim() ? search.trim() : null,
        filters
      );

      if (pageNum === 1) {
        setNews(data.articles);
      } else {
        setNews((prev) => [...prev, ...data.articles]);
      }

      const total = data.totalResults || 0;
      setTotalResults(total);

      // Update hasMore based on actual returned articles length vs total results
      const totalArticlesCount = pageNum === 1 ? data.articles.length : news.length + data.articles.length;
      setHasMore(data.articles.length === 20 && totalArticlesCount < total);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(t('home.error'));
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
      all: t('home.latestTechNews'),
      ai: t('footer.artificialIntelligence'),
      startups: t('cat.startups'),
      software: t('home.softwareDevelopment'),
      gadgets: t('home.gadgetsDevices'),
      cybersecurity: t('cat.cybersecurity'),
    };
    return categoryNames[cat] || t('home.techNews');
  };

  const isSearchOrFilterActive = !!(
    (search && search.trim()) ||
    from ||
    to ||
    (source && source.trim()) ||
    (author && author.trim())
  );

  return (
    <Layout title={`${getCategoryName(category)} - NEWSY TECH`}>
      <div className="container">
        {/* Homepage Sections - Only show on 'all' category without search or filters */}
        {!isSearchOrFilterActive && category === 'all' ? (
          <>
            {/* Loading State */}
            {loading && page === 1 ? (
              <TopStoriesSkeleton />
            ) : error ? (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => fetchNews(1)} className={styles.retryButton}>
                  {t('common.tryAgain')}
                </button>
              </div>
            ) : news.length === 0 ? (
              <div className={styles.noNews}>
                <p>{t('home.noNews')}</p>
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
              <NewsGridSkeleton count={8} />
            ) : error ? (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => fetchNews(1)} className={styles.retryButton}>
                  {t('common.tryAgain')}
                </button>
              </div>
            ) : news.length === 0 ? (
              <div className={styles.noNews}>
                <p>{t('home.noNewsCategory')}</p>
              </div>
            ) : (
              <CategoryPage
                category={category}
                news={news}
                totalResults={totalResults}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
                lastUpdated={news.length > 0 ? formatTimeAgo(news[0]?.publishedAt, t) : null}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
