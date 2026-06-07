import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaClock, FaNewspaper, FaBookmark, FaRegBookmark, FaExternalLinkAlt } from 'react-icons/fa';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/MyNewsCard.module.css';

const MyNewsCard = ({ article, onSave, onUnsave, isSaved = false, compact = false }) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSaving(true);
    try {
      if (saved) {
        await onUnsave?.(article.url);
        setSaved(false);
      } else {
        await onSave?.(article);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setSaving(false);
    }
  };

  // Create slug for article URL
  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  };

  const slug = createSlug(article.title);
  
  const normalizedArticle = {
    ...article,
    source: typeof article.source === 'string' ? article.source : article.source?.name || t('common.unknownSource')
  };
  
  const articleData = encodeURIComponent(JSON.stringify(normalizedArticle));
  const articleUrl = `/article/${slug}?data=${articleData}`;

  const hasImage = article.urlToImage && article.urlToImage !== '';
  const imageUrl = article.urlToImage || 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News';

  const source = normalizedArticle.source;

  if (compact) {
    return (
      <div className={styles.compactCard}>
        <Link href={articleUrl} className={styles.compactLink}>
          <div className={styles.compactContent}>
            {hasImage && (
              <div className={styles.compactImage}>
                <Image
                  src={imageUrl}
                  alt={article.title}
                  width={120}
                  height={80}
                  className={styles.compactImg}
                  unoptimized
                />
              </div>
            )}
            <div className={styles.compactInfo}>
              <h4 className={styles.compactTitle}>{article.title}</h4>
              <div className={styles.compactMeta}>
                <span className={styles.source}>{source}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.time}>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </div>
        </Link>
        <button
          onClick={handleSaveToggle}
          className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
          disabled={saving}
          title={saved ? t('myCard.removeSaved') : t('myCard.saveArticle')}
        >
          {saved ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>
    );
  }

  return (
    <article className={styles.card}>
      <Link href={articleUrl} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={article.title}
              width={600}
              height={340}
              className={styles.image}
              unoptimized
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News';
              }}
            />
          ) : (
            <div className={styles.noImagePlaceholder}>
              <div className={styles.placeholderIcon}>
                <FaNewspaper />
              </div>
              <p className={styles.placeholderText}>{t('newsCard.techNews')}</p>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.content}>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <FaNewspaper className={styles.metaIcon} />
            <span className={styles.source}>{source}</span>
          </div>
          <div className={styles.metaRight}>
            <FaClock className={styles.metaIcon} />
            <span className={styles.time}>{formatDate(article.publishedAt)}</span>
          </div>
        </div>

        <Link href={articleUrl} className={styles.titleLink}>
          <h3 className={styles.title}>{article.title}</h3>
        </Link>

        {article.description && (
          <p className={styles.description}>{article.description}</p>
        )}

        <div className={styles.actions}>
          <Link href={articleUrl} className={styles.readMore}>
            {t('myCard.readFull')} <FaExternalLinkAlt />
          </Link>
          <button
            onClick={handleSaveToggle}
            className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
            disabled={saving}
            title={saved ? t('myCard.removeSaved') : t('myCard.saveArticle')}
          >
            {saved ? <FaBookmark /> : <FaRegBookmark />}
            {saved ? t('myCard.saved') : t('myCard.save')}
          </button>
        </div>
      </div>
    </article>
  );
};

export default MyNewsCard;
