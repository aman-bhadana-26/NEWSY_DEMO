import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getFullDate } from '../../utils/formatDate';
import { FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import styles from '../../styles/Article.module.css';

export default function Article() {
  const router = useRouter();
  const { url } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) {
      setLoading(false);
    }
  }, [url]);

  if (loading || !url) {
    return (
      <Layout title="Loading Article - NEWSY TECH">
        <LoadingSpinner message="Loading article..." />
      </Layout>
    );
  }

  return (
    <Layout title="Article - NEWSY TECH">
      <div className={styles.articleContainer}>
        <div className={styles.articleContent}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> Back to News
          </button>

          <div className={styles.articleCard}>
            <div className={styles.articleHeader}>
              <h1 className={styles.articleTitle}>View Full Article</h1>
              <p className={styles.articleSubtitle}>
                This article is hosted on an external website. Click the button below to read the full story.
              </p>
            </div>

            <div className={styles.articleBody}>
              <div className={styles.externalLinkCard}>
                <div className={styles.linkIcon}>
                  <FaExternalLinkAlt />
                </div>
                <p className={styles.linkDescription}>
                  You will be redirected to the original source to read the complete article.
                </p>
                <a
                  href={decodeURIComponent(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.readArticleBtn}
                >
                  Read Full Article <FaExternalLinkAlt />
                </a>
              </div>

              <div className={styles.infoBox}>
                <h3>Why am I seeing this page?</h3>
                <p>
                  NEWSY TECH aggregates technology news from various trusted sources across the web. 
                  To respect copyright and provide you with the most up-to-date content, we direct 
                  you to the original publisher's website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
