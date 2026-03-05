import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Auth.module.css';

export default function Signup() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up – NEWSYTECH">
      <div className={styles.authWrapper}>
        {/* Background dot grid */}
        <div className={styles.authBg} />

        {/* Floating animated dots */}
        <div className={styles.dotsContainer}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={styles.dot} />
          ))}
        </div>

        {/* ── Centered Card ── */}
        <div className={styles.authCard}>
          <div className={styles.authCardInner}>

            {/* Brand logo */}
            <div className={styles.authBrand}>
              <div className={styles.authBrandIcon}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                </svg>
              </div>
              <span className={styles.authBrandName}>NEWSYTECH</span>
            </div>

            {/* Header */}
            <div className={styles.formHeader}>
              <div className={styles.formEyebrow}>
                <span className={styles.formEyebrowLine} />
                <span className={styles.formEyebrowText}>Get Started</span>
                <span className={styles.formEyebrowLine} />
              </div>
              <h1 className={styles.formTitle}>Create your account</h1>
              <p className={styles.formSubtitle}>
                Already have an account?{' '}
                <Link href="/login" className={styles.formFooterLink}>
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && <div className={styles.errorAlert}>{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.authForm} noValidate>

              {/* Full Name */}
              <div className={styles.fieldGroup}>
                <label htmlFor="name" className={styles.fieldLabel}>Full Name</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={styles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.fieldInput}
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.fieldLabel}>Email Address</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={styles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.fieldInput}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <label htmlFor="password" className={styles.fieldLabel}>Password</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={styles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.fieldInput}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {formData.password.length > 0 && (
                  <p className={styles.passwordHint}>
                    {formData.password.length < 6
                      ? `${6 - formData.password.length} more character${6 - formData.password.length > 1 ? 's' : ''} needed`
                      : '✓ Password length is good'}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.fieldGroup}>
                <label htmlFor="confirmPassword" className={styles.fieldLabel}>Confirm Password</label>
                <div className={styles.fieldInputWrapper}>
                  <span className={styles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.fieldInput}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className={styles.passwordHint} style={{ color: '#ff7b89' }}>
                    Passwords don&apos;t match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading && <span className={styles.btnSpinner} />}
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            <div className={styles.formFooter}>
              <p className={styles.formFooterText}>
                Already have an account?
                <Link href="/login" className={styles.formFooterLink}>
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
