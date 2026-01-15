import { useRouter } from 'next/router';
import styles from '../styles/CategoryFilter.module.css';

const CategoryFilter = ({ currentCategory }) => {
  const router = useRouter();

  const categories = [
    { name: 'All News', value: 'all', icon: '📰' },
    { name: 'Artificial Intelligence', value: 'ai', icon: '🤖' },
    { name: 'Startups', value: 'startups', icon: '🚀' },
    { name: 'Software', value: 'software', icon: '💻' },
    { name: 'Gadgets', value: 'gadgets', icon: '📱' },
    { name: 'Cybersecurity', value: 'cybersecurity', icon: '🔒' },
  ];

  const handleCategoryChange = (category) => {
    router.push(`/?category=${category}`);
  };

  return (
    <div className={styles.filterContainer}>
      <h2 className={styles.title}>Browse by Category</h2>
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
