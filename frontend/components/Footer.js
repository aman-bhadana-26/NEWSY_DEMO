import Link from 'next/link';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerLogo}>
              <span className={styles.logoRed}>NEWSY</span>
              <span className={styles.logoBlue}>TECH</span>
            </h3>
            <p className={styles.footerDescription}>
              Your trusted source for the latest technology news, covering AI, startups, 
              software, gadgets, and cybersecurity.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Categories</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/?category=ai">Artificial Intelligence</Link></li>
              <li><Link href="/?category=startups">Startups</Link></li>
              <li><Link href="/?category=software">Software</Link></li>
              <li><Link href="/?category=gadgets">Gadgets</Link></li>
              <li><Link href="/?category=cybersecurity">Cybersecurity</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
              <li><Link href="/profile">Profile</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Connect</h4>
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
          <p>&copy; {currentYear} NEWSY TECH. All rights reserved.</p>
          <p className={styles.poweredBy}>
            Powered by <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
