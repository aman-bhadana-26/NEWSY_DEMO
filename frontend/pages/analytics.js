import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { analyticsAPI } from '../utils/api';
import {
  FaChartLine,
  FaFire,
  FaBookOpen,
  FaClock,
  FaTags,
  FaUsers,
  FaComment
} from 'react-icons/fa';
import styles from '../styles/Analytics.module.css';

const topicLabel = (t, topic) => {
  const key = `article.cat.${topic}`;
  const label = t(key);
  return label === key ? topic : label;
};

function BarChart({ data, maxValue, valueKey = 'reads' }) {
  return (
    <div className={styles.chart}>
      {data.map((day) => (
        <div key={day.date} className={styles.chartBarWrap}>
          <span className={styles.chartCount}>{day[valueKey]}</span>
          <div
            className={styles.chartBar}
            style={{
              height: `${Math.max(4, (day[valueKey] / maxValue) * 120)}px`
            }}
          />
          <span className={styles.chartLabel}>{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function TopicBars({ topics, t }) {
  if (!topics?.length) {
    return <p className={styles.emptyHint}>{t('analytics.noTopics')}</p>;
  }
  return (
    <div className={styles.topicList}>
      {topics.map((item) => (
        <div key={item.topic} className={styles.topicRow}>
          <span className={styles.topicName}>{topicLabel(t, item.topic)}</span>
          <div className={styles.topicBarBg}>
            <div
              className={styles.topicBarFill}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className={styles.topicPct}>{item.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [myStats, setMyStats] = useState(null);
  const [siteStats, setSiteStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('personal');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      setLoading(true);
      try {
        const personal = await analyticsAPI.getMyAnalytics();
        setMyStats(personal);

        if (user?.isAdmin) {
          const site = await analyticsAPI.getSiteAnalytics();
          setSiteStats(site);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user?.isAdmin]);

  if (authLoading || loading) {
    return (
      <Layout title="Analytics – NEWSYTECH">
        <div className={styles.loadingWrap}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout title="Analytics – NEWSYTECH">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FaChartLine className={styles.titleIcon} />
            {t('analytics.title')}
          </h1>
          <p className={styles.subtitle}>{t('analytics.subtitle')}</p>
        </header>

        {user?.isAdmin && (
          <div className={styles.viewTabs}>
            <button
              type="button"
              className={`${styles.viewTab} ${activeView === 'personal' ? styles.viewTabActive : ''}`}
              onClick={() => setActiveView('personal')}
            >
              {t('analytics.myStats')}
            </button>
            <button
              type="button"
              className={`${styles.viewTab} ${styles.viewTabAdmin} ${activeView === 'site' ? styles.viewTabAdminActive : ''}`}
              onClick={() => setActiveView('site')}
            >
              {t('analytics.siteStats')}
              <span className={styles.adminBadge}>Admin</span>
            </button>
          </div>
        )}

        {activeView === 'personal' && myStats && (
          <>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
                <p className={styles.statLabel}>{t('analytics.streak')}</p>
                <p className={styles.statValue}>
                  <FaFire style={{ color: '#CBA135', marginRight: 8 }} />
                  {myStats.readingStreak}
                </p>
                <p className={styles.statSub}>
                  {t('analytics.streakDays')} · {t('analytics.longest')}: {myStats.longestStreak}
                </p>
              </div>

              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.articlesRead')}</p>
                <p className={styles.statValue}>
                  <FaBookOpen style={{ color: '#1BA098', marginRight: 8 }} />
                  {myStats.articlesRead}
                </p>
                <p className={styles.statSub}>{myStats.totalSessions} {t('analytics.sessions')}</p>
              </div>

              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.timeSpent')}</p>
                <p className={styles.statValue}>
                  <FaClock style={{ color: '#1BA098', marginRight: 8 }} />
                  {myStats.totalTime?.label}
                </p>
                <p className={styles.statSub}>
                  {t('analytics.thisWeek')}: {myStats.thisWeekTime?.label}
                </p>
              </div>

              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.thisMonth')}</p>
                <p className={styles.statValue}>{myStats.thisMonthTime?.label}</p>
                <p className={styles.statSub}>{t('analytics.readingHabits')}</p>
              </div>
            </div>

            <div className={styles.twoCol}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <FaChartLine /> {t('analytics.activityWeek')}
                </h2>
                {myStats.readsByDay?.length ? (
                  <BarChart data={myStats.readsByDay} maxValue={myStats.maxReads} />
                ) : (
                  <p className={styles.emptyHint}>{t('analytics.noActivity')}</p>
                )}
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <FaTags /> {t('analytics.topTopics')}
                </h2>
                <TopicBars topics={myStats.mostReadTopics} t={t} />
              </section>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('analytics.recentReads')}</h2>
              {myStats.recentActivity?.length ? (
                <div className={styles.recentList}>
                  {myStats.recentActivity.map((item, i) => (
                    <div key={i} className={styles.recentItem}>
                      <div>
                        <p className={styles.recentTitle}>
                          {item.articleTitle?.length > 60
                            ? item.articleTitle.slice(0, 60) + '…'
                            : item.articleTitle}
                        </p>
                        <span className={styles.recentMeta}>
                          {topicLabel(t, item.topic)} ·{' '}
                          {new Date(item.readAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={styles.recentTime}>{item.timeLabel}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyHint}>{t('analytics.startReading')}</p>
              )}
            </section>
          </>
        )}

        {activeView === 'site' && user?.isAdmin && siteStats && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.site.totalReads')}</p>
                <p className={styles.statValue}>{siteStats.totalReads}</p>
                <p className={styles.statSub}>
                  {siteStats.readsThisMonth} {t('analytics.thisMonth')}
                </p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.site.readers')}</p>
                <p className={styles.statValue}>
                  <FaUsers style={{ marginRight: 8, color: '#1BA098' }} />
                  {siteStats.uniqueReaders}
                </p>
                <p className={styles.statSub}>
                  {siteStats.activeReaders} {t('analytics.site.activeWeek')}
                </p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.site.totalTime')}</p>
                <p className={styles.statValue}>{siteStats.totalTime?.label}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>{t('analytics.site.users')}</p>
                <p className={styles.statValue}>{siteStats.totalUsers}</p>
                <p className={styles.statSub}>
                  <FaComment style={{ marginRight: 6 }} />
                  {siteStats.totalComments} {t('analytics.site.comments')}
                </p>
              </div>
            </div>

            <div className={styles.twoCol}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('analytics.site.readsWeek')}</h2>
                <BarChart data={siteStats.readsByDay} maxValue={siteStats.maxReads} />
              </section>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t('analytics.site.topTopics')}</h2>
                <TopicBars topics={siteStats.topTopics} t={t} />
              </section>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
