import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AccountDrawer.css';

export default function AccountDrawer({ isOpen, onClose }) {
  const { user, isAuthenticated, login, register, logout, authError } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLocalError(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password) return;

    try {
      setIsSubmitting(true);
      setLocalError(null);
      await login({ email: loginForm.email.trim(), password: loginForm.password });
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      const detailedMsg = err.data?.errors?.length
        ? err.data.errors.map((e) => e.message).join('. ')
        : (err.data?.message || err.message || 'Login failed. Please check your credentials.');
      setLocalError(detailedMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.email.trim() || !registerForm.password || !registerForm.name.trim()) return;

    try {
      setIsSubmitting(true);
      setLocalError(null);
      await register({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        phone: registerForm.phone.trim() || undefined,
      });
      setRegisterForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      const detailedMsg = err.data?.errors?.length
        ? err.data.errors.map((e) => e.message).join('. ')
        : (err.data?.message || err.message || 'Registration failed. Please try again.');
      setLocalError(detailedMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSubmitting(true);
      await logout();
      setLoginForm({ email: '', password: '' });
      setRegisterForm({ name: '', email: '', phone: '', password: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayEmail = user?.email || '';
  const displayName = user?.name || displayEmail.split('@')[0] || 'User';

  return (
    <div className="account-overlay" onClick={onClose} role="presentation">
      <aside
        className="account-drawer"
        role="dialog"
        aria-label="User Account"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="account-header">
          <div className="account-header-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2>My Account</h2>
          </div>
          <button
            type="button"
            className="account-close-btn"
            onClick={onClose}
            aria-label="Close account panel"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="account-body">
          {isAuthenticated && user ? (
            <div className="account-profile-view">
              <div className="account-avatar-circle">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <h3 className="account-user-name">Welcome, {displayName}</h3>
              <p className="account-user-email">{displayEmail}</p>

              <div className="account-status-banner">
                <span className="account-status-dot" style={{ backgroundColor: '#10b981' }} />
                <span>
                  Connected to Live Backend {user.role === 'admin' ? '(Admin Mode)' : '(Customer)'}
                </span>
              </div>

              <div className="account-menu-list">
                <div className="account-menu-item">
                  <span className="account-menu-icon">📦</span>
                  <div className="account-menu-text">
                    <strong>My Orders</strong>
                    <span>Track and review your purchases</span>
                  </div>
                </div>

                <div className="account-menu-item">
                  <span className="account-menu-icon">📍</span>
                  <div className="account-menu-text">
                    <strong>Saved Addresses</strong>
                    <span>
                      {user.addresses && user.addresses.length > 0
                        ? `${user.addresses.length} saved address${user.addresses.length > 1 ? 'es' : ''}`
                        : 'No saved address yet'}
                    </span>
                  </div>
                </div>

                <div className="account-menu-item">
                  <span className="account-menu-icon">❤️</span>
                  <div className="account-menu-text">
                    <strong>Wishlist &amp; Saved Items</strong>
                    <span>Synchronized with your account</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="account-signout-btn"
                onClick={handleSignOut}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <div className="account-auth-wrap">
              {/* Tabs */}
              <div className="account-tabs">
                <button
                  type="button"
                  className={`account-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('login');
                    setLocalError(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`account-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('register');
                    setLocalError(null);
                  }}
                >
                  Create Account
                </button>
              </div>

              {(localError || authError) && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    color: '#b91c1c',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  ⚠️ {localError || authError}
                </div>
              )}

              {/* Login Form */}
              {activeTab === 'login' ? (
                <form className="account-form" onSubmit={handleLoginSubmit}>
                  <p className="account-form-desc">
                    Sign in to track orders, manage addresses, and view your saved items.
                  </p>

                  <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                      id="login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-extra-row">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Remember me</span>
                    </label>
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">
                      Forgot Password?
                    </a>
                  </div>

                  <button type="submit" className="account-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
                  </button>

                  <div className="account-dev-notice">
                    <span>💡 Live Auth Active:</span> Uses secure dual-token httpOnly cookies.
                  </div>
                </form>
              ) : (
                <form className="account-form" onSubmit={handleRegisterSubmit}>
                  <p className="account-form-desc">
                    Join Aai Prints to enjoy seamless shopping and express checkout.
                  </p>

                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name</label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="Your full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-email">Email Address</label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-phone">Phone Number (Optional)</label>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-password">Password</label>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <button type="submit" className="account-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
