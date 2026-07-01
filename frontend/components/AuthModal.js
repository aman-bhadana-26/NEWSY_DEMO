import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FaTimes,
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';
import styles from '../styles/AuthModal.module.css';

export default function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    setAuthModalTab,
    openAuthModal,
    login,
    register,
    registerRequest,
    verifyOtp,
    socialLogin
  } = useAuth();

  const { t } = useLanguage();
  const modalRef = useRef(null);

  // Handle auth query parameters (e.g. ?auth=login or ?auth=signup)
  useEffect(() => {
    if (router.isReady && (router.query.auth === 'login' || router.query.auth === 'signup')) {
      openAuthModal(router.query.auth);
      const { auth, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.auth, router, openAuthModal]);

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [connectingSocial, setConnectingSocial] = useState(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialPassword, setSocialPassword] = useState('');

  // Reset states when tab changes or modal opens/closes
  useEffect(() => {
    setError('');
    setSuccess('');
    setLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSocialEmail('');
    setSocialPassword('');
    setOtpCode('');

    // Only clear form fields if we are NOT on the OTP verification tab
    if (authModalTab !== 'otp-verify') {
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
    }
  }, [authModalTab, isAuthModalOpen]);

  // Sync modal class with body element to trigger backdrop blur
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.classList.add('auth-modal-open');

      // Escape key event listener
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeAuthModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.classList.remove('auth-modal-open');
    }
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeAuthModal();
    }
  };

  // Submit standard Email/Password Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError(t('auth.fillFields'));
      setLoading(false);
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      closeAuthModal();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  // Submit standard Email/Password/Name Signup Request
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth.fillFields'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMin'));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      setLoading(false);
      return;
    }

    // Verify it is a valid Gmail format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      setError('Invalid mail');
      setLoading(false);
      return;
    }

    const result = await registerRequest({ name, email, password });
    if (result.success) {
      setSuccess(t('auth.otpSent') || 'Verification code sent to your email.');
      setLoading(false);
      setAuthModalTab('otp-verify');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  // Submit OTP Verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otpCode || otpCode.length !== 6) {
      setError(t('auth.invalidOtp') || 'Please enter a valid 6-digit verification code.');
      setLoading(false);
      return;
    }

    const result = await verifyOtp({ email, otp: otpCode });
    if (result.success) {
      closeAuthModal();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await registerRequest({ name, email, password });
    if (result.success) {
      setSuccess(t('auth.otpSent') || 'Verification code resent successfully.');
      setLoading(false);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  // Submit Forgot Password request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError(t('auth.fillFields'));
      setLoading(false);
      return;
    }

    // Simulate sending a reset email
    setTimeout(() => {
      setSuccess(t('auth.resetInstructions') || 'Reset instructions sent to your email.');
      setLoading(false);
    }, 1200);
  };

  // Trigger transition to interactive Social Login Prompt
  const handleSocialClick = (provider) => {
    if (loading || connectingSocial) return;
    setError('');
    setAuthModalTab(`${provider.toLowerCase()}-prompt`);
  };

  // Helper to extract a clean display name from an email address
  const cleanNameFromEmail = (email, provider) => {
    try {
      const username = email.split('@')[0];
      const parts = username.split(/[\.\-\_+]/);
      const formattedParts = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
      const cleanName = formattedParts.join(' ');
      return cleanName ? `${cleanName} (${provider})` : `${provider} User`;
    } catch (e) {
      return `${provider} User`;
    }
  };

  // Process the social login submission with entered credentials
  const handleSocialSubmit = async (e, provider) => {
    e.preventDefault();
    if (loading || connectingSocial) return;
    setError('');
    setSuccess('');

    if (!socialEmail) {
      setError(t('auth.fillFields'));
      return;
    }

    // Basic email regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(socialEmail)) {
      setError(t('auth.invalidEmail') || 'Please enter a valid email address.');
      return;
    }

    const tokenToSend = socialPassword.trim() || `mock-token-${socialEmail.trim()}`;

    setConnectingSocial(provider);

    setTimeout(async () => {
      try {
        const result = await socialLogin(provider, tokenToSend);

        if (result.success) {
          closeAuthModal();
        } else {
          setError(result.error || `${provider} authentication failed.`);
        }
      } catch (err) {
        setError(`Failed to authenticate with ${provider}.`);
      } finally {
        setConnectingSocial(null);
      }
    }, 1800); // Realistic handshake delay
  };

  // Framer Motion Variants for Sliding Form Transition
  const formVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      filter: 'blur(4px)',
    }),
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -50 : 50,
      filter: 'blur(4px)',
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
    })
  };

  // Helper to determine animation direction when transitioning tabs
  // login -> signup: slide left (1)
  // signup -> login: slide right (-1)
  // login/signup -> forgot: slide left (1)
  // forgot -> login: slide right (-1)
  const getSlideDirection = () => {
    if (authModalTab === 'forgot') return 1;
    if (authModalTab === 'signup') return 1;
    if (authModalTab && authModalTab.endsWith('-prompt')) return 1;
    return -1; // default back to login
  };

  const direction = getSlideDirection();

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <div className={styles.modalWrapper}>

        {/* Floating Background Glow Orbs */}
        <div className={`${styles.orb} ${styles.orbTeal}`} />
        <div className={`${styles.orb} ${styles.orbGold}`} />

        {/* Centered Modal Card */}
        <motion.div
          ref={modalRef}
          className={styles.card}
          layout
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        >
          {/* Tech Scanlines */}
          <div className={styles.techGrid} />
          <div className={styles.techLine} />

          {/* Close Button */}
          <button className={styles.closeBtn} onClick={closeAuthModal} aria-label="Close modal">
            <FaTimes />
          </button>

          {/* Logo Brand */}
          <div className={styles.brandContainer}>
            <div className={styles.brand}>
              <span className={styles.logoRed}>NEWSY</span>
              <span className={styles.logoBlue}>TECH</span>
            </div>
          </div>

          {/* Social Auth Overlay Loader */}
          <AnimatePresence>
            {connectingSocial && (
              <motion.div
                className={styles.socialOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.spinner} style={{ width: 32, height: 32, borderWidth: 3 }} />
                <p className={styles.socialOverlayTitle}>
                  {t('auth.connectingSocial')
                    ? t('auth.connectingSocial').replace('{provider}', connectingSocial)
                    : `Connecting to ${connectingSocial}...`}
                </p>
                <div className={styles.socialOverlayProgress}>
                  <div className={styles.socialOverlayProgressBar} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error and Success Banners */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div
                className={styles.errorAlert}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FaExclamationCircle style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                className={styles.errorAlert}
                style={{ background: 'rgba(27, 160, 152, 0.12)', border: '1px solid rgba(27, 160, 152, 0.25)', color: '#24c9b8' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FaCheckCircle style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content Tabs */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait" initial={false} custom={direction}>

              {/* ── TAB: LOGIN ── */}
              {authModalTab === 'login' && (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.header}>
                    <h2 className={styles.title}>{t('auth.signInTitle')}</h2>
                    <p className={styles.subtitle}>
                      {t('auth.noAccount') || "Don't have an account?"}
                      <span className={styles.toggleLink} onClick={() => setAuthModalTab('signup')}>
                        {t('auth.createOne') || 'Create one free'}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className={styles.form} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.email')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
                          required
                        />
                        <span className={styles.fieldIcon}><FaEnvelope /></span>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.password')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.passwordPlaceholder') || 'Enter password'}
                          required
                        />
                        <span className={styles.fieldIcon}><FaLock /></span>
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.formOptions}>
                      <span className={styles.forgotLink} onClick={() => setAuthModalTab('forgot')}>
                        {t('auth.forgotPassword') || 'Forgot password?'}
                      </span>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading && <span className={styles.spinner} />}
                      {loading ? t('auth.signingIn') || 'Signing In...' : t('auth.signIn') || 'Sign In'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className={styles.divider}>
                    <div className={styles.dividerLine} />
                    <span className={styles.dividerText}>{t('auth.orContinueWith') || 'Or continue with'}</span>
                    <div className={styles.dividerLine} />
                  </div>

                  {/* Social Buttons */}
                  <div className={styles.socialGrid}>
                    <button type="button" className={styles.socialBtn} onClick={() => handleSocialClick('Google')}>
                      <FaGoogle className={`${styles.socialBtnIcon} ${styles.googleIcon}`} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── TAB: SIGNUP ── */}
              {authModalTab === 'signup' && (
                <motion.div
                  key="signup"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.header}>
                    <h2 className={styles.title}>{t('auth.createAccount')}</h2>
                    <p className={styles.subtitle}>
                      {t('auth.haveAccount') || 'Already have an account?'}
                      <span className={styles.toggleLink} onClick={() => setAuthModalTab('login')}>
                        {t('auth.signInHere') || 'Sign in here'}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className={styles.form} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.fullName')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.namePlaceholder') || 'Your Name'}
                          autoComplete="off"
                          required
                        />
                        <span className={styles.fieldIcon}><FaUser /></span>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.email')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
                          autoComplete="off"
                          required
                        />
                        <span className={styles.fieldIcon}><FaEnvelope /></span>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.password')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.passwordMinPlaceholder') || 'Min. 6 characters'}
                          autoComplete="new-password"
                          required
                        />
                        <span className={styles.fieldIcon}><FaLock /></span>
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className={`${styles.hintText} ${password.length >= 6 ? styles.hintTextSuccess : ''}`}>
                          {password.length < 6
                            ? `${6 - password.length} ${t('auth.charactersNeeded') || 'more characters needed'}`
                            : t('auth.passwordGood') || '✓ Password length is good'}
                        </div>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.confirmPassword')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.confirmPasswordPlaceholder') || 'Re-enter your password'}
                          autoComplete="new-password"
                          required
                        />
                        <span className={styles.fieldIcon}><FaLock /></span>
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && password !== confirmPassword && (
                        <div className={styles.hintText} style={{ color: '#f87171' }}>
                          {t('auth.passwordsDontMatch') || "Passwords don't match"}
                        </div>
                      )}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading && <span className={styles.spinner} />}
                      {loading ? t('auth.creating') || 'Creating...' : t('auth.signupBtn') || 'Create Account'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className={styles.divider}>
                    <div className={styles.dividerLine} />
                    <span className={styles.dividerText}>{t('auth.orContinueWith') || 'Or continue with'}</span>
                    <div className={styles.dividerLine} />
                  </div>

                  {/* Social Buttons */}
                  <div className={styles.socialGrid}>
                    <button type="button" className={styles.socialBtn} onClick={() => handleSocialClick('Google')}>
                      <FaGoogle className={`${styles.socialBtnIcon} ${styles.googleIcon}`} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── TAB: OTP VERIFICATION ── */}
              {authModalTab === 'otp-verify' && (
                <motion.div
                  key="otp-verify"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.header}>
                    <h2 className={styles.title}>{t('auth.verifyEmail') || 'Verify Your Email'}</h2>
                    <p className={styles.subtitle}>
                      {t('auth.otpSentTo') || 'We have sent a verification code to:'} <br />
                      <strong style={{ color: '#1ba098' }}>{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className={styles.form} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.verificationCode') || 'Verification Code'}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className={styles.input}
                          placeholder="123456"
                          style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                          required
                        />
                        <span className={styles.fieldIcon}><FaCheckCircle /></span>
                      </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading && <span className={styles.spinner} />}
                      {loading ? t('common.loading') || 'Verifying...' : t('auth.verifyBtn') || 'Verify & Create Account'}
                    </button>

                    <div className={styles.formOptions} style={{ justifyContent: 'center', marginTop: 16, flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <span className={styles.toggleLink} onClick={handleResendOtp}>
                        {t('auth.resendOtp') || 'Resend Verification Code'}
                      </span>
                      <span className={styles.toggleLink} onClick={() => setAuthModalTab('signup')} style={{ opacity: 0.6, fontSize: '0.85rem' }}>
                        {t('auth.backToSignup') || 'Back to Sign Up'}
                      </span>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── TAB: FORGOT PASSWORD ── */}
              {authModalTab === 'forgot' && (
                <motion.div
                  key="forgot"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.header}>
                    <h2 className={styles.title}>{t('auth.forgotPassword') || 'Forgot Password?'}</h2>
                    <p className={styles.subtitle}>
                      {t('auth.resetInstructions') || 'Enter your email to receive password reset instructions.'}
                    </p>
                  </div>

                  <form onSubmit={handleForgotSubmit} className={styles.form} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.email')}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={styles.input}
                          placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
                          required
                        />
                        <span className={styles.fieldIcon}><FaEnvelope /></span>
                      </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading && <span className={styles.spinner} />}
                      {loading ? t('common.loading') || 'Loading...' : t('auth.sendResetLink') || 'Send Reset Link'}
                    </button>

                    <div className={styles.formOptions} style={{ justifyContent: 'center', marginTop: 12 }}>
                      <span className={styles.toggleLink} onClick={() => setAuthModalTab('login')}>
                        {t('auth.backToLogin') || 'Back to Sign In'}
                      </span>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── TAB: GOOGLE SIGN-IN PROMPT ── */}
              {authModalTab === 'google-prompt' && (
                <motion.div
                  key="google-prompt"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.header}>
                    <FaGoogle className={`${styles.socialBrandIcon} ${styles.googleIcon}`} />
                    <h2 className={styles.title}>{t('auth.googlePromptTitle') || 'Sign in with Google'}</h2>
                    <p className={styles.subtitle}>
                      {t('auth.googlePromptSubtitle') || 'Connect your Google account to NEWSY TECH'}
                    </p>
                  </div>

                  <form onSubmit={(e) => handleSocialSubmit(e, 'Google')} className={styles.form} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.googleEmailLabel') || 'Google Email Address'}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="email"
                          value={socialEmail}
                          onChange={(e) => setSocialEmail(e.target.value)}
                          className={styles.input}
                          placeholder="Name"
                          required
                        />
                        <span className={styles.fieldIcon}><FaEnvelope /></span>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.oauthToken') || 'OAuth Access Token (Leave empty for mock)'}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="password"
                          value={socialPassword}
                          onChange={(e) => setSocialPassword(e.target.value)}
                          className={styles.input}
                          placeholder="Paste OAuth token (optional)"
                        />
                        <span className={styles.fieldIcon}><FaLock /></span>
                      </div>
                    </div>

                    <button type="submit" className={`${styles.submitBtn} ${styles.googleSubmitBtn}`} disabled={loading}>
                      {loading && <span className={styles.spinner} />}
                      {loading ? t('common.loading') || 'Loading...' : t('auth.next') || 'Next'}
                    </button>

                    <div className={styles.formOptions} style={{ justifyContent: 'center', marginTop: 12 }}>
                      <span className={styles.toggleLink} onClick={() => setAuthModalTab('login')}>
                        {t('common.cancel') || 'Cancel'}
                      </span>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── TAB: GITHUB SIGN-IN PROMPT ── */}
              {authModalTab === 'github-prompt' && (
                <motion.div
                  key="github-prompt"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.header}>
                    <FaGithub className={`${styles.socialBrandIcon} ${styles.githubIcon}`} />
                    <h2 className={styles.title}>{t('auth.githubPromptTitle') || 'Sign in to GitHub'}</h2>
                    <p className={styles.subtitle}>
                      {t('auth.githubPromptSubtitle') || 'Authorize NEWSY TECH to use your account'}
                    </p>
                  </div>

                  <form onSubmit={(e) => handleSocialSubmit(e, 'GitHub')} className={styles.form} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.githubEmailLabel') || 'GitHub Email Address'}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="email"
                          value={socialEmail}
                          onChange={(e) => setSocialEmail(e.target.value)}
                          className={styles.input}
                          placeholder="username@github.com"
                          required
                        />
                        <span className={styles.fieldIcon}><FaEnvelope /></span>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>{t('auth.oauthToken') || 'OAuth Access Token (Leave empty for mock)'}</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="password"
                          value={socialPassword}
                          onChange={(e) => setSocialPassword(e.target.value)}
                          className={styles.input}
                          placeholder="Paste OAuth token (optional)"
                        />
                        <span className={styles.fieldIcon}><FaLock /></span>
                      </div>
                    </div>

                    <button type="submit" className={`${styles.submitBtn} ${styles.githubSubmitBtn}`} disabled={loading}>
                      {loading && <span className={styles.spinner} />}
                      {loading ? t('common.loading') || 'Loading...' : t('auth.signIn') || 'Sign In'}
                    </button>

                    <div className={styles.formOptions} style={{ justifyContent: 'center', marginTop: 12 }}>
                      <span className={styles.toggleLink} onClick={() => setAuthModalTab('login')}>
                        {t('common.cancel') || 'Cancel'}
                      </span>
                    </div>
                  </form>
                </motion.div>
              )}



            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}
