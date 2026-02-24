import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaFire, FaSignOutAlt, FaUserCircle, FaEnvelope, FaSearch, FaFilter, FaNewspaper } from 'react-icons/fa';
import { throttle } from '../hooks/useScrollOptimization';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const categories = [
    { name: 'All', path: '/', query: 'all' },
    { name: 'AI', path: '/', query: 'ai' },
    { name: 'Startups', path: '/', query: 'startups' },
    { name: 'Software', path: '/', query: 'software' },
    { name: 'Gadgets', path: '/', query: 'gadgets' },
    { name: 'Cybersecurity', path: '/', query: 'cybersecurity' },
  ];

  // Optimized scroll detection with throttle and RAF
  useEffect(() => {
    const handleScroll = throttle(() => {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      });
    }, 100); // Throttle to every 100ms

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Optimized resize handler with throttle
  useEffect(() => {
    const handleResize = throttle(() => {
      window.requestAnimationFrame(() => {
        // Resize handling if needed
      });
    }, 200); // Throttle to every 200ms

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    // Clear timeout
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Add small delay before closing
    const timeout = setTimeout(() => {
      setUserDropdownOpen(false);
    }, 150);
    setDropdownTimeout(timeout);
  };

  const handleProfileClick = () => {
    // Clear timeout and close dropdown
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
    setUserDropdownOpen(false);
    router.push('/profile');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Construct search URL with filter
      const searchUrl = selectedFilter === 'all' 
        ? `/?search=${encodeURIComponent(searchQuery.trim())}`
        : `/?category=${selectedFilter}&search=${encodeURIComponent(searchQuery.trim())}`;
      
      router.push(searchUrl);
      setSearchQuery('');
      setShowFilters(false);
      setMobileMenuOpen(false);
      setSearchExpanded(false);
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      // Focus input when expanding
      setTimeout(() => {
        const input = document.querySelector(`.${styles.searchInput}`);
        if (input) input.focus();
      }, 100);
    } else {
      setShowFilters(false);
    }
  };

  const handleSearchBlur = (e) => {
    // Capture the element reference before the timeout
    const inputElement = e.currentTarget;
    const searchContainer = inputElement.closest(`.${styles.searchInputWrapper}`);
    
    // Small delay to allow clicking on filter button or submit
    setTimeout(() => {
      // Check if focus moved to another element within the search container
      if (searchContainer && !searchContainer.contains(document.activeElement)) {
        setSearchExpanded(false);
        setShowFilters(false);
      }
    }, 200);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setShowFilters(false);
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
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
                (!router.query.category && category.query === 'all' && router.pathname !== '/trending' && router.pathname !== '/my-news')
                  ? styles.active
                  : ''
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* MY NEWS - Left of Search */}
        {isAuthenticated && (
          <Link
            href="/my-news"
            className={`${styles.navLink} ${styles.myNewsLink} ${
              router.pathname === '/my-news' ? styles.active : ''
            }`}
          >
            <FaNewspaper className={styles.myNewsIcon} /> My News
          </Link>
        )}

        {/* Search Bar with Filters */}
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={`${styles.searchInputWrapper} ${searchExpanded ? styles.expanded : ''}`}>
              <button 
                type="button"
                onClick={toggleSearch}
                className={styles.searchIconButton}
                title="Search"
              >
                <FaSearch />
              </button>
              {searchExpanded && (
                <>
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={handleSearchBlur}
                    className={styles.searchInput}
                  />
                  <button 
                    type="button"
                    onClick={toggleFilters}
                    className={styles.filterButton}
                    title="Filter by category"
                  >
                    <FaFilter />
                    <span className={styles.filterBadge}>{selectedFilter === 'all' ? 'All' : selectedFilter.toUpperCase()}</span>
                  </button>
                </>
              )}
            </div>
            
            {showFilters && searchExpanded && (
              <div className={styles.filterDropdown}>
                <div className={styles.filterHeader}>
                  <FaFilter /> Filter by Category
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.query}
                    type="button"
                    onClick={() => handleFilterSelect(cat.query)}
                    className={`${styles.filterOption} ${selectedFilter === cat.query ? styles.filterActive : ''}`}
                  >
                    {cat.name}
                    {selectedFilter === cat.query && <span className={styles.checkmark}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <div 
              className={styles.userMenuContainer}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className={styles.userIcon}>
                <FaUser />
              </button>
              
              {userDropdownOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.userAvatar}>
                      <FaUserCircle />
                    </div>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{user?.name || 'User'}</p>
                      <p className={styles.userEmail}>
                        <FaEnvelope className={styles.emailIcon} />
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.dropdownDivider}></div>
                  
                  <button onClick={handleProfileClick} className={styles.dropdownItem}>
                    <FaUserCircle className={styles.dropdownIcon} />
                    My Account
                  </button>
                  
                  <button onClick={handleLogout} className={styles.dropdownItemLogout}>
                    <FaSignOutAlt className={styles.dropdownIcon} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
            <div className={styles.mobileSearchWrapper}>
              <FaSearch className={styles.mobileSearchIcon} />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.mobileSearchInput}
              />
            </div>
            <button 
              type="button"
              onClick={toggleFilters}
              className={styles.mobileFilterButton}
            >
              <FaFilter />
            </button>
            <button type="submit" className={styles.mobileSearchButton}>
              <FaSearch />
            </button>
          </form>
          
          {showFilters && (
            <div className={styles.mobileFilterOptions}>
              <p className={styles.mobileFilterLabel}>Filter by:</p>
              <div className={styles.mobileFilterGrid}>
                {categories.map((cat) => (
                  <button
                    key={cat.query}
                    type="button"
                    onClick={() => handleFilterSelect(cat.query)}
                    className={`${styles.mobileFilterChip} ${selectedFilter === cat.query ? styles.mobileFilterChipActive : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.mobileDivider}></div>
          
          <Link
            href="/trending"
            className={`${styles.mobileNavLink} ${styles.mobileTrendingLink}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaFire /> Trending This Week
          </Link>
          {isAuthenticated && (
            <Link
              href="/my-news"
              className={`${styles.mobileNavLink} ${styles.mobileMyNewsLink}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaNewspaper /> My News
            </Link>
          )}
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
