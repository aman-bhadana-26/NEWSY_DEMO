import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { ArticleSkeleton } from '../../components/Skeleton';
import { getFullDate } from '../../utils/formatDate';
import { newsAPI } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import { FaArrowLeft } from 'react-icons/fa';
import ArticleComments from '../../components/ArticleComments';
import ArticleReactions from '../../components/ArticleReactions';
import { useReadingTracker } from '../../hooks/useReadingTracker';
import styles from '../../styles/Article.module.css';

// Detect category key from title/source. Returns a translation key suffix
// (e.g. 'ai', 'cybersecurity'); the caller resolves it via t('article.cat.<key>').
const detectCategoryKey = (article) => {
  const text = ((article?.title || '') + ' ' + (article?.source || '')).toLowerCase();
  if (text.includes('ai') || text.includes('artificial') || text.includes('gpt') || text.includes('openai') || text.includes('machine learning')) return 'ai';
  if (text.includes('cyber') || text.includes('hack') || text.includes('security') || text.includes('breach')) return 'cybersecurity';
  if (text.includes('software') || text.includes('dev') || text.includes('code') || text.includes('github')) return 'software';
  if (text.includes('gadget') || text.includes('device') || text.includes('hardware') || text.includes('chip')) return 'gadgets';
  if (text.includes('startup') || text.includes('funding') || text.includes('venture')) return 'startups';
  return 'tech';
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return 'NT';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

// Estimate read time
const readTime = (content, description, t) => {
  const text = (content || '') + (description || '');
  const words = text.split(/\s+/).length;
  return Math.max(2, Math.round(words / 200)) + ' ' + t('time.min');
};

export default function Article() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [fullContent, setFullContent] = useState(null);
  const [loadingFullContent, setLoadingFullContent] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);
  const [imageError, setImageError] = useState(false);

  const categoryKey = article ? detectCategoryKey(article) : 'tech';
  useReadingTracker(article, categoryKey);

  useEffect(() => {
    let queryData = data;
    if (!queryData && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      queryData = params.get('data');
    }

    if (queryData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(queryData));
        setArticle(decodedData);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing article data:', error);
        setLoading(false);
      }
    } else if (router.isReady && !router.query.data) {
      setLoading(false);
    }
  }, [data, router.isReady]);

  // Fetch sidebar stories
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await newsAPI.getNews({ category: 'all', page: 1, limit: 3 });
        if (res?.articles) {
          setRelatedStories(res.articles.filter(a => a.title !== article?.title).slice(0, 3));
        }
      } catch (_) {}
    };
    if (article) fetchRelated();
  }, [article]);

  const fetchFullContent = async () => {
    if (!article?.url) return;
    setLoadingFullContent(true);
    setContentError(null);
    try {
      const response = await newsAPI.getArticleContent(article.url);
      if (response.success && response.article) {
        setFullContent(response.article);
        setShowFullArticle(true);
        if (response.partial) setContentError(t('article.partialLoaded'));
      } else {
        setContentError(response.message || t('article.unableLoad'));
      }
    } catch {
      setContentError(t('article.failedLoad'));
    } finally {
      setLoadingFullContent(false);
    }
  };

  const cleanContent = (content) => {
    if (!content) return '';
    return content.replace(/\s*\[\+\d+\s+chars?\]/g, '');
  };

  const getPreviewContent = (content) => {
    if (!content) return '';
    const cleaned = cleanContent(content);
    const sentences = cleaned.split(/[.!?]+\s+/).filter(s => s.trim());
    return sentences.slice(0, 6).join('. ') + '.';
  };

  const hasMoreContent = (content) => {
    if (!content) return false;
    return cleanContent(content).split(/[.!?]+\s+/).filter(s => s.trim()).length > 6;
  };

  const createSlug = (a) => {
    const slug = a.title.split(' - ')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const encoded = encodeURIComponent(JSON.stringify({
      title: a.title, description: a.description, content: a.content,
      url: a.url, urlToImage: a.urlToImage, publishedAt: a.publishedAt,
      source: typeof a.source === 'string' ? a.source : a.source?.name || 'Unknown',
      author: a.author
    }));
    return `/article/${slug}?data=${encoded}`;
  };

  if (loading) {
    return (
      <Layout title="Loading Article – NEWSY TECH">
        <ArticleSkeleton />
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout title="Article Not Found – NEWSY TECH">
        <div className={styles.articleContainer}>
          <div className={styles.articleContent}>
            <button onClick={() => router.back()} className={styles.backButton}>
              <FaArrowLeft /> {t('article.back')}
            </button>
            <div className={styles.errorMessage}>
              <h2>{t('article.notFound.title')}</h2>
              <p>{t('article.notFound.text')}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const hasImage = article.urlToImage && article.urlToImage.trim() !== '';
  const category = t(`article.cat.${categoryKey}`);
  const authorInitials = getInitials(article.author);
  const sourceName = typeof article.source === 'string' ? article.source : article.source?.name || 'NEWSY TECH';
  const estRead = readTime(article.content, article.description, t);

  // Build breadcrumb
  const shortTitle = article.title?.length > 40 ? article.title.slice(0, 40) + '…' : article.title;

  return (
    <Layout title={`${article.title} – NEWSY TECH`}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span onClick={() => router.push('/')}>{t('nav.home')}</span>
        {' > '}
        <span onClick={() => router.push('/')}>{category}</span>
        {' > '}
        {shortTitle}
      </div>

      <div className={styles.articleLayout}>

        {/* ── MAIN COLUMN ── */}
        <main className={styles.mainColumn}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> {t('article.back')}
          </button>

          {/* Source + Category */}
          <div>
            <span className={styles.sourceBadge}>{sourceName.toUpperCase()}</span>
            <span className={styles.categoryTag}>{category.toUpperCase()}</span>
          </div>

          {/* Title */}
          <h1 className={styles.articleTitle}>{article.title}</h1>

          {/* Author meta */}
          <div className={styles.authorMeta}>
            <div className={styles.authorAvatar}>{authorInitials}</div>
            <div className={styles.authorInfo}>
              <div className={styles.authorName}>{article.author || t('article.author.staff')}</div>
              <div className={styles.authorRole}>{t('article.author.role')}</div>
            </div>
            <div className={styles.metaDivider} />
            <span className={styles.metaDate}>
              {getFullDate(article.publishedAt)} · {estRead}
            </span>
            <div className={styles.metaActions}>
              <button className={styles.metaBtn} onClick={() => navigator?.share?.({ title: article.title, url: window.location.href })}>{t('article.share')}</button>
            </div>
          </div>

          {/* Featured image / placeholder */}
          {hasImage && !imageError ? (
            <div className={styles.featuredImage}>
              <Image
                src={article.urlToImage}
                alt={article.title}
                width={900}
                height={320}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
                unoptimized
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              {t('article.imagePlaceholder')}
            </div>
          )}

          {/* Article body */}
          <div className={styles.articleBody}>
            {article.description && (
              <div className={styles.articleLead}>
                <p>{article.description}</p>
              </div>
            )}

            <div className={`${styles.articleText} ${!showFullArticle ? styles.preview : ''}`}>
              {showFullArticle && fullContent ? (
                <div>
                  {fullContent.content.split('\n\n').map((para, i) => {
                    if (!para.trim()) return null;
                    // Detect pull-quote lines (shorter, quoted)
                    if (para.startsWith('"') && para.length < 200) {
                      return <blockquote key={i} className={styles.pullQuote}>{para}</blockquote>;
                    }
                    // Detect headings (short, no period at end)
                    if (para.length < 80 && !para.endsWith('.')) {
                      return <h3 key={i} className={styles.sectionHeading}>{para}</h3>;
                    }
                    return <p key={i}>{para}</p>;
                  })}
                  <div className={styles.contentNote}>
                    <strong>{t('article.fullLoadedPrefix')}</strong> — {t('article.fullLoadedSuffix')} {sourceName}.
                  </div>
                </div>
              ) : article.content ? (
                <>
                  <p>{getPreviewContent(article.content)}</p>
                  {hasMoreContent(article.content) && <div className={styles.fadeOut} />}
                </>
              ) : (
                <p>{article.description || t('article.preview')}</p>
              )}
            </div>

            {contentError && (
              <div className={styles.errorNote}>
                <strong>{t('article.warning')}</strong> {contentError}
              </div>
            )}

            {!showFullArticle && (
              <div className={styles.readMoreSection}>
                <button onClick={fetchFullContent} className={styles.readMoreButton} disabled={loadingFullContent}>
                  {loadingFullContent ? t('article.loadingFull') : t('article.readFull')}
                </button>
              </div>
            )}

            {showFullArticle && fullContent && (
              <div className={styles.readMoreSection}>
                <button onClick={() => setShowFullArticle(false)} className={styles.readMoreButton}>
                  <FaArrowLeft /> {t('article.showLess')}
                </button>
              </div>
            )}
          </div>

          {/* Reactions */}
          {article.url && (
            <ArticleReactions
              articleUrl={article.url}
              articleTitle={article.title}
            />
          )}

          {/* Author bio card */}
          <div className={styles.authorBioCard}>
            <div className={styles.bioBigAvatar}>{authorInitials}</div>
            <div className={styles.bioContent}>
              <div className={styles.bioName}>{article.author || t('article.author.staff')}</div>
              <div className={styles.bioRole}>{t('article.author.role')}</div>
              <p className={styles.bioText}>
                {t('article.bioPrefix')} {category.toLowerCase()} {t('article.bioSuffix')}
              </p>
            </div>
          </div>

          {/* Comments */}
          {article.url && (
            <ArticleComments
              articleUrl={article.url}
              articleTitle={article.title}
            />
          )}

          {/* Footer bar */}
          <div className={styles.articleFooter}>
            <div className={styles.footerTags}>
              {t('article.tags')} <span>{category}</span> · <span>{t('common.tech')}</span> · <span>{t('common.news')}</span>
            </div>
            <div className={styles.footerLinks}>
              <button className={styles.footerLink} onClick={() => router.back()}>{t('article.previous')}</button>
              <button
                className={styles.footerLink}
                onClick={() => navigator?.share?.({ title: article.title, url: window.location.href })}
              >
                {t('article.share')}
              </button>
            </div>
          </div>
        </main>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>

          {/* Authors */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeading}>
              {article.author ? t('article.author.one') : t('article.author.staffLabel')}
            </div>
            <div className={styles.sideAuthorList}>
              <div className={styles.sideAuthorItem}>
                <div className={styles.sideAvatar}>{authorInitials}</div>
                <div className={styles.sideAuthorName}>{article.author || t('article.author.staff')}</div>
              </div>
            </div>
          </div>


          {/* More Stories */}
          {relatedStories.length > 0 && (
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarHeading}>{t('article.moreStories')}</div>
              <div className={styles.moreStoryList}>
                {relatedStories.map((story, i) => (
                  <Link key={i} href={createSlug(story)} className={styles.moreStoryItem}>
                    <div className={styles.moreStoryCategory}>{t(`article.cat.${detectCategoryKey(story)}`)}</div>
                    <div className={styles.moreStoryTitle}>
                      {story.title?.length > 70 ? story.title.slice(0, 70) + '…' : story.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </Layout>
  );
}
