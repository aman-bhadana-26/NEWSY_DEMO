import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { myNewsAPI } from '../utils/api';
import TopicSelector from '../components/TopicSelector';
import CategoryPage from '../components/CategoryPage';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaNewspaper, FaBookmark, FaSync, FaExclamationCircle } from 'react-icons/fa';
import { useNewsData } from '../hooks/useNewsData';
import styles from '../styles/MyNews.module.css';

const MyNews = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'saved'

  // User preferences
  const [userTopics, setUserTopics] = useState(['all']);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  // News feed
  const [news, setNews] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Saved articles
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/my-news');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch user preferences
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
      fetchSavedArticles();
    }
  }, [isAuthenticated]);

  const fetchPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const data = await myNewsAPI.getPreferences();
      setUserTopics(data.topics || ['all']);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const cacheKey = `my-news-${user?.id || 'user'}`;
  const { data: initialData, loading: initialLoading, error: initialError, mutate } = useNewsData(
    cacheKey,
    () => myNewsAPI.getMyNews(1, 20, false),
    { enabled: isAuthenticated && !preferencesLoading }
  );

  useEffect(() => {
    if (initialData) {
      setNews(initialData.articles || []);
      setTotalResults(initialData.totalResults || 0);
      const receivedFullPage = (initialData.articles || []).length === 20;
      const notLastPage = initialData.isLastPage === false;
      setHasMore(notLastPage && receivedFullPage);
      setPage(1);
    }
  }, [initialData]);

  const loading = initialLoading && news.length === 0;
  const error = initialError ? t('myNews.error') : null;

  const fetchSavedArticles = async () => {
    try {
      setSavedLoading(true);
      const data = await myNewsAPI.getSavedArticles();
      setSavedArticles(data.savedArticles || []);
    } catch (err) {
      console.error('Error fetching saved articles:', err);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleSavePreferences = async (topics) => {
    try {
      await myNewsAPI.updatePreferences(topics);
      setUserTopics(topics);
      mutate();
    } catch (err) {
      console.error('Error saving preferences:', err);
      alert(t('myNews.savePrefError'));
    }
  };

  const handleRefresh = async () => {
    if (activeTab === 'feed') {
      try {
        await mutate(() => myNewsAPI.getMyNews(1, 20, true));
      } catch (err) {
        console.error('Error refreshing news:', err);
      }
    } else {
      fetchSavedArticles();
    }
  };

  const handleLoadMore = async () => {
    if (!loadingMore && hasMore) {
      try {
        setLoadingMore(true);
        const nextPage = page + 1;
        const data = await myNewsAPI.getMyNews(nextPage, 20, false);
        setNews(prev => [...prev, ...data.articles]);
        setTotalResults(data.totalResults || 0);
        const receivedFullPage = data.articles.length === 20;
        const notLastPage = data.isLastPage === false;
        setHasMore(notLastPage && receivedFullPage);
        setPage(nextPage);
      } catch (err) {
        console.error('Error fetching more news:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // ── Loading while checking auth ──
  if (authLoading) {
    return (
      <div className={styles.stateContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ── Render ──
  return (
    <>
      <Head>
        <title>My News - NEWSY TECH</title>
      </Head>
      <div className={styles.myNewsPage}>

        {/* ── Header: tabs + refresh ── */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.tabs}>
              <button
                onClick={() => setActiveTab('feed')}
                className={`${styles.tab} ${activeTab === 'feed' ? styles.activeTab : ''}`}
              >
                <FaNewspaper />
                {t('myNews.feed')}
                {news.length > 0 && <span className={styles.badge}>{news.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
              >
                <FaBookmark />
                {t('myNews.savedTab')}
                {savedArticles.length > 0 && <span className={styles.badge}>{savedArticles.length}</span>}
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className={styles.refreshButton}
              disabled={initialLoading || savedLoading}
            >
              <FaSync className={(initialLoading || savedLoading) ? styles.spinning : ''} />
              {t('myNews.refresh')}
            </button>
          </div>
        </div>

        {/* ── Feed Tab ── */}
        {activeTab === 'feed' && (
          <>
            <div className={styles.selectorWrapper}>
              <TopicSelector
                initialTopics={userTopics}
                onSave={handleSavePreferences}
                loading={preferencesLoading}
              />
            </div>
            {loading ? (
              <div className={styles.stateContainer}>
                <LoadingSpinner />
                <p className={styles.stateText}>{t('myNews.loading')}</p>
              </div>
            ) : error ? (
              <div className={styles.stateContainer}>
                <FaExclamationCircle className={styles.errorIcon} />
                <p className={styles.stateText}>{error}</p>
                <button onClick={() => mutate()} className={styles.actionBtn}>
                  {t('common.tryAgain')}
                </button>
              </div>
            ) : news.length === 0 ? (
              <div className={styles.stateContainer}>
                <FaNewspaper className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>{t('myNews.empty.feed.title')}</h3>
                <p className={styles.stateText}>
                  {t('myNews.empty.feed.text')}
                </p>
              </div>
            ) : (
              <div className={styles.feedWrapper}>
                <CategoryPage
                  category="mynews"
                  news={news}
                  totalResults={totalResults || news.length}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                  lastUpdated={null}
                />
              </div>
            )}
          </>
        )}

        {/* ── Saved Tab ── */}
        {activeTab === 'saved' && (
          <>
            {savedLoading ? (
              <div className={styles.stateContainer}>
                <LoadingSpinner />
                <p className={styles.stateText}>{t('myNews.savedLoading')}</p>
              </div>
            ) : savedArticles.length === 0 ? (
              <div className={styles.stateContainer}>
                <FaBookmark className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>{t('myNews.empty.saved.title')}</h3>
                <p className={styles.stateText}>
                  {t('myNews.empty.saved.text')}
                </p>
                <button onClick={() => setActiveTab('feed')} className={styles.actionBtn}>
                  {t('myNews.browseFeed')}
                </button>
              </div>
            ) : (
              <CategoryPage
                category="saved"
                news={savedArticles}
                totalResults={savedArticles.length}
                hasMore={false}
                loadingMore={false}
                onLoadMore={() => { }}
                lastUpdated={null}
              />
            )}
          </>
        )}

      </div>
    </>
  );
};

MyNews.show3DBackground = true;

export default MyNews;
