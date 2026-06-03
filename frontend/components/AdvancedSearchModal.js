import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '../context/LanguageContext';
import { FaTimes, FaSearch, FaCalendarAlt, FaUser, FaGlobe, FaFilter, FaTrashAlt, FaFolderOpen } from 'react-icons/fa';
import styles from '../styles/AdvancedSearchModal.module.css';

export default function AdvancedSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const { t } = useLanguage();

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [activeDateChip, setActiveDateChip] = useState('anytime');

  // Sync form states with query parameters when modal opens
  useEffect(() => {
    if (isOpen) {
      const { search = '', category: cat = 'all', from = '', to = '', source: src = '', author: auth = '' } = router.query;
      setKeyword(search);
      setCategory(cat);
      setFromDate(from);
      setToDate(to);
      setSource(src);
      setAuthor(auth);

      // Determine active date chip
      if (!from && !to) {
        setActiveDateChip('anytime');
      } else {
        // Let's see if it matches any quick chips
        setActiveDateChip('custom');
      }
    }
  }, [isOpen, router.query]);

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: t('cat.all') },
    { key: 'ai', label: t('cat.ai') },
    { key: 'startups', label: t('cat.startups') },
    { key: 'software', label: t('cat.software') },
    { key: 'gadgets', label: t('cat.gadgets') },
    { key: 'cybersecurity', label: t('cat.cybersecurity') },
  ];

  const handleDateChipClick = (range) => {
    setActiveDateChip(range);
    const today = new Date();
    
    if (range === 'anytime') {
      setFromDate('');
      setToDate('');
    } else if (range === '24h') {
      const past24 = new Date(today);
      past24.setDate(today.getDate() - 1);
      setFromDate(past24.toISOString().split('T')[0]);
      setToDate(today.toISOString().split('T')[0]);
    } else if (range === 'week') {
      const pastWeek = new Date(today);
      pastWeek.setDate(today.getDate() - 7);
      setFromDate(pastWeek.toISOString().split('T')[0]);
      setToDate(today.toISOString().split('T')[0]);
    } else if (range === 'month') {
      const pastMonth = new Date(today);
      pastMonth.setMonth(today.getMonth() - 1);
      setFromDate(pastMonth.toISOString().split('T')[0]);
      setToDate(today.toISOString().split('T')[0]);
    }
  };

  const handleClearAll = () => {
    setKeyword('');
    setCategory('all');
    setFromDate('');
    setToDate('');
    setSource('');
    setAuthor('');
    setActiveDateChip('anytime');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const query = {};
    if (keyword.trim()) query.search = keyword.trim();
    if (category !== 'all') query.category = category;
    if (fromDate) query.from = fromDate;
    if (toDate) query.to = toDate;
    if (source.trim()) query.source = source.trim();
    if (author.trim()) query.author = author.trim();

    router.push({
      pathname: '/home',
      query: query,
    });
    
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            <FaFilter className={styles.titleIcon} />
            <h2>{t('nav.advancedTitle')}</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          {/* Keyword search */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaSearch className={styles.inputIconLabel} /> SEARCH KEYWORD
            </label>
            <input
              type="text"
              className={styles.textInput}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
            />
          </div>

          <div className={styles.formRow}>
            {/* Category selection */}
            <div className={styles.formGroupHalf}>
              <label className={styles.formLabel}>
                <FaFolderOpen className={styles.inputIconLabel} /> CATEGORY
              </label>
              <select
                className={styles.selectInput}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Source input */}
            <div className={styles.formGroupHalf}>
              <label className={styles.formLabel}>
                <FaGlobe className={styles.inputIconLabel} /> {t('nav.source').toUpperCase()}
              </label>
              <input
                type="text"
                className={styles.textInput}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. TechCrunch, Wired"
              />
            </div>
          </div>

          {/* Author input */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaUser className={styles.inputIconLabel} /> {t('nav.author').toUpperCase()}
            </label>
            <input
              type="text"
              className={styles.textInput}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Casey Newton"
            />
          </div>

          {/* Date range selection */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaCalendarAlt className={styles.inputIconLabel} /> DATE RANGE
            </label>
            
            {/* Quick date chips */}
            <div className={styles.dateChips}>
              <button
                type="button"
                className={`${styles.dateChip} ${activeDateChip === 'anytime' ? styles.dateChipActive : ''}`}
                onClick={() => handleDateChipClick('anytime')}
              >
                {t('nav.anytime')}
              </button>
              <button
                type="button"
                className={`${styles.dateChip} ${activeDateChip === '24h' ? styles.dateChipActive : ''}`}
                onClick={() => handleDateChipClick('24h')}
              >
                {t('nav.past24h')}
              </button>
              <button
                type="button"
                className={`${styles.dateChip} ${activeDateChip === 'week' ? styles.dateChipActive : ''}`}
                onClick={() => handleDateChipClick('week')}
              >
                {t('nav.pastWeek')}
              </button>
              <button
                type="button"
                className={`${styles.dateChip} ${activeDateChip === 'month' ? styles.dateChipActive : ''}`}
                onClick={() => handleDateChipClick('month')}
              >
                {t('nav.pastMonth')}
              </button>
            </div>

            {/* Custom From / To Date Pickers */}
            <div className={styles.dateInputRow}>
              <div className={styles.dateInputWrapper}>
                <span className={styles.dateLabel}>{t('nav.fromDate')}</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setActiveDateChip('custom');
                  }}
                />
              </div>
              <div className={styles.dateInputWrapper}>
                <span className={styles.dateLabel}>{t('nav.toDate')}</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setActiveDateChip('custom');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearAll}
            >
              <FaTrashAlt className={styles.actionBtnIcon} />
              {t('nav.clearAll')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              <FaSearch className={styles.actionBtnIcon} />
              {t('nav.applyFilters')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
