import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminAPI } from '../../utils/api';
import { FaUsers, FaSearch, FaTrash, FaUserShield, FaBan, FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../../styles/Admin.module.css';

export default function UserManagement() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      fetchUsers();
    }
  }, [user, currentPage, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers(currentPage, 20, searchQuery, statusFilter);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load users' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      return;
    }

    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      setMessage({ type: 'success', text: 'User status updated successfully' });
      fetchUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update user status' 
      });
    }
  };

  const handleToggleAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to toggle admin status for this user?')) {
      return;
    }

    try {
      await adminAPI.toggleAdminStatus(userId);
      setMessage({ type: 'success', text: 'Admin status updated successfully' });
      fetchUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update admin status' 
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setMessage({ type: 'success', text: 'User deleted successfully' });
      fetchUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete user' 
      });
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Please select users first' });
      return;
    }

    const actionText = action === 'delete' 
      ? 'delete these users' 
      : `change status to ${value} for these users`;

    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      await adminAPI.bulkUpdateUsers(selectedUsers, action, value);
      setMessage({ type: 'success', text: 'Bulk action completed successfully' });
      fetchUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to perform bulk action' 
      });
    }
  };

  if (authLoading || (loading && users.length === 0)) {
    return (
      <Layout title="User Management – NEWSYTECH Admin">
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <Layout title="User Management – NEWSYTECH Admin">
      <div className={styles.adminPage}>
        <div className={styles.header}>
          <button onClick={() => router.push('/admin')} className={styles.backButton}>
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>
            <FaUsers className={styles.titleIcon} />
            User Management
          </h1>
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className={styles.closeMessage}>
              ×
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className={styles.controls}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <FaSearch /> Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className={styles.bulkActions}>
            <span className={styles.bulkCount}>{selectedUsers.length} selected</span>
            <button 
              onClick={() => handleBulkAction('updateStatus', 'active')} 
              className={styles.bulkButton}
            >
              <FaCheck /> Set Active
            </button>
            <button 
              onClick={() => handleBulkAction('updateStatus', 'suspended')} 
              className={styles.bulkButton}
            >
              <FaBan /> Suspend
            </button>
            <button 
              onClick={() => handleBulkAction('delete')} 
              className={`${styles.bulkButton} ${styles.bulkButtonDanger}`}
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className={styles.tableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(userItem._id)}
                      onChange={() => toggleUserSelection(userItem._id)}
                    />
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatarSmall}>
                        {userItem.name?.charAt(0).toUpperCase()}
                      </div>
                      {userItem.name}
                    </div>
                  </td>
                  <td>{userItem.email}</td>
                  <td>
                    <select
                      value={userItem.status}
                      onChange={(e) => handleStatusChange(userItem._id, e.target.value)}
                      className={`${styles.statusSelect} ${styles[`status${userItem.status}`]}`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td>
                    <span className={userItem.isAdmin ? styles.adminBadge : styles.userBadge}>
                      {userItem.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleToggleAdmin(userItem._id)}
                        className={styles.actionButton}
                        title="Toggle Admin"
                      >
                        <FaUserShield />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem._id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
