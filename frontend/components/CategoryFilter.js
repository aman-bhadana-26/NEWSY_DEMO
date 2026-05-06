import { useRouter } from 'next/router';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/CategoryFilter.module.css';

const CategoryFilter = ({ currentCategory }) => {
  const router = useRouter();
  const { t } = useLanguage();

  const categories = [
    { name: t('catFilter.all'),           value: 'all',           icon: '📰' },
    { name: t('catFilter.ai'),            value: 'ai',            icon: '🤖' },
    { name: t('catFilter.startups'),      value: 'startups',      icon: '🚀' },
    { name: t('catFilter.software'),      value: 'software',      icon: '💻' },
    { name: t('catFilter.gadgets'),       value: 'gadgets',       icon: '📱' },
    { name: t('catFilter.cybersecurity'), value: 'cybersecurity', icon: '🔒' },
  ];

  const handleCategoryChange = (category) => {
    router.push(`/?category=${category}`);
  };

  return (
    <div className={styles.filterContainer}>
      <h2 className={styles.title}>{t('catFilter.title')}</h2>
      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            className={`${styles.categoryBtn} ${
              currentCategory === category.value ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{category.icon}</span>
            <span className={styles.name}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
