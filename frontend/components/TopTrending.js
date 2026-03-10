import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaShareAlt } from 'react-icons/fa';
import styles from '../styles/TopTrending.module.css';

export default function TopTrending({ news }) {
  const [imageErrors, setImageErrors] = useState({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Rotating words for "Trending"
  const rotatingWords = ['Trending', 'Hot', 'Popular', 'Viral'];

  // Use the same news data passed from parent
  const trendingArticles = news ? news.slice(0, 12) : [];

  // Rotate words every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const handleImageError = (articleUrl) => {
    setImageErrors(prev => ({ ...prev, [articleUrl]: true }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleShare = (e, article) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: article.url
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(article.url);
    }
  };

  const handleArticleClick = (article) => {
    const title = article.title.split(' - ')[0];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const articleData = encodeURIComponent(JSON.stringify({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown',
      author: article.author
    }));
    
    window.location.href = `/article/${slug}?data=${articleData}`;
  };

  if (!trendingArticles || trendingArticles.length === 0) return null;

  return (
    <section className={styles.topTrendingSection}>
      <div className={styles.container}>
        <div className={`${styles.header} anim-slide`}>
          <h2 className={styles.title}>
            Top{' '}
            <span className={styles.rotatingTextWrapper}>
              <span 
                key={currentWordIndex}
                className={styles.rotatingText}
              >
                {rotatingWords[currentWordIndex]}
              </span>
            </span>
          </h2>
          <Link href="/trending" className={styles.moreLink}>
            MORE ›
          </Link>
        </div>

        <div className={styles.scrollContainer}>
          <div className={styles.cardsTrack}>
            {trendingArticles.map((article, index) => (
              <div
                key={`${article.url}-${index}`}
                className={`${styles.trendingCard} anim-scale delay-${(index % 6) + 1}`}
                onClick={() => handleArticleClick(article)}
              >
                <div className={styles.cardImage}>
                  {article.urlToImage && !imageErrors[article.url] ? (
                    <img 
                      src={article.urlToImage}
                      alt={article.title}
                      onError={() => handleImageError(article.url)}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span className={styles.placeholderIcon}>📰</span>
                    </div>
                  )}
                  <div className={styles.imageOverlay} />
                  <span className={styles.readTime}>4 min</span>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{article.title}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaDate}>
                      {formatDate(article.publishedAt)}
                    </span>
                    <button 
                      className={styles.shareButton}
                      onClick={(e) => handleShare(e, article)}
                      aria-label="Share article"
                    >
                      <FaShareAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
