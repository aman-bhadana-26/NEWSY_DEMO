import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../utils/formatDate';
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
  const articleUrl = `/article/${encodeURIComponent(slug)}?url=${encodeURIComponent(article.url)}`;

  // Fallback image if none provided
  const imageUrl = article.urlToImage || 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News';

  return (
    <div className={styles.card}>
      <Link href={articleUrl} className={styles.imageLink}>
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
