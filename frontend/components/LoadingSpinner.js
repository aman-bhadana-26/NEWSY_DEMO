import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner = ({ message }) => {
  const { t } = useLanguage();
  const text = message || t('common.loading');
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
