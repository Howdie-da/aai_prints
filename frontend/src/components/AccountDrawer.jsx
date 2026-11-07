import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  X,
  LogOut,
  Package,
  MapPin,
  Heart,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Crown,
  ShoppingBag,
  ChevronRight,
  PlusCircle,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './AccountDrawer.css';

export default function AccountDrawer({ isOpen, onClose, onNavigate }) {
  const { user, isAuthenticated, login, register, logout, authError } = useAuth();
  const { wishlistCount = 0, cartCount = 0, setIsWishlistOpen } = useWishlist();
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

  const displayEmail = user?.email || '';
  const displayName = user?.name || displayEmail.split('@')[0] || 'User';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="account-overlay"
          className="account-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.aside
            key="account-drawer"
            className="account-drawer"
            role="dialog"
            aria-label="User Account"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="account-header">
              <div className="account-header-title">
                <User size={20} strokeWidth={2} style={{ color: 'var(--teal)' }} />
                <h2>My Account</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="account-close-btn"
                onClick={onClose}
                aria-label="Close account panel"
                title="Close (Esc)"
              >
                <X size={18} strokeWidth={2} />
              </motion.button>
            </div>

        {/* ── Body ── */}
        <div className="account-body">
          {isAuthenticated && user ? (
            <div className="account-profile-view">
              {/* 1. Hero Identity Card */}
              <div className="account-hero-card">
                <div className="account-hero-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="account-hero-info">
                  <span className="account-patron-title">SACRED PATRON</span>
                  <h3 className="account-user-name">{displayName}</h3>
                  <p className="account-user-email">{displayEmail}</p>
                  <div className="account-badge-wrapper">
                    {user.role === 'admin' ? (
                      <span className="account-badge-pill admin">
                        <Crown size={12} />
                        <span>Sanctuary Administrator</span>
                      </span>
                    ) : (
                      <span className="account-badge-pill patron">
                        <Sparkles size={12} />
                        <span>Verified Sanctuary Patron</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Patron Quick Stats Row */}
              <div className="account-stats-row">
                <button
                  type="button"
                  className="account-stat-card"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('wishlist');
                    else if (setIsWishlistOpen) setIsWishlistOpen(true);
                  }}
                  title="View Saved Wishlist"
                >
                  <div className="account-stat-icon-wrap" style={{ color: '#e53935' }}>
                    <Heart size={15} fill="#e53935" />
                  </div>
                  <div className="account-stat-content">
                    <span className="account-stat-num">{wishlistCount || 0}</span>
                    <span className="account-stat-label">Saved</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="account-stat-card"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('cart');
                  }}
                  title="View Shopping Bag"
                >
                  <div className="account-stat-icon-wrap" style={{ color: 'var(--teal)' }}>
                    <ShoppingBag size={15} />
                  </div>
                  <div className="account-stat-content">
                    <span className="account-stat-num">{cartCount || 0}</span>
                    <span className="account-stat-label">In Bag</span>
                  </div>
                </button>

                <div className="account-stat-card account-stat-tier">
                  <div className="account-stat-icon-wrap" style={{ color: 'var(--gold, #c59b27)' }}>
                    <Sparkles size={15} />
                  </div>
                  <div className="account-stat-content">
                    <span className="account-stat-num" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
                      {user.role === 'admin' ? 'ADMIN' : 'GOLD'}
                    </span>
                    <span className="account-stat-label">Privilege</span>
                  </div>
                </div>
              </div>

              {/* 3. Admin Direct Access Banner (If Admin) */}
              {user.role === 'admin' && (
                <div
                  className="account-admin-card"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('admin-add-product');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                      if (onNavigate) onNavigate('admin-add-product');
                    }
                  }}
                >
                  <div className="account-admin-card-icon">
                    <PlusCircle size={22} />
                  </div>
                  <div className="account-admin-card-text">
                    <div className="account-admin-card-title">
                      <strong>Add Product</strong>
                      <span className="admin-chip">ADMIN ACCESS</span>
                    </div>
                    <p>Create &amp; publish new products with instant Cloudinary image upload</p>
                  </div>
                  <ChevronRight size={18} className="account-admin-arrow" />
                </div>
              )}

              {/* 4. Navigation Menu List */}
              <div className="account-nav-list">
                <span className="account-nav-section-title">PATRON SERVICES &amp; PRIVILEGES</span>

                <div className="account-nav-item">
                  <div className="account-nav-item-icon">
                    <Package size={18} />
                  </div>
                  <div className="account-nav-item-content">
                    <strong>My Orders</strong>
                    <span>Track recent sacred art shipments &amp; invoices</span>
                  </div>
                  <ChevronRight size={16} className="account-nav-chevron" />
                </div>

                <div
                  className="account-nav-item"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('wishlist');
                    else if (setIsWishlistOpen) setIsWishlistOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                      if (onNavigate) onNavigate('wishlist');
                      else if (setIsWishlistOpen) setIsWishlistOpen(true);
                    }
                  }}
                >
                  <div className="account-nav-item-icon" style={{ color: '#e53935', background: '#fef2f2' }}>
                    <Heart size={18} />
                  </div>
                  <div className="account-nav-item-content">
                    <strong>My Wishlist &amp; Saved Art</strong>
                    <span>
                      {wishlistCount > 0
                        ? `${wishlistCount} sacred item${wishlistCount > 1 ? 's' : ''} saved`
                        : 'Synchronized across all your devices'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="account-nav-chevron" />
                </div>

                <div
                  className="account-nav-item"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('cart');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                      if (onNavigate) onNavigate('cart');
                    }
                  }}
                >
                  <div className="account-nav-item-icon">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="account-nav-item-content">
                    <strong>Shopping Bag &amp; Checkout</strong>
                    <span>
                      {cartCount > 0
                        ? `${cartCount} item${cartCount > 1 ? 's' : ''} ready to order`
                        : 'Zero items in cart'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="account-nav-chevron" />
                </div>

                <div className="account-nav-item">
                  <div className="account-nav-item-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="account-nav-item-content">
                    <strong>Saved Delivery Addresses</strong>
                    <span>
                      {user.addresses && user.addresses.length > 0
                        ? `${user.addresses.length} saved address${user.addresses.length > 1 ? 'es' : ''}`
                        : 'No delivery address saved yet'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="account-nav-chevron" />
                </div>

                <div
                  className="account-nav-item"
                  onClick={() => {
                    window.location.href = 'mailto:care@aaiprints.com';
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="account-nav-item-icon">
                    <Headphones size={18} />
                  </div>
                  <div className="account-nav-item-content">
                    <strong>Concierge Assistance</strong>
                    <span>care@aaiprints.com • Mon–Sat 10AM–7PM</span>
                  </div>
                  <ChevronRight size={16} className="account-nav-chevron" />
                </div>
              </div>

              {/* 5. Security & Trust Badge */}
              <div className="account-security-notice">
                <ShieldCheck size={15} style={{ color: 'var(--teal)' }} />
                <span>Protected by 256-bit SSL encrypted patron session</span>
              </div>

              {/* 6. Sign Out Button */}
              <button
                type="button"
                className="account-signout-btn"
                onClick={handleSignOut}
                disabled={isSubmitting}
              >
                <LogOut size={16} />
                <span>{isSubmitting ? 'Signing Out...' : 'Sign Out of Account'}</span>
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{localError || authError}</span>
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

                  <div className="account-dev-notice" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--teal)' }} />
                    <span>Secure &amp; Encrypted Member Access</span>
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

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="account-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </motion.button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  )}
</AnimatePresence>
  );
}
