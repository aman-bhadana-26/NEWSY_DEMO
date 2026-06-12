import { useEffect, useRef, useState } from 'react';
import { FaGlobe, FaChevronDown, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { language, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const current = languages.find((l) => l.code === language) || languages[0];

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 250); // Small delay to prevent sudden closing
  };

  const handleToggle = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen((o) => !o);
  };

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

  // Cleanup timeout on unmount.
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  // Dropdown list animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -12,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 1, 1],
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.8,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      }
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.96,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1],
      }
    }
  };

  // Individual list item animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -6,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.label')}
        title={t('lang.label')}
      >
        <motion.span
          animate={open ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={styles.globeWrapper}
        >
          <FaGlobe className={styles.globeIcon} aria-hidden="true" />
        </motion.span>
        <span className={styles.code}>{current.short}</span>
        <motion.span
          animate={open ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={styles.chevronWrapper}
        >
          <FaChevronDown className={styles.chevron} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className={styles.dropdown}
            role="listbox"
            aria-label={t('lang.label')}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
          >
            {languages.map((lng) => {
              const selected = lng.code === language;
              return (
                <motion.li
                  key={lng.code}
                  role="presentation"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.option} ${selected ? styles.optionActive : ''}`}
                    onClick={() => handleSelect(lng.code)}
                  >
                    <span className={styles.optionShort}>{lng.short}</span>
                    <span className={styles.optionLabel}>{lng.label}</span>
                    <AnimatePresence>
                      {selected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={styles.checkIconWrapper}
                        >
                          <FaCheck className={styles.checkIcon} aria-hidden="true" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;

