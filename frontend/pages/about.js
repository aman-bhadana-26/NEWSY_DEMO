import Head from 'next/head';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/StaticPage.module.css';
import { FaInfoCircle, FaNewspaper, FaRocket, FaUsers } from 'react-icons/fa';

export default function About() {
  const { t } = useLanguage();

  return (
    <Layout>
      <Head>
        <title>About Us - NewsyTech</title>
        <meta name="description" content="Learn more about NewsyTech - Your source for tech news and innovation." />
      </Head>

      <div className={styles.pageContainer}>
        <div className={`${styles.pageHeader} anim-slide`}>
          <FaInfoCircle className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>{t('about.title')}</h1>
          <p className={styles.pageSubtitle}>{t('about.subtitle')}</p>
        </div>

        <div className={styles.contentSection}>
          <div className={`${styles.card} anim-fade-up delay-1`}>
            <FaNewspaper className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>{t('about.mission.title')}</h2>
            <p className={styles.cardText}>{t('about.mission.text')}</p>
          </div>

          <div className={`${styles.card} anim-fade-up delay-2`}>
            <FaRocket className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>{t('about.cover.title')}</h2>
            <p className={styles.cardText}>{t('about.cover.text')}</p>
          </div>

          <div className={`${styles.card} anim-fade-up delay-3`}>
            <FaUsers className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>{t('about.community.title')}</h2>
            <p className={styles.cardText}>{t('about.community.text')}</p>
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={`${styles.statItem} anim-scale delay-1`}>
            <h3 className={styles.statNumber}>10K+</h3>
            <p className={styles.statLabel}>{t('about.stats.articles')}</p>
          </div>
          <div className={`${styles.statItem} anim-scale delay-2`}>
            <h3 className={styles.statNumber}>6</h3>
            <p className={styles.statLabel}>{t('about.stats.categories')}</p>
          </div>
          <div className={`${styles.statItem} anim-scale delay-3`}>
            <h3 className={styles.statNumber}>{t('about.stats.daily')}</h3>
            <p className={styles.statLabel}>{t('about.stats.updates')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
