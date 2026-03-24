import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaFire, FaSignOutAlt, FaUserCircle, FaEnvelope, FaSearch, FaFilter, FaNewspaper, FaHome, FaChevronDown, FaInfoCircle, FaEnvelopeOpen, FaTachometerAlt } from 'react-icons/fa';
import { throttle } from '../hooks/useScrollOptimization';
import FlowingMenu from './FlowingMenu';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [categoriesTimeout, setCategoriesTimeout] = useState(null);
  const [homeTimeout, setHomeTimeout] = useState(null);
  const [sideMenuTimeout, setSideMenuTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const categories = [
    { name: 'All', path: '/home', query: 'all' },
    { name: 'AI', path: '/home', query: 'ai' },
    { name: 'Startups', path: '/home', query: 'startups' },
    { name: 'Software', path: '/home', query: 'software' },
    { name: 'Gadgets', path: '/home', query: 'gadgets' },
    { name: 'Cybersecurity', path: '/home', query: 'cybersecurity' },
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

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const handleSideMenuMouseEnter = () => {
    // Clear any existing timeout
    if (sideMenuTimeout) {
      clearTimeout(sideMenuTimeout);
      setSideMenuTimeout(null);
    }
    setSideMenuOpen(true);
  };

  const handleSideMenuMouseLeave = () => {
    // Add small delay before closing
    const timeout = setTimeout(() => {
      setSideMenuOpen(false);
    }, 200);
    setSideMenuTimeout(timeout);
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
        ? `/home?search=${encodeURIComponent(searchQuery.trim())}`
        : `/home?category=${selectedFilter}&search=${encodeURIComponent(searchQuery.trim())}`;
      
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

  const handleCategoriesMouseEnter = () => {
    if (categoriesTimeout) {
      clearTimeout(categoriesTimeout);
      setCategoriesTimeout(null);
    }
    setCategoriesDropdownOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    const timeout = setTimeout(() => {
      setCategoriesDropdownOpen(false);
    }, 150);
    setCategoriesTimeout(timeout);
  };

  const handleHomeMouseEnter = () => {
    if (homeTimeout) {
      clearTimeout(homeTimeout);
      setHomeTimeout(null);
    }
    setHomeDropdownOpen(true);
  };

  const handleHomeMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHomeDropdownOpen(false);
    }, 150);
    setHomeTimeout(timeout);
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Menu Button — hidden on landing page */}
        {router.pathname !== '/' && (
          <button 
            className={styles.menuButton} 
            onMouseEnter={handleSideMenuMouseEnter}
            onMouseLeave={handleSideMenuMouseLeave}
            title="Menu"
          >
            <FaBars />
          </button>
        )}

        <Link href="/home" className={styles.logo}>
          <span className={styles.logoRed}>NEWSY</span>
          <span className={styles.logoBlue}>TECH</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          {/* Home Dropdown */}
          <div
            className={styles.homeDropdownContainer}
            onMouseEnter={handleHomeMouseEnter}
            onMouseLeave={handleHomeMouseLeave}
          >
            <Link
              href="/home"
              className={`${styles.navLink} ${styles.homeNavButton} ${
                router.pathname === '/home' ? styles.active : ''
              }`}
            >
              Home <FaChevronDown className={`${styles.dropdownArrow} ${homeDropdownOpen ? styles.dropdownArrowOpen : ''}`} />
            </Link>

            {homeDropdownOpen && (
              <div className={styles.homeDropdown}>
                <Link
                  href="/"
                  className={styles.homeDropdownItem}
                  onClick={() => setHomeDropdownOpen(false)}
                >
                  <FaTachometerAlt className={styles.homeDropdownIcon} />
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          <div 
            className={styles.categoriesDropdownContainer}
            onMouseEnter={handleCategoriesMouseEnter}
            onMouseLeave={handleCategoriesMouseLeave}
          >
            <button className={`${styles.navLink} ${styles.categoriesButton} ${router.query.category ? styles.active : ''}`}>
              Categories <FaChevronDown className={styles.dropdownArrow} />
            </button>
            
            {categoriesDropdownOpen && (
              <div className={styles.categoriesDropdown}>
                {categories.map((category) => (
                  <Link
                    key={category.query}
                    href={`/home?category=${category.query}`}
                    className={`${styles.categoryDropdownItem} ${
                      router.query.category === category.query ? styles.categoryDropdownItemActive : ''
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/about"
            className={`${styles.navLink} ${
              router.pathname === '/about' ? styles.active : ''
            }`}
          >
            About
          </Link>

          <Link
            href="/contact"
            className={`${styles.navLink} ${
              router.pathname === '/contact' ? styles.active : ''
            }`}
          >
            Contact
          </Link>
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

        {/* Search Bar with Filters — hidden on landing page */}
        <div className={styles.searchContainer} style={router.pathname === '/' ? { display: 'none' } : {}}>
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
            href="/"
            className={`${styles.mobileNavLink} ${router.pathname === '/' && !router.query.category ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaHome /> Home
          </Link>
          
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
          
          <div className={styles.mobileCategoriesSection}>
            <p className={styles.mobileSectionTitle}>Categories</p>
            {categories.map((category) => (
              <Link
                key={category.query}
                href={`/home?category=${category.query}`}
                className={`${styles.mobileNavLink} ${
                  router.query.category === category.query ? styles.mobileNavLinkActive : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
          
          <div className={styles.mobileDivider}></div>
          
          <Link
            href="/about"
            className={`${styles.mobileNavLink} ${router.pathname === '/about' ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaInfoCircle /> About
          </Link>
          
          <Link
            href="/contact"
            className={`${styles.mobileNavLink} ${router.pathname === '/contact' ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaEnvelopeOpen /> Contact
          </Link>
          
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

      {/* Side Menu */}
      {sideMenuOpen && (
        <>
          {/* Overlay */}
          <div className={styles.sideMenuOverlay}></div>
          
          {/* Side Menu Panel */}
          <div 
            className={styles.sideMenu}
            onMouseEnter={handleSideMenuMouseEnter}
            onMouseLeave={handleSideMenuMouseLeave}
          >
            <div className={styles.sideMenuContent}>
              {/* Trending This Week with FlowingMenu */}
              <div style={{ height: '200px', position: 'relative' }}>
                <FlowingMenu
                  items={[
                    {
                      link: '/trending',
                      text: 'Trending',
                      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop'
                    }
                  ]}
                  speed={15}
                  textColor="#ffffff"
                  bgColor="#051020"
                  marqueeBgColor="#1BA098"
                  marqueeTextColor="#ffffff"
                  borderColor="rgba(27,160,152,0.3)"
                />
              </div>

              <div className={styles.sideMenuSection}>
                <h3 className={styles.sideMenuSectionTitle}>Categories</h3>
                <div style={{ height: '500px', position: 'relative' }}>
                  <FlowingMenu
                    items={[
                      {
                        link: '/home?category=all',
                        text: 'All',
                        image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop'
                      },
                      {
                        link: '/home?category=ai',
                        text: 'AI',
                        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop'
                      },
                      {
                        link: '/home?category=startups',
                        text: 'Startups',
                        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop'
                      },
                      {
                        link: '/home?category=software',
                        text: 'Software',
                        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop'
                      },
                      {
                        link: '/home?category=gadgets',
                        text: 'Gadgets',
                        image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=400&fit=crop'
                      },
                      {
                        link: '/home?category=cybersecurity',
                        text: 'Cybersecurity',
                        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop'
                      }
                    ]}
                    speed={15}
                    textColor="#ffffff"
                    bgColor="#051020"
                    marqueeBgColor="#1BA098"
                    marqueeTextColor="#ffffff"
                    borderColor="rgba(27,160,152,0.3)"
                  />
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
