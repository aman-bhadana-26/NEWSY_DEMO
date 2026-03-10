import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../styles/ExploreCategories.module.css';

export default function ExploreCategories() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const categories = [
    {
      name: 'ALL',
      query: 'all',
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
      description: 'Latest news from all categories'
    },
    {
      name: 'AI',
      query: 'ai',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      description: 'Artificial Intelligence & Machine Learning'
    },
    {
      name: 'STARTUP',
      query: 'startups',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
      description: 'Startup news and entrepreneurship'
    },
    {
      name: 'SOFTWARE',
      query: 'software',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      description: 'Software development & programming'
    },
    {
      name: 'GADGETS',
      query: 'gadgets',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
      description: 'Latest gadgets and consumer tech'
    },
    {
      name: 'CYBERSECURITY',
      query: 'cybersecurity',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      description: 'Security, privacy & cyber threats'
    }
  ];

  const handleCategoryClick = (query) => {
    if (query === 'all') {
      router.push('/');
    } else {
      router.push(`/?category=${query}`);
    }
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev >= categories.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleDotClick = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  return (
    <section className={styles.exploreCategoriesSection}>
      <div className={styles.container}>
        <div className={`${styles.header} anim-slide`}>
          <h2 className={styles.title}>Explore Categories</h2>
          <p className={styles.subtitle}>Discover news by your interests</p>
        </div>

        <div className={styles.carouselWrapper}>
          {/* Previous Arrow */}
          <button 
            className={`${styles.navArrow} ${styles.navArrowPrev} ${isTransitioning ? styles.disabled : ''}`}
            onClick={handlePrev}
            disabled={isTransitioning}
            aria-label="Previous categories"
          >
            <FaChevronLeft />
          </button>

          {/* Categories Container */}
          <div className={styles.categoriesContainer}>
            <div 
              className={styles.categoriesTrack}
              style={{ 
                transform: `translateX(calc(-${currentIndex * (100 / 3)}%))`,
                transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
            >
              {categories.map((category, index) => (
                <div
                  key={category.query}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(category.query)}
                >
                  <div className={styles.categoryImage}>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      loading="lazy"
                    />
                    <div className={styles.categoryOverlay}></div>
                  </div>
                  <div className={styles.categoryContent}>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                    <p className={styles.categoryDescription}>{category.description}</p>
                    <div className={styles.categoryArrow}>→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          <button 
            className={`${styles.navArrow} ${styles.navArrowNext} ${isTransitioning ? styles.disabled : ''}`}
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next categories"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className={styles.dotsContainer}>
          {Array.from({ length: categories.length }).map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              onClick={() => handleDotClick(index)}
              disabled={isTransitioning}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
