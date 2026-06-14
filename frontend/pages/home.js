import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { TopStoriesSkeleton, NewsGridSkeleton } from '../components/Skeleton';
import TopStories from '../components/TopStories';
import ExploreCategories from '../components/ExploreCategories';
import TopTrending from '../components/TopTrending';
import CategoryBriefs from '../components/CategoryBriefs';
import CategoryPage from '../components/CategoryPage';
import { newsAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/timeAgo';
import { useNewsData, getNewsCacheKey } from '../hooks/useNewsData';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { category = 'all', search, from, to, source, author } = router.query;

  const [news, setNews] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const cacheKey = getNewsCacheKey(category, 1, search, from, to, source, author);
  const { data: initialData, loading: initialLoading, error: initialError, mutate } = useNewsData(
    cacheKey,
    () => newsAPI.getNews(
      category,
      1,
      20,
      search && search.trim() ? search.trim() : null,
      { from, to, source: source?.trim(), author: author?.trim() }
    )
  );

  useEffect(() => {
    if (initialData) {
      setNews(initialData.articles || []);
      setTotalResults(initialData.totalResults || 0);
      const articlesLen = (initialData.articles || []).length;
      setHasMore(articlesLen === 20 && articlesLen < (initialData.totalResults || 0));
      setPage(1);
    } else {
      setNews([]);
      setTotalResults(0);
      setHasMore(true);
      setPage(1);
    }
  }, [initialData]);

  const loading = initialLoading && news.length === 0;
  const error = initialError ? t('home.error') : null;

  const loadMore = async () => {
    if (!loading && !loadingMore && hasMore) {
      try {
        setLoadingMore(true);
        const nextPage = page + 1;
        const data = await newsAPI.getNews(
          category,
          nextPage,
          20,
          search && search.trim() ? search.trim() : null,
          { from, to, source: source?.trim(), author: author?.trim() }
        );
        setNews((prev) => [...prev, ...data.articles]);
        setTotalResults(data.totalResults || 0);
        const articlesCount = news.length + data.articles.length;
        setHasMore(data.articles.length === 20 && articlesCount < data.totalResults);
        setPage(nextPage);
      } catch (err) {
        console.error('Error fetching more news:', err);
      } finally {
        setLoadingMore(false);
      }
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
    <>
      <Head>
        <title>{`${getCategoryName(category)} - NEWSY TECH`}</title>
      </Head>
      <div className="container">
        {/* Homepage Sections - Only show on 'all' category without search or filters */}
        {!isSearchOrFilterActive && category === 'all' ? (
          <>
            {/* Loading State */}
            {loading ? (
              <TopStoriesSkeleton />
            ) : error ? (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => mutate()} className={styles.retryButton}>
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
            {loading ? (
              <NewsGridSkeleton count={8} />
            ) : error ? (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => mutate()} className={styles.retryButton}>
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
    </>
  );
}

Home.show3DBackground = true;
