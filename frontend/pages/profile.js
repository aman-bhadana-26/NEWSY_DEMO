import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        newPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const updateData = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        setLoading(false);
        return;
      }
      updateData.password = formData.newPassword;
    }

    const result = await updateUser(updateData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData({ ...formData, password: '', newPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <Layout title="Profile - NEWSY TECH">
        <LoadingSpinner message="Loading profile..." />
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout title="Profile - NEWSY TECH">
      <div className={styles.profileContainer}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className={styles.profileTitle}>{user.name}</h1>
            <p className={styles.profileEmail}>{user.email}</p>
          </div>

          {message.text && (
            <div className={`${styles.alert} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.profileContent}>
            {!isEditing ? (
              <div className={styles.profileInfo}>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Full Name</label>
                  <p className={styles.infoValue}>{user.name}</p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Email Address</label>
                  <p className={styles.infoValue}>{user.email}</p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Member Since</label>
                  <p className={styles.infoValue}>
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '24px' }}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.profileForm}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div className={styles.formButtons}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        password: '',
                        newPassword: '',
                      });
                      setMessage({ type: '', text: '' });
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
