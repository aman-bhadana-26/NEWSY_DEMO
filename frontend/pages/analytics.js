import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
import { motion, AnimatePresence } from 'framer-motion';

const topicLabel = (t, topic) => {
  const key = `article.cat.${topic}`;
  const label = t(key);
  return label === key ? topic : label;
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

function BarChartItem({ day, maxValue, valueKey }) {
  const heightValue = Math.max(8, (day[valueKey] / maxValue) * 120);

  return (
    <div className={styles.chartBarWrap}>
      <span className={styles.chartCount}>{day[valueKey]}</span>
      <motion.div
        className={styles.chartBar}
        initial={{ height: 0 }}
        animate={{ height: heightValue }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className={styles.chartLabel}>{day.label}</span>
      <div className={styles.chartTooltip}>
        <strong>{day[valueKey]}</strong> reads<br />
        <span>{Math.round((day.timeSeconds || 0) / 60)} mins</span>
      </div>
    </div>
  );
}

function BarChart({ data, maxValue, valueKey = 'reads' }) {
  return (
    <div className={styles.chart}>
      {data.map((day) => (
        <BarChartItem
          key={day.date}
          day={day}
          maxValue={maxValue}
          valueKey={valueKey}
        />
      ))}
    </div>
  );
}

function TopicBarRow({ item, t }) {
  const fillClass = styles[`topicBarFill_${item.topic}`] || styles.topicBarFill_default;

  return (
    <motion.div
      className={styles.topicRow}
      variants={cardVariants}
    >
      <span className={styles.topicName}>{topicLabel(t, item.topic)}</span>
      <div className={styles.topicBarBg}>
        <motion.div
          className={`${styles.topicBarFill} ${fillClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${item.percentage}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className={styles.topicPct}>{item.percentage}%</span>
    </motion.div>
  );
}

function TopicBars({ topics, t }) {
  if (!topics?.length) {
    return <p className={styles.emptyHint}>{t('analytics.noTopics')}</p>;
  }
  return (
    <motion.div
      className={styles.topicList}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {topics.map((item) => (
        <TopicBarRow key={item.topic} item={item} t={t} />
      ))}
    </motion.div>
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
  const [showAllRecent, setShowAllRecent] = useState(false);

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
      <div className={styles.loadingWrap}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>Analytics – NEWSYTECH</title>
      </Head>
      <div className={styles.page}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.title}>
            <FaChartLine className={styles.titleIcon} />
            {t('analytics.title')}
          </h1>
          <p className={styles.subtitle}>{t('analytics.subtitle')}</p>
        </motion.header>

        {user?.isAdmin && (
          <div className={styles.viewTabs}>
            <button
              type="button"
              className={`${styles.viewTab} ${activeView === 'personal' ? styles.viewTabActive : ''}`}
              onClick={() => setActiveView('personal')}
              style={{ outline: 'none' }}
            >
              {activeView === 'personal' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={styles.activeTabIndicator}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 3 }}>
                {t('analytics.myStats')}
              </span>
            </button>
            <button
              type="button"
              className={`${styles.viewTab} ${activeView === 'site' ? styles.viewTabAdminActive : ''}`}
              onClick={() => setActiveView('site')}
              style={{ outline: 'none' }}
            >
              {activeView === 'site' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={`${styles.activeTabIndicator} ${styles.activeTabIndicatorAdmin}`}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 3 }}>
                {t('analytics.siteStats')}
                <span className={styles.adminBadge}>Admin</span>
              </span>
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === 'personal' && myStats && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className={styles.statsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={cardVariants}
                  className={`${styles.statCard} ${styles.statCardHighlight}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.streak')}</p>
                  <p className={styles.statValue}>
                    <FaFire style={{ color: '#DEB992', marginRight: 8, filter: 'drop-shadow(0 0 6px rgba(222, 185, 146, 0.5))' }} />
                    {myStats.readingStreak}
                  </p>
                  <p className={styles.statSub}>
                    {t('analytics.streakDays')} · {t('analytics.longest')}: {myStats.longestStreak}
                  </p>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.articlesRead')}</p>
                  <p className={styles.statValue}>
                    <FaBookOpen style={{ color: '#24c9b8', marginRight: 8, filter: 'drop-shadow(0 0 6px rgba(36, 201, 184, 0.4))' }} />
                    {myStats.articlesRead}
                  </p>
                  <p className={styles.statSub}>{myStats.totalSessions} {t('analytics.sessions')}</p>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.timeSpent')}</p>
                  <p className={styles.statValue}>
                    <FaClock style={{ color: '#24c9b8', marginRight: 8, filter: 'drop-shadow(0 0 6px rgba(36, 201, 184, 0.4))' }} />
                    {myStats.totalTime?.label || '0m'}
                  </p>
                  <p className={styles.statSub}>
                    {t('analytics.thisWeek')}: {myStats.thisWeekTime?.label || '0m'}
                  </p>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.thisMonth')}</p>
                  <p className={styles.statValue}>{myStats.thisMonthTime?.label || '0m'}</p>
                  <p className={styles.statSub}>{t('analytics.readingHabits')}</p>
                </motion.div>
              </motion.div>

              <div className={styles.twoCol}>
                <motion.section
                  className={styles.section}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <h2 className={styles.sectionTitle}>
                    <FaChartLine /> {t('analytics.activityWeek')}
                  </h2>
                  {myStats.readsByDay?.length ? (
                    <BarChart data={myStats.readsByDay} maxValue={myStats.maxReads} />
                  ) : (
                    <p className={styles.emptyHint}>{t('analytics.noActivity')}</p>
                  )}
                </motion.section>

                <motion.section
                  className={styles.section}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className={styles.sectionTitle}>
                    <FaTags /> {t('analytics.topTopics')}
                  </h2>
                  <TopicBars topics={myStats.mostReadTopics} t={t} />
                </motion.section>
              </div>

              <motion.section
                className={styles.section}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className={styles.sectionTitle}>{t('analytics.recentReads')}</h2>
                {myStats.recentActivity?.length ? (
                  <>
                    <motion.div
                      className={styles.recentList}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence>
                        {(showAllRecent
                          ? myStats.recentActivity
                          : myStats.recentActivity.slice(0, 4)
                        ).map((item, i) => {
                          const badgeClass = styles[`badge_${item.topic}`] || styles.badge_default;
                          return (
                            <motion.div
                              key={i}
                              variants={cardVariants}
                              className={styles.recentItem}
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className={styles.recentContent}>
                                <p className={styles.recentTitle}>
                                  {item.articleTitle?.length > 70
                                    ? item.articleTitle.slice(0, 70) + '…'
                                    : item.articleTitle}
                                </p>
                                <div className={styles.recentMeta}>
                                  <span className={`${styles.recentCategoryBadge} ${badgeClass}`}>
                                    {topicLabel(t, item.topic)}
                                  </span>
                                  <span>·</span>
                                  <span>{new Date(item.readAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <span className={styles.recentTime}>{item.timeLabel}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                    {myStats.recentActivity.length > 4 && (
                      <button
                        type="button"
                        className={styles.moreBtn}
                        onClick={() => setShowAllRecent(!showAllRecent)}
                      >
                        {showAllRecent ? t('analytics.showLess') : t('analytics.showMore')}
                      </button>
                    )}
                  </>
                ) : (
                  <p className={styles.emptyHint}>{t('analytics.startReading')}</p>
                )}
              </motion.section>
            </motion.div>
          )}

          {activeView === 'site' && user?.isAdmin && siteStats && (
            <motion.div
              key="site"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className={styles.statsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.site.totalReads')}</p>
                  <p className={styles.statValue}>{siteStats.totalReads}</p>
                  <p className={styles.statSub}>
                    {siteStats.readsThisMonth} {t('analytics.thisMonth')}
                  </p>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.site.readers')}</p>
                  <p className={styles.statValue}>
                    <FaUsers style={{ marginRight: 8, color: '#24c9b8', filter: 'drop-shadow(0 0 6px rgba(36, 201, 184, 0.4))' }} />
                    {siteStats.uniqueReaders}
                  </p>
                  <p className={styles.statSub}>
                    {siteStats.activeReaders} {t('analytics.site.activeWeek')}
                  </p>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.site.totalTime')}</p>
                  <p className={styles.statValue}>
                    <FaClock style={{ color: '#24c9b8', marginRight: 8, filter: 'drop-shadow(0 0 6px rgba(36, 201, 184, 0.4))' }} />
                    {siteStats.totalTime?.label || '0m'}
                  </p>
                  <p className={styles.statSub}>Accumulated total</p>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  className={styles.statCard}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className={styles.statLabel}>{t('analytics.site.users')}</p>
                  <p className={styles.statValue}>{siteStats.totalUsers}</p>
                  <p className={styles.statSub}>
                    <FaComment style={{ marginRight: 6, color: '#24c9b8' }} />
                    {siteStats.totalComments} {t('analytics.site.comments')}
                  </p>
                </motion.div>
              </motion.div>

              <div className={styles.twoCol}>
                <motion.section
                  className={styles.section}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <h2 className={styles.sectionTitle}>{t('analytics.site.readsWeek')}</h2>
                  <BarChart data={siteStats.readsByDay} maxValue={siteStats.maxReads} />
                </motion.section>

                <motion.section
                  className={styles.section}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className={styles.sectionTitle}>{t('analytics.site.topTopics')}</h2>
                  <TopicBars topics={siteStats.topTopics} t={t} />
                </motion.section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
