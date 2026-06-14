import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

// Marker stored in sessionStorage for the lifetime of the browser tab/window.
// sessionStorage is cleared automatically when the tab is closed, so its
// presence reliably distinguishes "page reload / in-app navigation" from
// "fresh app launch (new tab / window / browser restart)".
const SESSION_FLAG = 'newsytech.session.started';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTabState] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [authModalCallback, setAuthModalCallback] = useState(null);

  const openAuthModal = useCallback((tab = 'login', callback = null) => {
    setAuthModalTabState(tab);
    setAuthModalCallback(() => callback);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalCallback(null);
  }, []);

  const setAuthModalTab = useCallback((tab) => {
    setAuthModalTabState(tab);
  }, []);

  useEffect(() => {
    // Decide between two cases:
    //   1. Fresh launch (new tab / window / browser session) → wipe any
    //      previously persisted token/user so the website never auto-logs
    //      in with the last used account.
    //   2. Same-session reload or full-page navigation → rehydrate the
    //      logged-in user from localStorage so the user is NOT logged out
    //      just because a page does a full reload.
    try {
      const isSameSession =
        typeof window !== 'undefined' &&
        window.sessionStorage.getItem(SESSION_FLAG) === '1';

      if (isSameSession) {
        const existing = authAPI.getCurrentUser();
        setUser(existing || null);
      } else {
        authAPI.logout();
        setUser(null);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(SESSION_FLAG, '1');
        }
      }
    } catch (error) {
      console.error('Auth init error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const userData = await authAPI.login(credentials);
      setUser(userData);
      if (authModalCallback) {
        authModalCallback(userData);
      }
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }, [authModalCallback]);

  const register = useCallback(async (userData) => {
    try {
      const newUser = await authAPI.register(userData);
      setUser(newUser);
      if (authModalCallback) {
        authModalCallback(newUser);
      }
      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }, [authModalCallback]);

  const socialLogin = useCallback(async (provider, accessToken) => {
    try {
      const userData = await authAPI.socialLogin(provider, accessToken);
      setUser(userData);
      if (authModalCallback) {
        authModalCallback(userData);
      }
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Social login failed',
      };
    }
  }, [authModalCallback]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Update failed',
      };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshProfile = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(freshProfile));
      setUser(freshProfile);
      return { success: true, user: freshProfile };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to refresh user',
      };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    socialLogin,
    isAuthenticated: !!user,
    isAuthModalOpen,
    authModalTab,
    authModalCallback,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab,
  }), [
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    socialLogin,
    isAuthModalOpen,
    authModalTab,
    authModalCallback,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
