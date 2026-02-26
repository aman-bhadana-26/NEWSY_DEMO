import Head from 'next/head';
import Layout from '../components/Layout';
import { useState } from 'react';
import styles from '../styles/StaticPage.module.css';
import { FaEnvelopeOpen, FaPaperPlane, FaUser, FaEnvelope, FaComment } from 'react-icons/fa';

export default function Contact() {
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
    <Layout>
      <Head>
        <title>Contact Us - NewsyTech</title>
        <meta name="description" content="Get in touch with the NewsyTech team" />
      </Head>

      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <FaEnvelopeOpen className={styles.pageIcon} />
          <h1 className={styles.pageTitle}>Contact Us</h1>
          <p className={styles.pageSubtitle}>We'd love to hear from you</p>
        </div>

        <div className={styles.contactContainer}>
          <div className={styles.contactInfo}>
            <h2 className={styles.contactInfoTitle}>Get In Touch</h2>
            <p className={styles.contactInfoText}>
              Have a question, suggestion, or feedback? Fill out the form and we'll get back to you as soon as possible.
            </p>
            
            <div className={styles.contactDetails}>
              <div className={styles.contactDetail}>
                <FaEnvelope className={styles.contactDetailIcon} />
                <div>
                  <h4>Email</h4>
                  <p>contact@newsytech.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactForm}>
            {submitted ? (
              <div className={styles.successMessage}>
                <FaPaperPlane className={styles.successIcon} />
                <h3>Message Sent!</h3>
                <p>Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    <FaUser className={styles.formLabelIcon} /> Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <FaEnvelope className={styles.formLabelIcon} /> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.formLabel}>
                    <FaComment className={styles.formLabelIcon} /> Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    <FaComment className={styles.formLabelIcon} /> Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    placeholder="Your message..."
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  <FaPaperPlane /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
