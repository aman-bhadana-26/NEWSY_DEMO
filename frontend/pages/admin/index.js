import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminAPI } from '../../utils/api';
import { FaUsers, FaUserShield, FaBan, FaClock, FaChartLine, FaUserPlus } from 'react-icons/fa';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!user?.isAdmin) {
        router.push('/');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="Admin Dashboard – NEWSYTECH">
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard – NEWSYTECH">
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchDashboardStats} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard – NEWSYTECH">
      <div className={styles.adminPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaUserShield className={styles.titleIcon} />
            Admin Dashboard
          </h1>
          <p className={styles.subtitle}>Manage users, view analytics, and monitor site activity</p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> User Management
          </button>
          <button
            className={styles.tab}
            onClick={() => router.push('/analytics')}
          >
            <FaChartLine /> Site Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className={styles.content}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #1BA098, #24c9b8)' }}>
                  <FaUsers />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Users</p>
                  <p className={styles.statValue}>{stats.totalUsers}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                  <FaUserPlus />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Active Users</p>
                  <p className={styles.statValue}>{stats.activeUsers}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FF9800, #FFC107)' }}>
                  <FaClock />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>New This Week</p>
                  <p className={styles.statValue}>{stats.newUsersThisWeek}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #F44336, #E91E63)' }}>
                  <FaBan />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Suspended/Banned</p>
                  <p className={styles.statValue}>{stats.suspendedUsers + stats.bannedUsers}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #9C27B0, #E91E63)' }}>
                  <FaUserShield />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Admins</p>
                  <p className={styles.statValue}>{stats.adminCount}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #2196F3, #03A9F4)' }}>
                  <FaChartLine />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>New This Month</p>
                  <p className={styles.statValue}>{stats.newUsersThisMonth}</p>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className={styles.recentUsers}>
              <h2 className={styles.sectionTitle}>Recent Users</h2>
              <div className={styles.usersList}>
                {stats.recentUsers.map((recentUser) => (
                  <div key={recentUser._id} className={styles.userItem}>
                    <div className={styles.userAvatar}>
                      {recentUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userDetails}>
                      <p className={styles.userName}>{recentUser.name}</p>
                      <p className={styles.userEmail}>{recentUser.email}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[`status${recentUser.status}`]}`}>
                      {recentUser.status}
                    </span>
                    <p className={styles.userDate}>
                      {new Date(recentUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className={styles.content}>
            <div className={styles.userManagement}>
              <p className={styles.infoText}>
                User management interface will be loaded here. Click on individual users to manage their accounts.
              </p>
              <button
                className={styles.primaryButton}
                onClick={() => router.push('/admin/users')}
              >
                <FaUsers /> Go to User Management
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
