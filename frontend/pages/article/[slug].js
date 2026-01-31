import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getFullDate } from '../../utils/formatDate';
import { newsAPI } from '../../utils/api';
import { FaArrowLeft, FaClock, FaUser, FaNewspaper } from 'react-icons/fa';
import styles from '../../styles/Article.module.css';

export default function Article() {
  const router = useRouter();
  const { data } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [fullContent, setFullContent] = useState(null);
  const [loadingFullContent, setLoadingFullContent] = useState(false);
  const [contentError, setContentError] = useState(null);

  useEffect(() => {
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        setArticle(decodedData);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing article data:', error);
        setLoading(false);
      }
    }
  }, [data]);

  // Function to fetch full article content
  const fetchFullContent = async () => {
    if (!article || !article.url) return;
    
    setLoadingFullContent(true);
    setContentError(null);
    
    try {
      console.log('Fetching full content for:', article.url);
      const response = await newsAPI.getArticleContent(article.url);
      
      if (response.success && response.article) {
        setFullContent(response.article);
        setShowFullArticle(true);
        
        // Show info if partial content
        if (response.partial) {
          setContentError('Partial content loaded. Some details may be missing.');
        }
      } else {
        setContentError(response.message || 'Unable to load full article content');
        console.error('Content extraction failed:', response);
      }
    } catch (error) {
      console.error('Error fetching full content:', error);
      setContentError('Failed to load full article. The content may be protected or unavailable.');
    } finally {
      setLoadingFullContent(false);
    }
  };

  // Function to clean content (remove [+XXXX chars] truncation markers)
  const cleanContent = (content) => {
    if (!content) return '';
    // Remove the [+XXXX chars] marker that NewsAPI adds
    return content.replace(/\s*\[\+\d+\s+chars?\]/g, '');
  };

  // Function to get preview content (15-20 lines)
  const getPreviewContent = (content) => {
    if (!content) return '';
    
    const cleaned = cleanContent(content);
    const sentences = cleaned.split(/[.!?]+\s+/).filter(s => s.trim());
    
    // Show first 5-6 sentences (roughly 15-20 lines)
    const previewSentences = sentences.slice(0, 6);
    
    return previewSentences.join('. ') + (previewSentences.length > 0 ? '.' : '');
  };

  const hasMoreContent = (content) => {
    if (!content) return false;
    const cleaned = cleanContent(content);
    const sentences = cleaned.split(/[.!?]+\s+/).filter(s => s.trim());
    return sentences.length > 6;
  };

  if (loading) {
    return (
      <Layout title="Loading Article - NEWSY TECH">
        <LoadingSpinner message="Loading article..." />
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout title="Article Not Found - NEWSY TECH">
        <div className={styles.articleContainer}>
          <div className={styles.articleContent}>
            <button onClick={() => router.back()} className={styles.backButton}>
              <FaArrowLeft /> Back to News
            </button>
            <div className={styles.errorMessage}>
              <h2>Article Not Found</h2>
              <p>The article you're looking for could not be loaded.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const hasImage = article.urlToImage && article.urlToImage !== '';
  const imageUrl = article.urlToImage || 'https://via.placeholder.com/1200x600/0066cc/ffffff?text=Tech+News';

  return (
    <Layout title={`${article.title} - NEWSY TECH`}>
      <div className={styles.articleContainer}>
        <div className={styles.articleContent}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> Back to News
          </button>

          <article className={styles.articleCard}>
            {/* Article Header */}
            <header className={styles.articleHeader}>
              <h1 className={styles.articleTitle}>{article.title}</h1>
              
              <div className={styles.articleMeta}>
                <div className={styles.metaItem}>
                  <FaNewspaper className={styles.metaIcon} />
                  <span>{article.source}</span>
                </div>
                {article.author && (
                  <div className={styles.metaItem}>
                    <FaUser className={styles.metaIcon} />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <FaClock className={styles.metaIcon} />
                  <span>{getFullDate(article.publishedAt)}</span>
                </div>
              </div>
            </header>

            {/* Featured Image or Placeholder */}
            {hasImage ? (
              <div className={styles.featuredImage}>
                <Image
                  src={imageUrl}
                  alt={article.title}
                  width={1200}
                  height={600}
                  className={styles.image}
                  priority
                />
              </div>
            ) : (
              <div className={styles.noImagePlaceholder}>
                <div className={styles.placeholderIcon}>
                  <FaNewspaper />
                </div>
                <p className={styles.placeholderText}>Technology News</p>
              </div>
            )}

            {/* Article Body */}
            <div className={styles.articleBody}>
              {/* Description/Lead */}
              {article.description && (
                <div className={styles.articleLead}>
                  <p>{article.description}</p>
                </div>
              )}

              {/* Content - Preview or Full */}
              <div className={`${styles.articleText} ${!showFullArticle ? styles.preview : ''}`}>
                {showFullArticle && fullContent ? (
                  // Show full extracted content
                  <div className={styles.fullContent}>
                    {fullContent.content.split('\n\n').map((paragraph, index) => (
                      paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                    <div className={styles.contentNote}>
                      <p><strong>✅ Full Article Loaded:</strong> Content extracted from {article.source}. Displaying the complete article for your convenience.</p>
                    </div>
                  </div>
                ) : article.content ? (
                  // Show preview from NewsAPI
                  <>
                    <p>{getPreviewContent(article.content)}</p>
                    {hasMoreContent(article.content) && (
                      <div className={styles.fadeOut}></div>
                    )}
                  </>
                ) : (
                  // Fallback to description
                  <p>{article.description || 'Article content preview...'}</p>
                )}
              </div>

              {/* Error Message */}
              {contentError && (
                <div className={styles.errorNote}>
                  <p><strong>⚠️ Notice:</strong> {contentError}</p>
                </div>
              )}

              {/* Read Full Article Button */}
              {!showFullArticle && (
                <div className={styles.readMoreSection}>
                  <button
                    onClick={fetchFullContent}
                    className={styles.readMoreButton}
                    disabled={loadingFullContent}
                  >
                    {loadingFullContent ? (
                      <>⏳ Loading Full Article...</>
                    ) : (
                      <>📖 Read Full Article on NEWSY TECH →</>
                    )}
                  </button>
                </div>
              )}

              {/* Show Less Button */}
              {showFullArticle && fullContent && (
                <div className={styles.readMoreSection}>
                  <button
                    onClick={() => setShowFullArticle(false)}
                    className={styles.readMoreButton}
                  >
                    <FaArrowLeft /> Show Less
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
}
