import { useState, useEffect } from 'react';
import { FaCheckCircle, FaCircle, FaSave, FaRedo } from 'react-icons/fa';
import styles from '../styles/TopicSelector.module.css';

const TopicSelector = ({ initialTopics = ['all'], onSave, loading = false }) => {
  const [selectedTopics, setSelectedTopics] = useState(initialTopics);
  const [hasChanges, setHasChanges] = useState(false);

  const availableTopics = [
    { id: 'all', name: 'All Topics', icon: '🌐', description: 'General technology news' },
    { id: 'ai', name: 'AI & Machine Learning', icon: '🤖', description: 'Artificial intelligence and ML' },
    { id: 'startups', name: 'Startups & Funding', icon: '🚀', description: 'Startup news and venture capital' },
    { id: 'software', name: 'Software Development', icon: '💻', description: 'Programming and development' },
    { id: 'gadgets', name: 'Gadgets & Hardware', icon: '📱', description: 'Latest devices and hardware' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', description: 'Security and data protection' },
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
        <h3 className={styles.title}>Customize Your News Feed</h3>
        {hasChanges && (
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div className={styles.topicsRow}>
        {availableTopics.map(topic => {
          const isSelected = selectedTopics.includes(topic.id);
          
          return (
            <button
              key={topic.id}
              onClick={() => handleTopicToggle(topic.id)}
              className={`${styles.topicButton} ${isSelected ? styles.selected : ''}`}
              disabled={loading}
            >
              <span className={styles.topicIcon}>{topic.icon}</span>
              <span className={styles.topicName}>{topic.name}</span>
              {isSelected && <FaCheckCircle className={styles.checkIcon} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopicSelector;
