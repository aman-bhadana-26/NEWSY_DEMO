import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/StaticPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelopeOpen, 
  FaPaperPlane, 
  FaUser, 
  FaEnvelope, 
  FaComment, 
  FaCopy, 
  FaCheck, 
  FaQuestionCircle, 
  FaArrowRight 
} from 'react-icons/fa';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const charLimit = 500;

  const handleChange = (e) => {
    if (e.target.name === 'message' && e.target.value.length > charLimit) {
      return; // respect character limit
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@newsytech.com');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API transmission delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
    
    console.log('Form submitted:', formData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleSendAnother = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSubmitted(false);
  };

  return (
    <>
      <Head>
        <title>Contact Us - NewsyTech</title>
        <meta name="description" content="Get in touch with the NewsyTech team" />
      </Head>

      <div className={styles.pageContainer}>
        <motion.div 
          className={styles.pageHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FaEnvelopeOpen className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>{t('contact.title')}</h1>
          <p className={styles.pageSubtitle}>{t('contact.subtitle')}</p>
        </motion.div>

        <div className={styles.contactContainer}>
          {/* Sidebar Info Card */}
          <motion.div 
            className={styles.contactInfo}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div>
              <h2 className={styles.contactInfoTitle}>{t('contact.getInTouch')}</h2>
              <p className={styles.contactInfoText}>
                {t('contact.intro')}
              </p>
            </div>

            <div className={styles.contactDetails}>
              <div className={styles.contactDetail}>
                <FaEnvelope className={styles.contactDetailIcon} />
                <div className={styles.detailContent}>
                  <h4>{t('contact.emailLabel')}</h4>
                  <div className={styles.copyEmailContainer}>
                    <p className={styles.emailText}>contact@newsytech.com</p>
                    <button 
                      type="button" 
                      onClick={handleCopyEmail}
                      className={styles.copyButton}
                      title="Copy email to clipboard"
                    >
                      {copied ? <FaCheck style={{ color: '#1BA098' }} /> : <FaCopy />}
                    </button>
                    
                    <AnimatePresence>
                      {copied && (
                        <motion.span 
                          className={styles.copiedTooltip}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links / FAQ Prompt */}
            <Link href="/faqs" className={styles.faqLinkCard}>
              <div className={styles.faqCardContent}>
                <h4 className={styles.faqLinkTitle}>
                  <FaQuestionCircle style={{ marginRight: '6px' }} /> 
                  {t('faq.title') || 'Have Questions?'}
                </h4>
                <p className={styles.faqLinkText}>
                  Explore our Frequently Asked Questions to find quick answers.
                </p>
              </div>
              <FaArrowRight className={styles.faqLinkIcon} />
            </Link>
          </motion.div>

          {/* Form / Success Screen Panel */}
          <motion.div 
            className={styles.contactForm}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  className={styles.successState}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  key="success"
                >
                  <div className={styles.checkmarkCircle}>
                    <FaCheck className={styles.checkmark} />
                  </div>
                  <h3>{t('contact.sent.title')}</h3>
                  <p style={{ marginBottom: '24px' }}>{t('contact.sent.text')}</p>
                  
                  <button 
                    type="button" 
                    onClick={handleSendAnother}
                    className={styles.submitButton}
                    style={{ maxWidth: '220px' }}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="form"
                >
                  {/* Name Input with Floating Label */}
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder=" " // Crucial for CSS peer selectors
                        required
                        disabled={isSubmitting}
                      />
                      <label htmlFor="name" className={styles.floatingLabel}>
                        <FaUser className={styles.floatingLabelIcon} /> {t('contact.name')}
                      </label>
                    </div>
                  </div>

                  {/* Email Input with Floating Label */}
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder=" "
                        required
                        disabled={isSubmitting}
                      />
                      <label htmlFor="email" className={styles.floatingLabel}>
                        <FaEnvelope className={styles.floatingLabelIcon} /> {t('contact.emailFieldLabel')}
                      </label>
                    </div>
                  </div>

                  {/* Subject Input with Floating Label */}
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder=" "
                        required
                        disabled={isSubmitting}
                      />
                      <label htmlFor="subject" className={styles.floatingLabel}>
                        <FaComment className={styles.floatingLabelIcon} /> {t('contact.subject')}
                      </label>
                    </div>
                  </div>

                  {/* Message textarea with Floating Label */}
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={styles.formTextarea}
                        placeholder=" "
                        required
                        disabled={isSubmitting}
                      />
                      <label htmlFor="message" className={styles.floatingLabel}>
                        <FaComment className={styles.floatingLabelIcon} /> {t('contact.message')}
                      </label>
                    </div>
                    {/* Reactive Character Counter */}
                    <span className={`${styles.charCounter} ${formData.message.length > charLimit - 50 ? styles.charCounterWarn : ''}`}>
                      {formData.message.length} / {charLimit}
                    </span>
                  </div>

                  {/* Submit Button with Dynamic Submitting Spinner */}
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className={styles.buttonText}>
                        <span className={styles.spinner}></span>
                        {t('common.saving') || 'Sending...'}
                      </span>
                    ) : (
                      <span className={styles.buttonText}>
                        <FaPaperPlane /> {t('contact.send')}
                      </span>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
