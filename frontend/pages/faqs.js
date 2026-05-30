import Head from 'next/head';
import Layout from '../components/Layout';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaLightbulb, FaShieldAlt, FaCogs, FaSave, FaSyncAlt } from 'react-icons/fa';
import styles from '../styles/Faqs.module.css';

export default function Faqs() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      icon: <FaSyncAlt className={styles.itemIcon} />,
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    {
      icon: <FaCogs className={styles.itemIcon} />,
      question: t('faq.q2'),
      answer: t('faq.a2'),
    },
    {
      icon: <FaSave className={styles.itemIcon} />,
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
    {
      icon: <FaShieldAlt className={styles.itemIcon} />,
      question: t('faq.q4'),
      answer: t('faq.a4'),
    },
    {
      icon: <FaLightbulb className={styles.itemIcon} />,
      question: t('faq.q5'),
      answer: t('faq.a5'),
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{`${t('nav.faqs')} - NewsyTech`}</title>
        <meta name="description" content="Frequently Asked Questions about NewsyTech technology intelligence feed platform." />
      </Head>

      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <FaQuestionCircle className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>{t('faq.title')}</h1>
          <p className={styles.pageSubtitle}>{t('faq.subtitle')}</p>
        </div>

        <div className={styles.faqsWrapper}>
          <div className={styles.faqList}>
            {faqItems.map((item, index) => {
              const isOpen = activeIndex === index;
              return (
                <div 
                  key={index} 
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                >
                  <button 
                    type="button"
                    className={styles.faqHeader}
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <div className={styles.questionWrapper}>
                      {item.icon}
                      <span className={styles.questionText}>{item.question}</span>
                    </div>
                    <span className={styles.arrowIcon}>
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </button>

                  <div 
                    className={`${styles.answerWrapper} ${isOpen ? styles.answerWrapperOpen : ''}`}
                  >
                    <div className={styles.answerContent}>
                      <p className={styles.answerText}>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
