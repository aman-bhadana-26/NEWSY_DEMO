import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaFire } from 'react-icons/fa';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { name: 'All', path: '/', query: 'all' },
    { name: 'AI', path: '/', query: 'ai' },
    { name: 'Startups', path: '/', query: 'startups' },
    { name: 'Software', path: '/', query: 'software' },
    { name: 'Gadgets', path: '/', query: 'gadgets' },
    { name: 'Cybersecurity', path: '/', query: 'cybersecurity' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoRed}>NEWSY</span>
          <span className={styles.logoBlue}>TECH</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link
            href="/trending"
            className={`${styles.navLink} ${styles.trendingLink} ${
              router.pathname === '/trending' ? styles.active : ''
            }`}
          >
            <FaFire className={styles.trendingIcon} /> Trending
          </Link>
          {categories.map((category) => (
            <Link
              key={category.query}
              href={`/?category=${category.query}`}
              className={`${styles.navLink} ${
                router.query.category === category.query || 
                (!router.query.category && category.query === 'all' && router.pathname !== '/trending')
                  ? styles.active
                  : ''
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className={styles.profileLink}>
                <FaUser /> {user?.name}
              </Link>
              <button onClick={handleLogout} className={styles.btnLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.btnLogin}>
                Login
              </Link>
              <Link href="/signup" className={styles.btnSignup}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link
            href="/trending"
            className={`${styles.mobileNavLink} ${styles.mobileTrendingLink}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaFire /> Trending This Week
          </Link>
          <div className={styles.mobileDivider}></div>
          {categories.map((category) => (
            <Link
              key={category.query}
              href={`/?category=${category.query}`}
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <div className={styles.mobileDivider}></div>
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button onClick={handleLogout} className={styles.mobileLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
