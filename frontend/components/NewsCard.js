import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../utils/formatDate';
import { FaNewspaper } from 'react-icons/fa';
import styles from '../styles/NewsCard.module.css';

const NewsCard = ({ article, category }) => {
  // Create a URL-friendly slug from the title
  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const slug = createSlug(article.title);
  
  // Encode full article data in URL
  const articleData = encodeURIComponent(JSON.stringify({
    title: article.title,
    description: article.description,
    content: article.content,
    author: article.author,
    source: article.source?.name || 'Unknown Source',
    publishedAt: article.publishedAt,
    url: article.url,
    urlToImage: article.urlToImage
  }));
  
  const articleUrl = `/article/${encodeURIComponent(slug)}?data=${articleData}`;

  // Check if article has image
  const hasImage = article.urlToImage && article.urlToImage !== '';
  const imageUrl = article.urlToImage || 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News';

  return (
    <div className={styles.card}>
      <Link href={articleUrl} className={styles.imageLink}>
        {hasImage ? (
          <div className={styles.imageContainer}>
            <Image
              src={imageUrl}
              alt={article.title}
              width={800}
              height={400}
              className={styles.image}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News';
              }}
            />
            {category && (
              <span className={styles.categoryBadge}>{category}</span>
            )}
          </div>
        ) : (
          <div className={styles.imageContainer}>
            <div className={styles.noImagePlaceholder}>
              <div className={styles.placeholderIcon}>
                <FaNewspaper />
              </div>
              <p className={styles.placeholderText}>Tech News</p>
            </div>
            {category && (
              <span className={styles.categoryBadge}>{category}</span>
            )}
          </div>
        )}
      </Link>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.source}>{article.source?.name || 'Unknown Source'}</span>
          <span className={styles.date}>{formatDate(article.publishedAt)}</span>
        </div>

        <Link href={articleUrl}>
          <h3 className={styles.title}>{article.title}</h3>
        </Link>

        {article.description && (
          <p className={styles.description}>
            {article.description.length > 150
              ? `${article.description.substring(0, 150)}...`
              : article.description}
          </p>
        )}

        <div className={styles.footer}>
          <Link href={articleUrl} className={styles.readMore}>
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
