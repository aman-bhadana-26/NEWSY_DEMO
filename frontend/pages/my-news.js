import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { myNewsAPI } from '../utils/api';
import Layout from '../components/Layout';
import TopicSelector from '../components/TopicSelector';
import CategoryPage from '../components/CategoryPage';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaNewspaper, FaBookmark, FaSync, FaExclamationCircle } from 'react-icons/fa';
import styles from '../styles/MyNews.module.css';

const MyNews = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'saved'

  // User preferences
  const [userTopics, setUserTopics] = useState(['all']);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  // News feed
  const [news, setNews] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch news when preferences change
  useEffect(() => {
    if (isAuthenticated && !preferencesLoading) {
      fetchNews(1);
    }
  }, [userTopics, isAuthenticated, preferencesLoading]);

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

  const fetchNews = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setNews([]);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const data = await myNewsAPI.getMyNews(pageNum, 20, isRefresh);

      if (pageNum === 1) {
        setNews(data.articles);
      } else {
        setNews(prev => [...prev, ...data.articles]);
      }

      setPage(pageNum);
      setTotalResults(data.totalResults || 0);

      const receivedFullPage = data.articles.length === 20;
      const notLastPage = data.isLastPage === false;
      setHasMore(notLastPage && receivedFullPage);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load personalized news. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
      fetchNews(1);
    } catch (err) {
      console.error('Error saving preferences:', err);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'feed') {
      fetchNews(1, true);
    } else {
      fetchSavedArticles();
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNews(page + 1);
    }
  };

  // ── Loading while checking auth ──
  if (authLoading) {
    return (
      <Layout title="My News - NEWSY TECH">
        <div className={styles.stateContainer}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  // ── Render ──
  return (
    <Layout title="My News - NEWSY TECH">
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
                My Feed
                {news.length > 0 && <span className={styles.badge}>{news.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
              >
                <FaBookmark />
                Saved Articles
                {savedArticles.length > 0 && <span className={styles.badge}>{savedArticles.length}</span>}
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className={styles.refreshButton}
              disabled={loading || savedLoading}
            >
              <FaSync className={(loading || savedLoading) ? styles.spinning : ''} />
              Refresh
            </button>
          </div>

          {/* Topic selector (feed only) */}
          {activeTab === 'feed' && (
            <TopicSelector
              initialTopics={userTopics}
              onSave={handleSavePreferences}
              loading={preferencesLoading}
            />
          )}
        </div>

        {/* ── Feed Tab ── */}
        {activeTab === 'feed' && (
          <>
            {loading ? (
              <div className={styles.stateContainer}>
                <LoadingSpinner />
                <p className={styles.stateText}>Loading your personalized news…</p>
              </div>
            ) : error ? (
              <div className={styles.stateContainer}>
                <FaExclamationCircle className={styles.errorIcon} />
                <p className={styles.stateText}>{error}</p>
                <button onClick={() => fetchNews(1)} className={styles.actionBtn}>
                  Try Again
                </button>
              </div>
            ) : news.length === 0 ? (
              <div className={styles.stateContainer}>
                <FaNewspaper className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No news articles found</h3>
                <p className={styles.stateText}>
                  Try selecting different topics or check back later for updates.
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
                <p className={styles.stateText}>Loading saved articles…</p>
              </div>
            ) : savedArticles.length === 0 ? (
              <div className={styles.stateContainer}>
                <FaBookmark className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No saved articles yet</h3>
                <p className={styles.stateText}>
                  Articles you save will appear here for easy access later.
                </p>
                <button onClick={() => setActiveTab('feed')} className={styles.actionBtn}>
                  Browse My Feed
                </button>
              </div>
            ) : (
              <CategoryPage
                category="saved"
                news={savedArticles}
                totalResults={savedArticles.length}
                hasMore={false}
                loadingMore={false}
                onLoadMore={() => {}}
                lastUpdated={null}
              />
            )}
          </>
        )}

      </div>
    </Layout>
  );
};

export default MyNews;
