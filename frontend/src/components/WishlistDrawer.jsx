import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './WishlistDrawer.css';

export default function WishlistDrawer({
  onSelectProduct,
  onNavigateShop,
  onNavigateWishlist,
}) {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    addToCart,
  } = useWishlist();

  const [addedIds, setAddedIds] = useState({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        setIsWishlistOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWishlistOpen, setIsWishlistOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen]);

  const timersRef = useRef({});

  const handleAddToCart = (product) => {
    const prodId = product.id || product._id;
    if (addedIds[prodId]) {
      setIsWishlistOpen(false);
      window.location.hash = '#/cart';
      return;
    }

    addToCart(product);
    setAddedIds((prev) => ({ ...prev, [prodId]: true }));

    if (timersRef.current[prodId]) {
      clearTimeout(timersRef.current[prodId]);
    }
    timersRef.current[prodId] = setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prodId]: false }));
    }, 10000);
  };

  const handleGoToProduct = (item) => {
    setIsWishlistOpen(false);
    if (onSelectProduct) {
      onSelectProduct(item);
      return;
    }
    const el = document.getElementById(`product-${item.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('prod-card-highlight');
      setTimeout(() => el.classList.remove('prod-card-highlight'), 2200);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isWishlistOpen && (
        <motion.div
          key="wishlist-overlay"
          className="wishlist-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() => setIsWishlistOpen(false)}
          role="presentation"
        >
          <motion.aside
            key="wishlist-drawer"
            className="wishlist-drawer"
            role="dialog"
            aria-label="Wishlist items"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="wishlist-header">
              <div className="wishlist-header-title">
                <Heart size={20} fill="#e53935" stroke="#e53935" strokeWidth={1.5} />
                <h2>My Wishlist</h2>
                <motion.span
                  key={wishlist.length}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="wishlist-badge-count"
                >
                  {wishlist.length}
                </motion.span>
              </div>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="wishlist-close-btn"
                onClick={() => setIsWishlistOpen(false)}
                aria-label="Close wishlist"
                title="Close (Esc)"
              >
                <X size={18} strokeWidth={2} />
              </motion.button>
            </div>

            {/* Drawer Body */}
            <div className="wishlist-body">
              {wishlist.length === 0 ? (
                <div className="wishlist-empty">
                  <div className="wishlist-empty-icon" aria-hidden="true">
                    <Heart size={44} stroke="#b0a89b" strokeWidth={1.5} />
                  </div>
                  <h3 className="wishlist-empty-title">Your wishlist is empty</h3>
                  <p className="wishlist-empty-desc">
                    Explore our  devotional, car &amp; wall decor items and click the heart icon on any product to save your favorites here.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    className="wishlist-browse-btn"
                    onClick={() => {
                      setIsWishlistOpen(false);
                      if (onNavigateShop) {
                        onNavigateShop();
                      } else {
                        const el = document.getElementById('devotional');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Browse Collections
                  </motion.button>
                </div>
              ) : (
                <div className="wishlist-items-list">
                  <AnimatePresence initial={false}>
                    {wishlist.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                        className="wishlist-item"
                      >
                        <div
                          className="wishlist-item-img-wrap"
                          onClick={() => handleGoToProduct(item)}
                          title="Click to view product"
                          style={{ cursor: 'pointer' }}
                        >
                          {item.image && !item.image.includes('placeholder') ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="wishlist-item-img"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="wishlist-item-img-empty" />
                          )}
                        </div>

                        <div className="wishlist-item-details">
                          <h4
                            className="wishlist-item-name"
                            onClick={() => handleGoToProduct(item)}
                            title="Click to view product"
                            style={{ cursor: 'pointer' }}
                          >
                            {item.name}
                          </h4>
                          <div className="wishlist-item-price">Rs. {item.price}</div>

                          <div className="wishlist-item-actions">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              className={`wishlist-add-cart-btn ${addedIds[item.id || item._id] ? 'added' : ''}`}
                              onClick={() => handleAddToCart(item)}
                              aria-label={addedIds[item.id || item._id] ? `Go to cart with ${item.name}` : `Add ${item.name} to cart`}
                            >
                              {addedIds[item.id || item._id] ? 'Go to Cart →' : 'Add to Cart'}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              className="wishlist-remove-btn"
                              onClick={() => removeFromWishlist(item.id)}
                              aria-label={`Remove ${item.name} from wishlist`}
                              title="Remove from wishlist"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {wishlist.length > 0 && (
              <div className="wishlist-footer">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="wishlist-view-page-btn"
                  onClick={() => {
                    setIsWishlistOpen(false);
                    if (onNavigateWishlist) onNavigateWishlist();
                  }}
                >
                  View Full Wishlist Page
                </motion.button>
                <div className="wishlist-footer-links">
                  <button
                    type="button"
                    className="wishlist-continue-btn"
                    onClick={() => setIsWishlistOpen(false)}
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    className="wishlist-clear-btn"
                    onClick={clearWishlist}
                  >
                    Clear Wishlist
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
