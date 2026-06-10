import { useState } from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('common.emailRequired') || 'Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(t('common.invalidEmail') || 'Please enter a valid email');
      return;
    }
    
    setError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerLogo}>
              <img
                src="/favicon.png"
                alt="NewsyTech"
                className={styles.footerLogoIcon}
                width={28}
                height={28}
              />
              <span className={styles.logoRed}>NEWSY</span>
              <span className={styles.logoBlue}>TECH</span>
            </h3>
            <p className={styles.footerDescription}>
              {t('footer.description')}
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>{t('footer.categories')}</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/home?category=ai">{t('footer.artificialIntelligence')}</Link></li>
              <li><Link href="/home?category=startups">{t('cat.startups')}</Link></li>
              <li><Link href="/home?category=software">{t('cat.software')}</Link></li>
              <li><Link href="/home?category=gadgets">{t('cat.gadgets')}</Link></li>
              <li><Link href="/home?category=cybersecurity">{t('cat.cybersecurity')}</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>{t('footer.quickLinks')}</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/">{t('nav.home')}</Link></li>
              <li><Link href="/login">{t('nav.login')}</Link></li>
              <li><Link href="/signup">{t('nav.signup')}</Link></li>
              <li><Link href="/profile">{t('nav.profile')}</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup Form */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Newsletter</h4>
            <p className={styles.newsletterDescription}>
              Stay ahead of the curve. Get curated intelligence delivered weekly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.newsletterInput}
                  aria-label="Email address"
                />
                <button type="submit" className={styles.newsletterButton}>
                  Subscribe
                </button>
              </div>
              {subscribed && <p className={styles.successMessage}>✓ Subscribed successfully!</p>}
              {error && <p className={styles.errorMessage}>✗ {error}</p>}
            </form>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>{t('footer.connect')}</h4>
            <div className={styles.socialLinks}>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} NEWSY TECH. {t('footer.rights')}</p>
          <p className={styles.poweredBy}>
            {t('footer.poweredBy')} <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

