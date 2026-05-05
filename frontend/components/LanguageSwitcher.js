import { useEffect, useRef, useState } from 'react';
import { FaGlobe, FaChevronDown, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { language, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const current = languages.find((l) => l.code === language) || languages[0];

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.label')}
        title={t('lang.label')}
      >
        <FaGlobe className={styles.globeIcon} aria-hidden="true" />
        <span className={styles.code}>{current.short}</span>
        <FaChevronDown
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox" aria-label={t('lang.label')}>
          {languages.map((lng) => {
            const selected = lng.code === language;
            return (
              <li key={lng.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`${styles.option} ${selected ? styles.optionActive : ''}`}
                  onClick={() => handleSelect(lng.code)}
                >
                  <span className={styles.optionShort}>{lng.short}</span>
                  <span className={styles.optionLabel}>{lng.label}</span>
                  {selected && <FaCheck className={styles.checkIcon} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
