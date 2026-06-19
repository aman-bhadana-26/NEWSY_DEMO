import { useState, useEffect } from 'react';
import { FaCheckCircle, FaCircle, FaSave, FaRedo } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/TopicSelector.module.css';

const TopicSelector = ({ initialTopics = ['all'], onSave, loading = false }) => {
  const { t } = useLanguage();
  const [selectedTopics, setSelectedTopics] = useState(initialTopics);
  const [hasChanges, setHasChanges] = useState(false);

  const availableTopics = [
    { id: 'all',           name: t('topics.all.name'),           icon: '🌐', description: t('topics.all.desc') },
    { id: 'ai',            name: t('topics.ai.name'),            icon: '🤖', description: t('topics.ai.desc') },
    { id: 'startups',      name: t('topics.startups.name'),      icon: '🚀', description: t('topics.startups.desc') },
    { id: 'software',      name: t('topics.software.name'),      icon: '💻', description: t('topics.software.desc') },
    { id: 'gadgets',       name: t('topics.gadgets.name'),       icon: '📱', description: t('topics.gadgets.desc') },
    { id: 'cybersecurity', name: t('topics.cybersecurity.name'), icon: '🔒', description: t('topics.cybersecurity.desc') },
  ];

  useEffect(() => {
    setSelectedTopics(initialTopics);
  }, [initialTopics]);

  useEffect(() => {
    // Check if current selection differs from initial
    const hasChanged = JSON.stringify(selectedTopics.sort()) !== JSON.stringify(initialTopics.sort());
    setHasChanges(hasChanged);
  }, [selectedTopics, initialTopics]);

  const handleTopicToggle = (topicId) => {
    if (topicId === 'all') {
      // If selecting 'all', clear other selections
      setSelectedTopics(['all']);
    } else {
      setSelectedTopics(prev => {
        // Remove 'all' if it's selected and user selects a specific topic
        const withoutAll = prev.filter(t => t !== 'all');
        
        if (prev.includes(topicId)) {
          // If deselecting and it's the last one, switch to 'all'
          const remaining = withoutAll.filter(t => t !== topicId);
          return remaining.length === 0 ? ['all'] : remaining;
        } else {
          // Add the new topic
          return [...withoutAll, topicId];
        }
      });
    }
  };

  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave(selectedTopics);
    }
  };

  const handleReset = () => {
    setSelectedTopics(initialTopics);
  };

  return (
    <div className={styles.topicSelector}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>{t('topics.title')}</h3>
          <p className={styles.subtitle}>Select the topics you want to follow in your personalized news feed.</p>
        </div>
        <div className={styles.headerActions}>
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className={styles.resetButton}
                disabled={loading}
              >
                <FaRedo /> Reset
              </button>
              <button
                onClick={handleSave}
                className={styles.saveButton}
                disabled={loading}
              >
                <FaSave /> {loading ? t('topics.saving') : t('topics.save')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.topicsGrid}>
        {availableTopics.map(topic => {
          const isSelected = selectedTopics.includes(topic.id);
          
          return (
            <div
              key={topic.id}
              onClick={() => !loading && handleTopicToggle(topic.id)}
              className={`${styles.topicCard} ${isSelected ? styles.selectedCard : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!loading) handleTopicToggle(topic.id);
                }
              }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{topic.icon}</span>
                <div className={`${styles.selectionIndicator} ${isSelected ? styles.indicatorSelected : ''}`}>
                  {isSelected ? <FaCheckCircle className={styles.checkIcon} /> : <FaCircle className={styles.emptyCircle} />}
                </div>
              </div>
              <div className={styles.cardBody}>
                <h4 className={styles.cardName}>{topic.name}</h4>
                <p className={styles.cardDescription}>{topic.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicSelector;
