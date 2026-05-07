import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaShareAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/timeAgo';
import styles from '../styles/TopTrending.module.css';

export default function TopTrending({ news }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [imageErrors, setImageErrors] = useState({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Rotating words for "Trending" — translated each render so language changes
  // immediately propagate to the rotation.
  const rotatingWords = [
    t('topTrending.word.trending'),
    t('topTrending.word.hot'),
    t('topTrending.word.popular'),
    t('topTrending.word.viral'),
  ];

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

  const formatDate = (dateString) => formatTimeAgo(dateString, t);

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

    // Use Next.js client-side navigation (router.push) instead of
    // window.location.href so the React tree (and AuthProvider) is not
    // remounted on every click — otherwise the user gets unexpectedly
    // logged out on a full page reload.
    router.push(`/article/${slug}?data=${articleData}`);
  };

  if (!trendingArticles || trendingArticles.length === 0) return null;

  return (
    <section className={styles.topTrendingSection}>
      <div className={styles.container}>
        <div className={`${styles.header} anim-slide`}>
          <h2 className={styles.title}>
            {t('topTrending.top')}{' '}
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
            {t('common.more')}
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
                  <span className={styles.readTime}>4 {t('time.min')}</span>
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
                      aria-label={t('topTrending.shareLabel')}
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
