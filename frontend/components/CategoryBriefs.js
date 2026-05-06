import { useRouter } from 'next/router';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/timeAgo';
import styles from '../styles/CategoryBriefs.module.css';

export default function CategoryBriefs({ news }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [imageErrors, setImageErrors] = useState({});

  const categories = [
    {
      name: t('briefs.cat.ai.name'),
      value: 'ai',
      description: t('briefs.cat.ai.desc'),
      keywords: ['AI', 'artificial intelligence', 'machine learning', 'neural', 'GPT', 'algorithm', 'automation', 'deep learning'],
    },
    {
      name: t('briefs.cat.startups.name'),
      value: 'startups',
      description: t('briefs.cat.startups.desc'),
      keywords: ['startup', 'founder', 'entrepreneur', 'venture', 'funding', 'raise', 'investment', 'unicorn'],
    },
    {
      name: t('briefs.cat.software.name'),
      value: 'software',
      description: t('briefs.cat.software.desc'),
      keywords: ['software', 'programming', 'code', 'developer', 'app', 'application', 'framework', 'API'],
    },
    {
      name: t('briefs.cat.gadgets.name'),
      value: 'gadgets',
      description: t('briefs.cat.gadgets.desc'),
      keywords: ['gadget', 'device', 'phone', 'laptop', 'hardware', 'product', 'smartphone', 'tablet'],
    },
    {
      name: t('briefs.cat.cybersecurity.name'),
      value: 'cybersecurity',
      description: t('briefs.cat.cybersecurity.desc'),
      keywords: ['security', 'hack', 'breach', 'cyber', 'malware', 'threat', 'vulnerability', 'encryption'],
    },
  ];

  const handleImageError = (articleUrl) => {
    setImageErrors(prev => ({ ...prev, [articleUrl]: true }));
  };

  const getCategoryArticles = (categoryData) => {
    const { keywords } = categoryData;
    
    const filtered = news.filter(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });

    // Return top 5 articles (1 featured + 4 small)
    if (filtered.length >= 5) {
      return filtered.slice(0, 5);
    } else {
      // Fallback: take some random articles to fill the gap
      const remaining = 5 - filtered.length;
      const randomArticles = news
        .filter(a => !filtered.includes(a))
        .slice(0, remaining);
      return [...filtered, ...randomArticles].slice(0, 5);
    }
  };

  const handleViewAll = (categoryValue) => {
    router.push(`/?category=${categoryValue}`);
  };

  const handleArticleClick = (article) => {
    // Create URL-friendly slug from title
    const slug = article.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    // Encode article data
    const articleData = encodeURIComponent(JSON.stringify({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'Unknown Source',
      author: article.author
    }));
    
    // Navigate to internal article page
    router.push(`/article/${slug}?data=${articleData}`);
  };

  const formatDate = (dateString) => formatTimeAgo(dateString, t);

  return (
    <section className={styles.categoryBriefs}>
      <div className={styles.container}>
        {categories.map((category) => {
          const articles = getCategoryArticles(category);
          
          if (articles.length === 0) return null;

          const [featuredArticle, ...smallArticles] = articles;

          return (
            <div key={category.value} className={styles.categorySection}>
              {/* Category Header */}
              <div className={styles.categoryHeader}>
                <div className={`${styles.headerLeft} anim-slide`}>
                  <h2 className={styles.categoryTitle}>{category.name}</h2>
                  <p className={styles.categoryDescription}>{category.description}</p>
                </div>
                <button 
                  className={styles.viewAllBtn}
                  onClick={() => handleViewAll(category.value)}
                >
                  {t('briefs.allPrefix')} {category.name} →
                </button>
              </div>

              {/* Articles Layout */}
              <div className={styles.articlesLayout}>
                {/* Featured Article - Left */}
                <div 
                  className={`${styles.featuredArticle} anim-scale`}
                  onClick={() => handleArticleClick(featuredArticle)}
                >
                  <div className={styles.featuredImage}>
                    {featuredArticle.urlToImage && !imageErrors[featuredArticle.url] ? (
                      <img 
                        src={featuredArticle.urlToImage}
                        alt={featuredArticle.title}
                        onError={() => handleImageError(featuredArticle.url)}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <div className={styles.placeholderIcon}>📰</div>
                        <p className={styles.placeholderText}>{t('briefs.noImage')}</p>
                      </div>
                    )}
                    <div className={styles.featuredOverlay}></div>
                  </div>
                  
                  <div className={styles.featuredContent}>
                    <span className={styles.featuredBadge}>{category.name}</span>
                    <h3 className={styles.featuredTitle}>{featuredArticle.title}</h3>
                    <p className={styles.featuredDescription}>
                      {featuredArticle.description || t('briefs.fallbackDescription')}
                    </p>
                    <div className={styles.featuredMeta}>
                      <span className={styles.metaSource}>{featuredArticle.source?.name || t('common.unknownSource')}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaDate}>{formatDate(featuredArticle.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Small Articles Grid - Right */}
                <div className={styles.smallArticlesGrid}>
                  {smallArticles.slice(0, 4).map((article, index) => (
                    <div 
                      key={index}
                      className={`${styles.smallArticle} anim-fade-up delay-${index + 1}`}
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className={styles.smallImage}>
                        {article.urlToImage && !imageErrors[article.url] ? (
                          <img 
                            src={article.urlToImage}
                            alt={article.title}
                            onError={() => handleImageError(article.url)}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.smallPlaceholder}>
                            <span className={styles.smallIcon}>📰</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.smallContent}>
                        <h4 className={styles.smallTitle}>{article.title}</h4>
                        <div className={styles.smallMeta}>
                          <span className={styles.smallSource}>{article.source?.name || t('common.unknown')}</span>
                          <span className={styles.metaDivider}>•</span>
                          <span className={styles.smallDate}>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
