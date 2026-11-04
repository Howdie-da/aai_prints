import { useState, useEffect } from 'react';
import './AccountDrawer.css';

export default function AccountDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
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
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.email.trim()) {
      setUserEmail(loginForm.email);
      setIsDemoLoggedIn(true);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerForm.email.trim()) {
      setUserEmail(registerForm.email);
      setIsDemoLoggedIn(true);
    }
  };

  const handleSignOut = () => {
    setIsDemoLoggedIn(false);
    setUserEmail('');
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', phone: '', password: '' });
  };

  if (!isOpen) return null;

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
          {isDemoLoggedIn ? (
            <div className="account-profile-view">
              <div className="account-avatar-circle">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="account-user-name">Welcome, {userEmail.split('@')[0]}</h3>
              <p className="account-user-email">{userEmail}</p>

              <div className="account-status-banner">
                <span className="account-status-dot" />
                <span>Frontend Profile Mode (Ready for Backend Auth API)</span>
              </div>

              <div className="account-menu-list">
                <div className="account-menu-item">
                  <span className="account-menu-icon">📦</span>
                  <div className="account-menu-text">
                    <strong>My Orders</strong>
                    <span>No orders placed yet</span>
                  </div>
                </div>

                <div className="account-menu-item">
                  <span className="account-menu-icon">📍</span>
                  <div className="account-menu-text">
                    <strong>Saved Addresses</strong>
                    <span>Manage shipping &amp; billing addresses</span>
                  </div>
                </div>

                <div className="account-menu-item">
                  <span className="account-menu-icon">❤️</span>
                  <div className="account-menu-text">
                    <strong>Wishlist &amp; Saved Items</strong>
                    <span>Syncs with your browser preferences</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="account-signout-btn"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="account-auth-wrap">
              {/* Tabs */}
              <div className="account-tabs">
                <button
                  type="button"
                  className={`account-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`account-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Create Account
                </button>
              </div>

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

                  <button type="submit" className="account-submit-btn">
                    SIGN IN
                  </button>

                  <div className="account-dev-notice">
                    <span>💡 Note for Developer:</span> Frontend authentication UI is wired and ready for API endpoints.
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
                    />
                  </div>

                  <button type="submit" className="account-submit-btn">
                    CREATE ACCOUNT
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

