import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Particles from '../components/Particles';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', newPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', email: user.email || '', newPassword: '' });
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setLoading(false);
      return;
    }

    const updateData = { name: formData.name, email: formData.email };
    if (formData.newPassword) updateData.password = formData.newPassword;

    const result = await updateUser(updateData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData({ name: result.user?.name || formData.name, email: result.user?.email || formData.email, newPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ name: user.name, email: user.email, newPassword: '' });
    setMessage({ type: '', text: '' });
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'March 7, 2026';

  const joinMonth = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Mar 2026';

  if (authLoading) {
    return (
      <Layout title="Profile – NEWSYTECH">
        <div className={styles.stateWrap}><LoadingSpinner /></div>
      </Layout>
    );
  }

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <Layout title="Profile – NEWSYTECH">
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
          <aside className={styles.leftPanel}>

            {/* Avatar card */}
            <div className={styles.avatarCard}>
              <div className={styles.avatarCardBg} />
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{initial}</div>
                <div className={styles.avatarRing} />
              </div>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userHandle}>@{user.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
              <p className={styles.memberSince}>Member since {joinMonth}</p>

              <div className={styles.badges}>
                <span className={styles.badge}>◈ MEMBER</span>
                {user.createdAt && <span className={styles.badgeGold}>✦ VERIFIED</span>}
              </div>

            </div>

            {/* Account Info */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>// ACCOUNT INFO</span>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                  </span>
                  <div>
                    <p className={styles.infoFieldLabel}>FULL NAME</p>
                    <p className={styles.infoFieldValue}>{user.name}</p>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  </span>
                  <div>
                    <p className={styles.infoFieldLabel}>EMAIL ADDRESS</p>
                    <p className={styles.infoFieldValue}>{user.email}</p>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                  </span>
                  <div>
                    <p className={styles.infoFieldLabel}>MEMBER SINCE</p>
                    <p className={styles.infoFieldValue}>{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

          </aside>

          {/* ══ RIGHT PANEL ══ */}
          <main className={styles.rightPanel}>

            <div className={styles.rightCard}>
              <div className={styles.rightCardHeader}>
                <div className={styles.rightCardTitle}>
                  <span className={styles.rightCardTitleAccent}>// </span>
                  {isEditing ? 'EDIT PROFILE' : 'PROFILE SETTINGS'}
                </div>
                {message.text && (
                  <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.type === 'success' ? '✓' : '✕'} {message.text}
                  </div>
                )}
              </div>

              {!isEditing ? (
                /* ── View mode ── */
                <div className={styles.viewMode}>
                  <p className={styles.viewIntro}>
                    Manage your NewsyTech account. Update your name, email or set a new password.
                  </p>

                  <div className={styles.fieldGrid}>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldBlockLabel}>FULL NAME</span>
                      <p className={styles.fieldBlockValue}>{user.name}</p>
                    </div>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldBlockLabel}>EMAIL</span>
                      <p className={styles.fieldBlockValue}>{user.email}</p>
                    </div>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldBlockLabel}>PASSWORD</span>
                      <p className={styles.fieldBlockValue}>••••••••</p>
                    </div>
                    <div className={styles.fieldBlock}>
                      <span className={styles.fieldBlockLabel}>ACCOUNT STATUS</span>
                      <p className={`${styles.fieldBlockValue} ${styles.statusActive}`}>● Active</p>
                    </div>
                  </div>

                  <button className={styles.primaryBtn} onClick={() => setIsEditing(true)}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    Edit Profile
                  </button>
                </div>
              ) : (
                /* ── Edit mode ── */
                <form className={styles.editForm} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="name">FULL NAME</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={styles.formInput}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      autoComplete="off"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="email">EMAIL ADDRESS</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.formInput}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      autoComplete="off"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="newPassword">
                      NEW PASSWORD <span className={styles.optionalTag}>(optional)</span>
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className={styles.formInput}
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                      autoComplete="new-password"
                    />
                    <p className={styles.inputHint}>Minimum 6 characters if changing.</p>
                  </div>

                  <div className={styles.formBtns}>
                    <button type="submit" className={styles.primaryBtn} disabled={loading}>
                      {loading ? (
                        <><span className={styles.btnSpinner} /> Saving…</>
                      ) : (
                        <>
                          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button type="button" className={styles.ghostBtn} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick nav tiles */}
            <div className={styles.quickLinks}>
              <div className={styles.quickLink} onClick={() => router.push('/my-news')}>
                <span className={styles.quickLinkIcon}>◈</span>
                <div>
                  <p className={styles.quickLinkTitle}>My News</p>
                  <p className={styles.quickLinkSub}>Your personalised feed</p>
                </div>
                <span className={styles.quickLinkArrow}>→</span>
              </div>
              <div className={styles.quickLink} onClick={() => router.push('/my-news?tab=saved')}>
                <span className={styles.quickLinkIcon}>◇</span>
                <div>
                  <p className={styles.quickLinkTitle}>Saved Articles</p>
                  <p className={styles.quickLinkSub}>Read them later</p>
                </div>
                <span className={styles.quickLinkArrow}>→</span>
              </div>
            </div>

          </main>
        </div>
      </div>
    </Layout>
  );
}

