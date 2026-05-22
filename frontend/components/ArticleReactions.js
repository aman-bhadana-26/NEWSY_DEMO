import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaThumbsUp, FaHeart, FaLightbulb, FaSurprise } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { reactionsAPI } from '../utils/api';
import styles from '../styles/ArticleReactions.module.css';

const REACTION_CONFIG = [
  { type: 'like', Icon: FaThumbsUp, labelKey: 'reactions.like' },
  { type: 'love', Icon: FaHeart, labelKey: 'reactions.love' },
  { type: 'insightful', Icon: FaLightbulb, labelKey: 'reactions.insightful' },
  { type: 'wow', Icon: FaSurprise, labelKey: 'reactions.wow' },
];

export default function ArticleReactions({ articleUrl, articleTitle }) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [counts, setCounts] = useState({ like: 0, love: 0, insightful: 0, wow: 0 });
  const [total, setTotal] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState('');

  const fetchReactions = useCallback(async () => {
    if (!articleUrl) return;
    try {
      setLoading(true);
      setError('');
      const data = await reactionsAPI.getByArticle(articleUrl);
      setCounts(data.counts || { like: 0, love: 0, insightful: 0, wow: 0 });
      setTotal(data.total ?? 0);
      setUserReaction(data.userReaction ?? null);
    } catch {
      setError(t('reactions.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [articleUrl, t]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const handleReaction = async (type) => {
    if (!isAuthenticated) return;
    if (submitting) return;

    setSubmitting(type);
    setError('');
    try {
      const data = await reactionsAPI.toggle(articleUrl, articleTitle, type);
      setCounts(data.counts || counts);
      setTotal(data.total ?? 0);
      setUserReaction(data.userReaction ?? null);
    } catch (err) {
      setError(err.response?.data?.message || t('reactions.errorToggle'));
    } finally {
      setSubmitting(null);
    }
  };

  const totalLabel = (t('reactions.total') || '{count} reactions').replace(
    '{count}',
    String(total)
  );

  return (
    <section className={styles.reactionsSection}>
      <div className={styles.reactionsHeader}>
        <h2 className={styles.reactionsTitle}>{t('reactions.title')}</h2>
        {!loading && <span className={styles.reactionsTotal}>{totalLabel}</span>}
      </div>

      {error && <p className={styles.reactionsError}>{error}</p>}

      <div className={styles.reactionsBar}>
        {REACTION_CONFIG.map(({ type, Icon, labelKey }) => {
          const count = counts[type] || 0;
          const isActive = userReaction === type;
          const isBusy = submitting === type;

          return (
            <button
              key={type}
              type="button"
              className={`${styles.reactionBtn} ${isActive ? styles.reactionBtnActive : ''}`}
              onClick={() => handleReaction(type)}
              disabled={!isAuthenticated || isBusy || loading}
              aria-pressed={isActive}
              aria-label={`${t(labelKey)}${count ? `, ${count}` : ''}`}
              title={t(labelKey)}
            >
              <Icon className={styles.reactionIcon} />
              <span className={styles.reactionLabel}>{t(labelKey)}</span>
              {count > 0 && <span className={styles.reactionCount}>{count}</span>}
            </button>
          );
        })}
      </div>

      {!isAuthenticated && (
        <p className={styles.loginHint}>
          {t('reactions.loginToReact')}{' '}
          <Link href="/login" className={styles.loginLink}>
            {t('reactions.login')}
          </Link>
        </p>
      )}
    </section>
  );
}
