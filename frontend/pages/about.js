import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/StaticPage.module.css';
import { FaInfoCircle, FaNewspaper, FaRocket, FaUsers } from 'react-icons/fa';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Us - NewsyTech</title>
        <meta name="description" content="Learn more about NewsyTech - Your source for tech news and innovation." />
      </Head>

      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <FaInfoCircle className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>About NewsyTech</h1>
          <p className={styles.pageSubtitle}>Your trusted source for technology news and innovation</p>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.card}>
            <FaNewspaper className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Our Mission</h2>
            <p className={styles.cardText}>
              NewsyTech is dedicated to bringing you the latest and most relevant news from the world of technology. 
              We curate content across AI, startups, software development, gadgets, and cybersecurity to keep you 
              informed and ahead of the curve.
            </p>
          </div>

          <div className={styles.card}>
            <FaRocket className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>What We Cover</h2>
            <p className={styles.cardText}>
              From breakthrough AI innovations to the latest gadget releases, from emerging startups to critical 
              cybersecurity updates - we cover it all. Our team works tirelessly to aggregate and present the most 
              important tech stories in one convenient place.
            </p>
          </div>

          <div className={styles.card}>
            <FaUsers className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Join Our Community</h2>
            <p className={styles.cardText}>
              Create your personalized news feed, save articles for later, and never miss out on the stories that 
              matter to you. NewsyTech is more than just a news aggregator - it's your personal tech news hub.
            </p>
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>10K+</h3>
            <p className={styles.statLabel}>Articles</p>
          </div>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>6</h3>
            <p className={styles.statLabel}>Categories</p>
          </div>
          <div className={styles.statItem}>
            <h3 className={styles.statNumber}>Daily</h3>
            <p className={styles.statLabel}>Updates</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
