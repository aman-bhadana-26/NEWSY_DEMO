import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../styles/CategoryBriefs.module.css';

export default function CategoryBriefs({ news }) {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState({});

  const categories = [
    { 
      name: 'AI', 
      value: 'ai',
      description: 'Latest developments in artificial intelligence, machine learning, and automation',
      keywords: ['AI', 'artificial intelligence', 'machine learning', 'neural', 'GPT', 'algorithm', 'automation', 'deep learning']
    },
    { 
      name: 'Startup', 
      value: 'startups',
      description: 'Breaking news from the startup ecosystem, funding rounds, and entrepreneurship',
      keywords: ['startup', 'founder', 'entrepreneur', 'venture', 'funding', 'raise', 'investment', 'unicorn']
    },
    { 
      name: 'Software', 
      value: 'software',
      description: 'Programming trends, developer tools, frameworks, and software engineering',
      keywords: ['software', 'programming', 'code', 'developer', 'app', 'application', 'framework', 'API']
    },
    { 
      name: 'Gadgets', 
      value: 'gadgets',
      description: 'Latest tech devices, product launches, reviews, and consumer electronics',
      keywords: ['gadget', 'device', 'phone', 'laptop', 'hardware', 'product', 'smartphone', 'tablet']
    },
    { 
      name: 'Cybersecurity', 
      value: 'cybersecurity',
      description: 'Security threats, data breaches, privacy issues, and protection strategies',
      keywords: ['security', 'hack', 'breach', 'cyber', 'malware', 'threat', 'vulnerability', 'encryption']
    }
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

  const handleArticleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
                <div className={styles.headerLeft}>
                  <h2 className={styles.categoryTitle}>{category.name}</h2>
                  <p className={styles.categoryDescription}>{category.description}</p>
                </div>
                <button 
                  className={styles.viewAllBtn}
                  onClick={() => handleViewAll(category.value)}
                >
                  All {category.name} →
                </button>
              </div>

              {/* Articles Layout */}
              <div className={styles.articlesLayout}>
                {/* Featured Article - Left */}
                <div 
                  className={styles.featuredArticle}
                  onClick={() => handleArticleClick(featuredArticle.url)}
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
                        <p className={styles.placeholderText}>No Image</p>
                      </div>
                    )}
                    <div className={styles.featuredOverlay}></div>
                  </div>
                  
                  <div className={styles.featuredContent}>
                    <span className={styles.featuredBadge}>{category.name}</span>
                    <h3 className={styles.featuredTitle}>{featuredArticle.title}</h3>
                    <p className={styles.featuredDescription}>
                      {featuredArticle.description || 'Read the full story to learn more about this developing news.'}
                    </p>
                    <div className={styles.featuredMeta}>
                      <span className={styles.metaSource}>{featuredArticle.source?.name || 'Unknown Source'}</span>
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
                      className={styles.smallArticle}
                      onClick={() => handleArticleClick(article.url)}
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
                          <span className={styles.smallSource}>{article.source?.name || 'Unknown'}</span>
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
