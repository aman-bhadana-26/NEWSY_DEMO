import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { myNewsAPI } from '../utils/api';
import Layout from '../components/Layout';
import TopicSelector from '../components/TopicSelector';
import MyNewsCard from '../components/MyNewsCard';
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
        // Reset state when fetching first page
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
      
      // Calculate if more articles are available
      // Use isLastPage from backend, but also check if we received a full page
      const receivedFullPage = data.articles.length === 20;
      const notLastPage = data.isLastPage === false;
      const moreAvailable = notLastPage && receivedFullPage;
      setHasMore(moreAvailable);
      
      console.log('MY NEWS - Load More Check:', {
        pageNum,
        receivedArticles: data.articles.length,
        receivedFullPage,
        isLastPage: data.isLastPage,
        totalResults: data.totalResults,
        totalLoadedSoFar: pageNum === 1 ? data.articles.length : news.length + data.articles.length,
        shouldShowLoadMore: moreAvailable
      });

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
      // Refresh news feed
      fetchNews(1);
    } catch (err) {
      console.error('Error saving preferences:', err);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleSaveArticle = async (article) => {
    try {
      const articleData = {
        title: article.title,
        url: article.url,
        urlToImage: article.urlToImage,
        source: typeof article.source === 'string' ? article.source : article.source?.name,
        author: article.author,
        description: article.description,
        content: article.content,
        publishedAt: article.publishedAt
      };
      
      await myNewsAPI.saveArticle(articleData);
      await fetchSavedArticles();
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleUnsaveArticle = async (articleUrl) => {
    try {
      await myNewsAPI.unsaveArticle(articleUrl);
      await fetchSavedArticles();
    } catch (err) {
      console.error('Error removing saved article:', err);
      alert('Failed to remove article. Please try again.');
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'feed') {
      // Pass true to indicate this is a refresh
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Layout title="My News - NEWSY TECH">
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const isArticleSaved = (articleUrl) => {
    return savedArticles.some(saved => saved.url === articleUrl);
  };

  return (
    <Layout title="My News - NEWSY TECH">
      <div className={styles.myNewsPage}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <FaNewspaper className={styles.titleIcon} />
                My News
              </h1>
              <p className={styles.pageSubtitle}>
                Your personalized technology news feed
              </p>
            </div>
            <button onClick={handleRefresh} className={styles.refreshButton} disabled={loading}>
              <FaSync className={loading ? styles.spinning : ''} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
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
        </div>

        {/* Topic Selector */}
        {activeTab === 'feed' && (
          <TopicSelector
            initialTopics={userTopics}
            onSave={handleSavePreferences}
            loading={preferencesLoading}
          />
        )}

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'feed' ? (
            // News Feed
            <>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <LoadingSpinner />
                  <p className={styles.loadingText}>Loading your personalized news...</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <FaExclamationCircle className={styles.errorIcon} />
                  <p className={styles.errorText}>{error}</p>
                  <button onClick={() => fetchNews(1)} className={styles.retryButton}>
                    Try Again
                  </button>
                </div>
              ) : news.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaNewspaper className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No news articles found</h3>
                  <p className={styles.emptyText}>
                    Try selecting different topics or check back later for updates.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.newsGrid}>
                    {news.map((article, index) => (
                      <MyNewsCard
                        key={`${article.url}-${index}`}
                        article={article}
                        onSave={handleSaveArticle}
                        onUnsave={handleUnsaveArticle}
                        isSaved={isArticleSaved(article.url)}
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className={styles.loadMoreContainer}>
                      <button
                        onClick={handleLoadMore}
                        className={styles.loadMoreButton}
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <>
                            <span className={styles.spinner}></span>
                            Loading More...
                          </>
                        ) : (
                          'Load More Articles'
                        )}
                      </button>
                    </div>
                  )}

                  {!hasMore && news.length > 0 && (
                    <div className={styles.endMessage}>
                      <p>📰 You've reached the end of available articles</p>
                      <p className={styles.endMessageSub}>
                        Showing all articles matching your selected topics. Try selecting different topics or check back later for new content.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Saved Articles
            <>
              {savedLoading ? (
                <div className={styles.loadingContainer}>
                  <LoadingSpinner />
                  <p className={styles.loadingText}>Loading saved articles...</p>
                </div>
              ) : savedArticles.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaBookmark className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No saved articles yet</h3>
                  <p className={styles.emptyText}>
                    Articles you save will appear here for easy access later.
                  </p>
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={styles.browseButton}
                  >
                    Browse My Feed
                  </button>
                </div>
              ) : (
                <div className={styles.newsGrid}>
                  {savedArticles.map((article, index) => (
                    <MyNewsCard
                      key={`${article.url}-${index}`}
                      article={article}
                      onSave={handleSaveArticle}
                      onUnsave={handleUnsaveArticle}
                      isSaved={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyNews;
