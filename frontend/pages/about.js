import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/StaticPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaInfoCircle, 
  FaNewspaper, 
  FaRocket, 
  FaUsers, 
  FaBrain, 
  FaShieldAlt, 
  FaCode, 
  FaLaptop, 
  FaCheckCircle, 
  FaBookmark, 
  FaChartLine 
} from 'react-icons/fa';

// Counter component for stats with smooth count-up animation
const AnimatedCounter = ({ target, value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  if (typeof value !== 'number') {
    return <span>{target}</span>;
  }

  // Format count representation (e.g., K+)
  if (target.includes('K')) {
    return <span>{count >= 1000 ? `${(count / 1000).toFixed(0)}K+` : count}</span>;
  }

  return <span>{count}</span>;
};

export default function About() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('mission');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mission':
        return (
          <div className={styles.missionGrid}>
            <div className={styles.card}>
              <FaNewspaper className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>{t('about.mission.title')}</h2>
              <p className={styles.cardText}>{t('about.mission.text')}</p>
            </div>

            <div className={styles.card}>
              <FaRocket className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>{t('about.cover.title')}</h2>
              <p className={styles.cardText}>{t('about.cover.text')}</p>
            </div>

            <div className={styles.card}>
              <FaUsers className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>{t('about.community.title')}</h2>
              <p className={styles.cardText}>{t('about.community.text')}</p>
            </div>
          </div>
        );

      case 'topics':
        return (
          <div className={styles.categoryGrid}>
            <div className={styles.categoryCard}>
              <FaBrain className={styles.categoryIcon} />
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryCardTitle}>{t('explore.cat.ai.name')}</h3>
                <p className={styles.categoryCardDesc}>{t('explore.cat.ai.desc')}</p>
              </div>
            </div>

            <div className={styles.categoryCard}>
              <FaRocket className={styles.categoryIcon} />
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryCardTitle}>{t('explore.cat.startups.name')}</h3>
                <p className={styles.categoryCardDesc}>{t('explore.cat.startups.desc')}</p>
              </div>
            </div>

            <div className={styles.categoryCard}>
              <FaCode className={styles.categoryIcon} />
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryCardTitle}>{t('explore.cat.software.name')}</h3>
                <p className={styles.categoryCardDesc}>{t('explore.cat.software.desc')}</p>
              </div>
            </div>

            <div className={styles.categoryCard}>
              <FaLaptop className={styles.categoryIcon} />
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryCardTitle}>{t('explore.cat.gadgets.name')}</h3>
                <p className={styles.categoryCardDesc}>{t('explore.cat.gadgets.desc')}</p>
              </div>
            </div>

            <div className={styles.categoryCard}>
              <FaShieldAlt className={styles.categoryIcon} />
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryCardTitle}>{t('explore.cat.cybersecurity.name')}</h3>
                <p className={styles.categoryCardDesc}>{t('explore.cat.cybersecurity.desc')}</p>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className={styles.missionGrid}>
            <div className={styles.card}>
              <FaCheckCircle className={styles.cardIcon} style={{ color: '#1BA098' }} />
              <h2 className={styles.cardTitle}>{t('topics.title') || 'Personalized Feed'}</h2>
              <p className={styles.cardText}>
                {t('faq.a2') || 'Customize topics to build a feed optimized for your professional interest.'}
              </p>
            </div>

            <div className={styles.card}>
              <FaBookmark className={styles.cardIcon} style={{ color: '#CBA135' }} />
              <h2 className={styles.cardTitle}>{t('catPage.saved') || 'Reading List'}</h2>
              <p className={styles.cardText}>
                {t('faq.a3') || 'Save breaking tech stories with a single click to read them later.'}
              </p>
            </div>

            <div className={styles.card}>
              <FaChartLine className={styles.cardIcon} style={{ color: '#1BA098' }} />
              <h2 className={styles.cardTitle}>{t('analytics.title') || 'Personal Analytics'}</h2>
              <p className={styles.cardText}>
                {t('faq.a4') || 'Track your technical reading streaks and weekly analytics on our dashboards.'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>About Us - NewsyTech</title>
        <meta name="description" content="Learn more about NewsyTech - Your source for tech news and innovation." />
      </Head>

      <div className={styles.pageContainer}>
        <motion.div 
          className={styles.pageHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FaInfoCircle className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>{t('about.title')}</h1>
          <p className={styles.pageSubtitle}>{t('about.subtitle')}</p>
        </motion.div>

        {/* Interactive Tabs Menu */}
        <div className={styles.tabContainer}>
          <div className={styles.tabBar}>
            {['mission', 'topics', 'features'].map((tab) => {
              const labelMap = {
                mission: t('about.mission.title') || 'Our Mission',
                topics: t('footer.categories') || 'Topics',
                features: t('profile.profileSettings') || 'Features'
              };

              return (
                <button
                  key={tab}
                  className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="aboutActiveTab"
                      className={styles.tabActiveBg}
                      style={{ position: 'absolute', inset: 0, borderRadius: '20px' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{labelMap[tab]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Section with Transitions */}
        <div className={styles.contentSection}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated Stats Section */}
        <motion.div 
          className={styles.statsSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>
              <AnimatedCounter target="10K+" value={10000} />
            </h3>
            <p className={styles.statLabel}>{t('about.stats.articles')}</p>
          </div>

          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>
              <AnimatedCounter target="6" value={6} />
            </h3>
            <p className={styles.statLabel}>{t('about.stats.categories')}</p>
          </div>

          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>
              <AnimatedCounter target={t('about.stats.daily')} value="Daily" />
            </h3>
            <p className={styles.statLabel}>{t('about.stats.updates')}</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
