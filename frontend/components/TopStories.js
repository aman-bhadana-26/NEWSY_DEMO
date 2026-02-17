import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClock, FaArrowRight, FaNewspaper } from 'react-icons/fa';
import styles from '../styles/TopStories.module.css';

const TopStories = ({ stories }) => {
  const [activeStory, setActiveStory] = useState(0);

  // Filter stories with images and get top 5
  const storiesWithImages = stories ? stories.filter(story => story.urlToImage && story.urlToImage.trim() !== '') : [];
  const topStories = storiesWithImages.slice(0, 5);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
      <div className={styles.header}>
        <h2 className={styles.title}>Top Stories</h2>
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
          <Link href={createSlug(mainStory)} className={styles.mainStory}>
            <div className={styles.mainStoryImage}>
              <img 
                src={mainStory.urlToImage} 
                alt={mainStory.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add(styles.imageFailed);
                }}
              />
              <div className={styles.overlay} />
              <span className={styles.badge}>FEATURED</span>
            </div>
            <div className={styles.mainStoryContent}>
              <div className={styles.mainStoryMeta}>
                <span className={styles.source}>
                  {typeof mainStory.source === 'string' ? mainStory.source : mainStory.source?.name || 'Unknown'}
                </span>
                <span className={styles.separator}>•</span>
                <span className={styles.time}>
                  <FaClock /> {formatDate(mainStory.publishedAt)}
                </span>
              </div>
              <h3 className={styles.mainStoryTitle}>{mainStory.title}</h3>
              <p className={styles.mainStoryDescription}>{mainStory.description}</p>
              <div className={styles.readMore}>
                Read Full Story <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Side Stories */}
          <div className={styles.sideStories}>
            {sideStories.map((story, index) => (
              <Link key={index} href={createSlug(story)} className={styles.sideStory}>
                <div className={styles.sideStoryImage}>
                  <img 
                    src={story.urlToImage} 
                    alt={story.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add(styles.sideImageFailed);
                    }}
                  />
                </div>
                <div className={styles.sideStoryContent}>
                  <div className={styles.sideStoryMeta}>
                    <span className={styles.sideSource}>
                      {typeof story.source === 'string' ? story.source : story.source?.name || 'Unknown'}
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
  );
};

export default TopStories;
