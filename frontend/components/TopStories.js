import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaArrowRight, FaNewspaper } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/timeAgo';
import styles from '../styles/TopStories.module.css';

const TopStories = ({ stories }) => {
  const { t } = useLanguage();
  const [activeStory, setActiveStory] = useState(0);

  // Filter stories with images and get top 5
  const topStories = useMemo(() => {
    const storiesWithImages = stories ? stories.filter(story => story.urlToImage && story.urlToImage.trim() !== '') : [];
    return storiesWithImages.slice(0, 5);
  }, [stories]);

  // Auto-rotate stories every 5 seconds
  useEffect(() => {
    if (topStories.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % topStories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topStories.length]);

  // Don't render if we don't have enough stories with images
  if (!topStories || topStories.length < 3) return null;
  const mainStory = topStories[activeStory];
  const sideStories = topStories.filter((_, index) => index !== activeStory).slice(0, 3);

  const formatDate = (dateString) => formatTimeAgo(dateString, t);

  const createSlug = (article) => {
    const title = article.title.split(' - ')[0];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const articleData = encodeURIComponent(JSON.stringify({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown',
      author: article.author
    }));
    
    return `/article/${slug}?data=${articleData}`;
  };

  return (
    <div className={styles.topStoriesSection}>
      {/* Background Image Layer */}
      <div className={styles.backgroundLayer} key={`bg-${activeStory}`}>
        <Image 
          src={mainStory.urlToImage} 
          alt={mainStory.title}
          fill
          priority={true}
          sizes="100vw"
          quality={85}
          className={styles.backgroundImage}
          unoptimized
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className={styles.backgroundOverlay} />
      </div>

      {/* Content Layer */}
      <div className={styles.contentLayer}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('topStories.title')}</h2>
          <div className={styles.indicators}>
            {topStories.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === activeStory ? styles.indicatorActive : ''}`}
                onClick={() => setActiveStory(index)}
                aria-label={`View story ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.storiesGrid}>
          {/* Main Featured Story */}
          <Link 
            key={`main-${activeStory}`}
            href={createSlug(mainStory)} 
            className={styles.mainStory}
          >
            <span className={styles.badge}>{t('topStories.featured')}</span>
            <div className={styles.mainStoryContent}>
              <div className={styles.mainStoryMeta}>
                <span className={styles.source}>
                  {typeof mainStory.source === 'string' ? mainStory.source : mainStory.source?.name || t('common.unknown')}
                </span>
                <span className={styles.separator}>•</span>
                <span className={styles.time}>
                  <FaClock /> {formatDate(mainStory.publishedAt)}
                </span>
              </div>
              <h3 className={styles.mainStoryTitle}>{mainStory.title}</h3>
              <p className={styles.mainStoryDescription}>{mainStory.description}</p>
              <div className={styles.readMore}>
                {t('topStories.readFullStory')} <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Side Stories */}
          <div className={styles.sideStories} key={`side-${activeStory}`}>
            {sideStories.map((story, index) => (
              <Link key={index} href={createSlug(story)} className={styles.sideStory}>
                <div className={styles.sideStoryImage}>
                  <Image 
                    src={story.urlToImage} 
                    alt={story.title}
                    fill
                    sizes="150px"
                    quality={75}
                    unoptimized
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.classList.add(styles.sideImageFailed);
                    }}
                  />
                </div>
                <div className={styles.sideStoryContent}>
                  <div className={styles.sideStoryMeta}>
                    <span className={styles.sideSource}>
                      {typeof story.source === 'string' ? story.source : story.source?.name || t('common.unknown')}
                    </span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.sideTime}>
                      {formatDate(story.publishedAt)}
                    </span>
                  </div>
                  <h4 className={styles.sideStoryTitle}>{story.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TopStories);
