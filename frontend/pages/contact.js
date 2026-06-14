import Head from 'next/head';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/StaticPage.module.css';
import { FaEnvelopeOpen, FaPaperPlane, FaUser, FaEnvelope, FaComment } from 'react-icons/fa';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Contact Us - NewsyTech</title>
        <meta name="description" content="Get in touch with the NewsyTech team" />
      </Head>

      <div className={styles.pageContainer}>
        <div className={`${styles.pageHeader} anim-slide`}>
          <FaEnvelopeOpen className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>{t('contact.title')}</h1>
          <p className={styles.pageSubtitle}>{t('contact.subtitle')}</p>
        </div>

        <div className={styles.contactContainer}>
          <div className={`${styles.contactInfo} anim-fade-left delay-1`}>
            <h2 className={styles.contactInfoTitle}>{t('contact.getInTouch')}</h2>
            <p className={styles.contactInfoText}>
              {t('contact.intro')}
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.contactDetail}>
                <FaEnvelope className={styles.contactDetailIcon} />
                <div>
                  <h4>{t('contact.emailLabel')}</h4>
                  <p>contact@newsytech.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.contactForm} anim-fade-right delay-2`}>
            {submitted ? (
              <div className={styles.successMessage}>
                <FaPaperPlane className={styles.successIcon} />
                <h3>{t('contact.sent.title')}</h3>
                <p>{t('contact.sent.text')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    <FaUser className={styles.formLabelIcon} /> {t('contact.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={t('contact.namePlaceholder')}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <FaEnvelope className={styles.formLabelIcon} /> {t('contact.emailFieldLabel')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={t('contact.emailFieldPlaceholder')}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.formLabel}>
                    <FaComment className={styles.formLabelIcon} /> {t('contact.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={t('contact.subjectPlaceholder')}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    <FaComment className={styles.formLabelIcon} /> {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    placeholder={t('contact.messagePlaceholder')}
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  <FaPaperPlane /> {t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
