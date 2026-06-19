import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Particles from '../components/Particles';
import { authAPI, analyticsAPI } from '../utils/api';
import { FaTwitter, FaGithub, FaLinkedin, FaGlobe, FaFire, FaBookOpen, FaClock } from 'react-icons/fa';
import styles from '../styles/Profile.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const PROFILE_LOCALE_MAP = { en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };

export default function Profile() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading, updateUser, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'socials'
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
    bio: '',
    twitter: '',
    github: '',
    linkedin: '',
    website: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoHovered, setPhotoHovered] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        newPassword: '',
        bio: user.bio || '',
        twitter: user.socialLinks?.twitter || '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        website: user.socialLinks?.website || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      analyticsAPI.getMyAnalytics()
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching analytics:', err));
    }
  }, [isAuthenticated]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('profile.passwordTooShort') });
      setLoading(false);
      return;
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
      socialLinks: {
        twitter: formData.twitter,
        github: formData.github,
        linkedin: formData.linkedin,
        website: formData.website
      }
    };
    if (formData.newPassword) updateData.password = formData.newPassword;

    const result = await updateUser(updateData);
    if (result.success) {
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      setIsEditing(false);
      setFormData({
        name: result.user?.name || formData.name,
        email: result.user?.email || formData.email,
        newPassword: '',
        bio: result.user?.bio || formData.bio,
        twitter: result.user?.socialLinks?.twitter || formData.twitter,
        github: result.user?.socialLinks?.github || formData.github,
        linkedin: result.user?.socialLinks?.linkedin || formData.linkedin,
        website: result.user?.socialLinks?.website || formData.website
      });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setActiveTab('profile');
    setFormData({
      name: user.name || '',
      email: user.email || '',
      newPassword: '',
      bio: user.bio || '',
      twitter: user.socialLinks?.twitter || '',
      github: user.socialLinks?.github || '',
      linkedin: user.socialLinks?.linkedin || '',
      website: user.socialLinks?.website || ''
    });
    setMessage({ type: '', text: '' });
  };


  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: t('profile.photoTooLarge') || 'Photo size must be less than 5MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: t('profile.invalidPhotoType') || 'Only image files are allowed (JPEG, PNG, GIF, WEBP)' });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.uploadProfilePicture(file);
      await refreshUser();
      setImageKey(Date.now());
      setMessage({ type: 'success', text: t('profile.photoUploadSuccess') || 'Profile picture updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('profile.photoUploadError') || 'Failed to upload profile picture' 
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm(t('profile.confirmDeletePhoto') || 'Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.deleteProfilePicture();
      await refreshUser();
      setImageKey(Date.now());
      setMessage({ type: 'success', text: t('profile.photoDeleteSuccess') || 'Profile picture deleted successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('profile.photoDeleteError') || 'Failed to delete profile picture' 
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const dateLocale = PROFILE_LOCALE_MAP[language] || 'en-US';
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });

  const joinMonth = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short' })
    : new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'short' });

  if (authLoading) {
    return (
      <div className={styles.stateWrap}><LoadingSpinner /></div>
    );
  }

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase() || '?';
  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const profileImageUrl = user.profilePicture ? `${BASE_URL}${user.profilePicture}?t=${imageKey}` : null;

  return (
    <>
      <Head>
        <title>Profile – NEWSYTECH</title>
      </Head>
      {/* ── Particles fixed behind everything including navbar ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <Particles
          particleColors={['#24c9b8', '#1BA098', '#CBA135']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <div className={styles.page}>

        {/* ── Ambient glow ── */}
        <div className={styles.glow1} />
        <div className={styles.glow2} />

        <div className={styles.grid}>

          {/* ══ LEFT PANEL ══ */}
          <aside className={`${styles.leftPanel} anim-fade-left`}>

            {/* Avatar card */}
            <div className={styles.avatarCard}>
              <div className={styles.avatarCardBg} />
              <div 
                className={styles.avatarWrap}
                onMouseEnter={() => setPhotoHovered(true)}
                onMouseLeave={() => setPhotoHovered(false)}
              >
                <div className={styles.avatar}>
                  {profileImageUrl ? (
                    <img 
                      key={imageKey}
                      src={profileImageUrl} 
                      alt={user.name} 
                      className={styles.avatarImage}
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div className={styles.avatarRing} />
                
                {!uploadingPhoto && photoHovered && (
                  <div className={styles.avatarOverlay}>
                    <button 
                      className={styles.avatarEditBtn} 
                      onClick={handlePhotoClick}
                      title={t('profile.uploadPhoto') || 'Upload Photo'}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z" />
                        <path fillRule="evenodd" d="M8 10a4 4 0 00-3.446 6.032l-1.261 1.26a1 1 0 101.414 1.415l1.261-1.261A4 4 0 108 10zm-2 4a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {profileImageUrl && (
                      <button 
                        className={styles.avatarDeleteBtn} 
                        onClick={handleDeletePhoto}
                        title={t('profile.deletePhoto') || 'Delete Photo'}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {uploadingPhoto && (
                  <div className={styles.avatarOverlay}>
                    <div className={styles.uploadingSpinner} />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userHandle}>@{user.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
              <p className={styles.memberSince}>{t('profile.memberSince')} {joinMonth}</p>

              <div className={styles.badges}>
                <span className={styles.badge}>{t('profile.badge.member')}</span>
                {user.createdAt && <span className={styles.badgeGold}>{t('profile.badge.verified')}</span>}
              </div>

              {/* Bio Block */}
              <div className={styles.bioBlock}>
                {user.bio ? (
                  <p className={styles.userBio}>{user.bio}</p>
                ) : (
                  <p className={styles.userBioEmpty}>{t('profile.noBio')}</p>
                )}
              </div>

              {/* Social Links Row */}
              <div className={styles.socialsRow}>
                {user.socialLinks?.twitter ? (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIconLink} title="Twitter / X">
                    <FaTwitter />
                  </a>
                ) : (
                  <span className={`${styles.socialIconLink} ${styles.disabled}`} title="Twitter / X"><FaTwitter /></span>
                )}
                {user.socialLinks?.github ? (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className={styles.socialIconLink} title="GitHub">
                    <FaGithub />
                  </a>
                ) : (
                  <span className={`${styles.socialIconLink} ${styles.disabled}`} title="GitHub"><FaGithub /></span>
                )}
                {user.socialLinks?.linkedin ? (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIconLink} title="LinkedIn">
                    <FaLinkedin />
                  </a>
                ) : (
                  <span className={`${styles.socialIconLink} ${styles.disabled}`} title="LinkedIn"><FaLinkedin /></span>
                )}
                {user.socialLinks?.website ? (
                  <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className={styles.socialIconLink} title="Website">
                    <FaGlobe />
                  </a>
                ) : (
                  <span className={`${styles.socialIconLink} ${styles.disabled}`} title="Website"><FaGlobe /></span>
                )}
              </div>

              {/* Dynamic Reading Statistics Widget */}
              {stats && (
                <div className={styles.statsSection}>
                  <div className={styles.statsSectionTitle}>{t('profile.stats.title')}</div>
                  <div className={styles.statsGridMini}>
                    <div className={styles.statBoxMini} title={`${stats.readingStreak} ${t('profile.stats.streak')}`}>
                      <span className={styles.statIconMini}><FaFire style={{ color: '#ff6b6b' }} /></span>
                      <span className={styles.statValMini}>{stats.readingStreak}</span>
                      <span className={styles.statLabelMini}>{t('profile.stats.streak')}</span>
                    </div>
                    <div className={styles.statBoxMini} title={`${stats.articlesRead} ${t('profile.stats.read')}`}>
                      <span className={styles.statIconMini}><FaBookOpen style={{ color: '#1BA098' }} /></span>
                      <span className={styles.statValMini}>{stats.articlesRead}</span>
                      <span className={styles.statLabelMini}>{t('profile.stats.read')}</span>
                    </div>
                    <div className={styles.statBoxMini} title={stats.totalTime?.label || t('profile.stats.time')}>
                      <span className={styles.statIconMini}><FaClock style={{ color: '#DEB992' }} /></span>
                      <span className={styles.statValMini}>
                        {stats.totalTime?.label?.replace(/\s*hours?/, 'h')?.replace(/\s*mins?/, 'm') || '0m'}
                      </span>
                      <span className={styles.statLabelMini}>{t('profile.stats.time').split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>


            {/* Account Info */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{t('profile.accountInfo')}</span>
              </div>
              <div className={styles.infoList}>
                <div className={`${styles.infoRow} anim-fade-left delay-1`}>
                  <span className={styles.infoIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                  </span>
                  <div>
                    <p className={styles.infoFieldLabel}>{t('profile.fullName')}</p>
                    <p className={styles.infoFieldValue}>{user.name}</p>
                  </div>
                </div>
                <div className={`${styles.infoRow} anim-fade-left delay-2`}>
                  <span className={styles.infoIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  </span>
                  <div>
                    <p className={styles.infoFieldLabel}>{t('profile.emailAddress')}</p>
                    <p className={styles.infoFieldValue}>{user.email}</p>
                  </div>
                </div>
                <div className={`${styles.infoRow} anim-fade-left delay-3`}>
                  <span className={styles.infoIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                  </span>
                  <div>
                    <p className={styles.infoFieldLabel}>{t('profile.memberSinceLabel')}</p>
                    <p className={styles.infoFieldValue}>{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

          </aside>

          {/* ══ RIGHT PANEL ══ */}
          <main className={`${styles.rightPanel} anim-fade-right`}>

            <div className={styles.rightCard}>
              <div className={styles.rightCardHeader}>
                <div className={styles.rightCardTitle}>
                  <span className={styles.rightCardTitleAccent}>// </span>
                  {isEditing ? t('profile.editProfileTitle') : t('profile.profileSettings')}
                </div>
                {message.text && (
                  <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.type === 'success' ? '✓' : '✕'} {message.text}
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!isEditing ? (
                  /* ── View mode ── */
                  <motion.div
                    key="viewMode"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className={styles.viewMode}
                  >
                    <p className={styles.viewIntro}>
                      {t('profile.intro')}
                    </p>

                    <div className={styles.fieldGrid}>
                      <div className={styles.fieldBlock}>
                        <span className={styles.fieldBlockLabel}>{t('profile.fullName')}</span>
                        <p className={styles.fieldBlockValue}>{user.name}</p>
                      </div>
                      <div className={styles.fieldBlock}>
                        <span className={styles.fieldBlockLabel}>{t('profile.email')}</span>
                        <p className={styles.fieldBlockValue}>{user.email}</p>
                      </div>
                      <div className={styles.fieldBlock}>
                        <span className={styles.fieldBlockLabel}>{t('profile.password')}</span>
                        <p className={styles.fieldBlockValue}>••••••••</p>
                      </div>
                      <div className={styles.fieldBlock}>
                        <span className={styles.fieldBlockLabel}>{t('profile.accountStatus')}</span>
                        <p className={`${styles.fieldBlockValue} ${styles.statusActive}`}>{t('profile.active')}</p>
                      </div>
                    </div>

                    <button className={styles.primaryBtn} onClick={() => setIsEditing(true)}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      {t('profile.editProfile')}
                    </button>
                  </motion.div>
                ) : (
                  /* ── Edit mode ── */
                  <motion.div
                    key="editMode"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <form className={styles.editForm} onSubmit={handleSubmit}>
                      {/* Tabs Header inside Edit Mode Form */}
                      <div className={styles.tabsContainer}>
                        <button
                          type="button"
                          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.tabButtonActive : ''}`}
                          onClick={() => setActiveTab('profile')}
                        >
                          {t('profile.tab.settings')}
                          {activeTab === 'profile' && (
                            <motion.div layoutId="activeTabIndicator" className={styles.tabIndicator} />
                          )}
                        </button>
                        <button
                          type="button"
                          className={`${styles.tabButton} ${activeTab === 'socials' ? styles.tabButtonActive : ''}`}
                          onClick={() => setActiveTab('socials')}
                        >
                          {t('profile.tab.socials')}
                          {activeTab === 'socials' && (
                            <motion.div layoutId="activeTabIndicator" className={styles.tabIndicator} />
                          )}
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                          <motion.div
                            key="profile-tab-content"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                          >
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel} htmlFor="name">{t('profile.fullName')}</label>
                              <input
                                id="name"
                                name="name"
                                type="text"
                                className={styles.formInput}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder={t('profile.namePlaceholder')}
                                autoComplete="off"
                              />
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel} htmlFor="email">{t('profile.emailAddress')}</label>
                              <input
                                id="email"
                                name="email"
                                type="email"
                                className={styles.formInput}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder={t('profile.emailPlaceholder')}
                                autoComplete="off"
                              />
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel} htmlFor="newPassword">
                                {t('profile.newPassword')} <span className={styles.optionalTag}>{t('profile.optional')}</span>
                              </label>
                              <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                className={styles.formInput}
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder={t('profile.passwordPlaceholder')}
                                autoComplete="new-password"
                              />
                              <p className={styles.inputHint}>{t('profile.passwordHint')}</p>
                            </div>

                            <div className={styles.formGroup}>
                              <div className={styles.labelRow}>
                                <label className={styles.formLabel} htmlFor="bio">
                                  {t('profile.bio')} <span className={styles.optionalTag}>{t('profile.optional')}</span>
                                </label>
                                <span className={`${styles.charCount} ${formData.bio.length >= 200 ? styles.limitReached : ''}`}>
                                  {formData.bio.length}/200
                                </span>
                              </div>
                              <textarea
                                id="bio"
                                name="bio"
                                className={styles.formTextarea}
                                value={formData.bio}
                                onChange={handleChange}
                                maxLength={200}
                                placeholder={t('profile.bioPlaceholder')}
                                rows={3}
                              />
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="socials-tab-content"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                          >
                            <div className={styles.socialFormSection} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                              <h3 className={styles.formSectionTitle}>
                                <span className={styles.rightCardTitleAccent}>// </span>
                                {t('profile.socialLinks')}
                              </h3>
                              
                              <div className={styles.socialInputsGrid}>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel} htmlFor="twitter">
                                    <FaTwitter style={{ marginRight: '6px', verticalAlign: 'middle', color: '#1a91da' }} />
                                    {t('profile.twitter')}
                                  </label>
                                  <input
                                    id="twitter"
                                    name="twitter"
                                    type="url"
                                    className={styles.formInput}
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder={t('profile.twitterPlaceholder')}
                                    autoComplete="off"
                                  />
                                </div>

                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel} htmlFor="github">
                                    <FaGithub style={{ marginRight: '6px', verticalAlign: 'middle', color: '#ffffff' }} />
                                    {t('profile.github')}
                                  </label>
                                  <input
                                    id="github"
                                    name="github"
                                    type="url"
                                    className={styles.formInput}
                                    value={formData.github}
                                    onChange={handleChange}
                                    placeholder={t('profile.githubPlaceholder')}
                                    autoComplete="off"
                                  />
                                </div>

                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel} htmlFor="linkedin">
                                    <FaLinkedin style={{ marginRight: '6px', verticalAlign: 'middle', color: '#0077b5' }} />
                                    {t('profile.linkedin')}
                                  </label>
                                  <input
                                    id="linkedin"
                                    name="linkedin"
                                    type="url"
                                    className={styles.formInput}
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder={t('profile.linkedinPlaceholder')}
                                    autoComplete="off"
                                  />
                                </div>

                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel} htmlFor="website">
                                    <FaGlobe style={{ marginRight: '6px', verticalAlign: 'middle', color: '#24c9b8' }} />
                                    {t('profile.website')}
                                  </label>
                                  <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    className={styles.formInput}
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder={t('profile.websitePlaceholder')}
                                    autoComplete="off"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className={styles.formBtns}>
                        <button type="submit" className={styles.primaryBtn} disabled={loading}>
                          {loading ? (
                            <><span className={styles.btnSpinner} /> {t('profile.saving')}</>
                          ) : (
                            <>
                              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              {t('profile.saveChanges')}
                            </>
                          )}
                        </button>
                        <button type="button" className={styles.ghostBtn} onClick={cancelEdit}>
                          {t('profile.cancel')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Quick nav tiles */}
            <div className={styles.quickLinks}>
              <div className={`${styles.quickLink} anim-fade-up delay-1`} onClick={() => router.push('/my-news')}>
                <span className={styles.quickLinkIcon}>◈</span>
                <div>
                  <p className={styles.quickLinkTitle}>{t('profile.quick.myNews')}</p>
                  <p className={styles.quickLinkSub}>{t('profile.quick.myNewsSub')}</p>
                </div>
                <span className={styles.quickLinkArrow}>→</span>
              </div>
              <div className={`${styles.quickLink} anim-fade-up delay-2`} onClick={() => router.push('/my-news?tab=saved')}>
                <span className={styles.quickLinkIcon}>◇</span>
                <div>
                  <p className={styles.quickLinkTitle}>{t('profile.quick.saved')}</p>
                  <p className={styles.quickLinkSub}>{t('profile.quick.savedSub')}</p>
                </div>
                <span className={styles.quickLinkArrow}>→</span>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}

