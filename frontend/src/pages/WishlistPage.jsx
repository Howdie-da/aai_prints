import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, X, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './WishlistPage.css';

// Helper to safely parse numeric price
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export default function WishlistPage({
  onNavigateHome,
  onNavigateShop,
  onSelectProduct,
}) {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
    addToCart,
  } = useWishlist();

  // Added-to-cart temporary state per product id (10s "Go to Cart" window)
  const [addedIds, setAddedIds] = useState({});
  const timersRef = useRef({});

  // Confirmation modal for Clear All Wishlist
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddToCart = (product) => {
    const prodId = product.id || product._id;
    if (addedIds[prodId]) {
      window.location.hash = '#/cart';
      return;
    }

    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [prodId]: true }));

    if (timersRef.current[prodId]) {
      clearTimeout(timersRef.current[prodId]);
    }
    timersRef.current[prodId] = setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prodId]: false }));
    }, 10000);
  };

  const handleProductClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleConfirmClear = () => {
    clearWishlist();
    setShowClearConfirm(false);
  };

  return (
    <div className="wishlist-page">
      {/* ── 1. Breadcrumbs ── */}
      <nav className="wishlist-breadcrumb" aria-label="Breadcrumb">
        <div className="wishlist-container">
          <button
            type="button"
            className="breadcrumb-link"
            onClick={onNavigateHome}
          >
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          <button
            type="button"
            className="breadcrumb-link"
            onClick={onNavigateShop}
          >
            Shop
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">My Wishlist</span>
        </div>
      </nav>

      <div className="wishlist-container">
        {/* ── 2. Page Header ── */}
        <header className="wishlist-page-header">
          <div className="wishlist-header-left">
            <div className="wishlist-title-wrap">
              <Heart
                size={28}
                className="wishlist-header-heart"
                fill="#e53935"
                stroke="#e53935"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h1 className="wishlist-page-title">My Wishlist</h1>
              <span className="wishlist-count-badge">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="wishlist-subtitle">
              Your saved favourites and handcrafted decor pieces.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="wishlist-header-actions">
              <button
                type="button"
                className="wishlist-clear-all-btn"
                onClick={() => setShowClearConfirm(true)}
                title="Clear all saved items"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} />
                <span>Clear Wishlist</span>
              </button>
            </div>
          )}
        </header>

        {/* ── 3. Main Content: Empty State OR Responsive Grid ── */}
        {wishlist.length === 0 ? (
          <section className="wishlist-empty-state" aria-label="Empty wishlist">
            <div className="wishlist-empty-icon-wrap" aria-hidden="true">
              <Heart
                size={54}
                stroke="var(--teal)"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="wishlist-empty-heading">Your Wishlist Is Empty</h2>
            <p className="wishlist-empty-description">
              You haven't saved any items yet. Explore our handcrafted devotional idols,
              backlit LED frames, and designer car &amp; wall decor to build your personal wishlist.
            </p>
            <div className="wishlist-empty-actions">
              <button
                type="button"
                className="wishlist-empty-btn wishlist-empty-btn--primary"
                onClick={onNavigateShop}
              >
                Continue Shopping
              </button>
              <button
                type="button"
                className="wishlist-empty-btn wishlist-empty-btn--secondary"
                onClick={onNavigateHome}
              >
                Back to Home
              </button>
            </div>
          </section>
        ) : (
          <section className="wishlist-grid" aria-label="Saved products">
            <AnimatePresence initial={false}>
              {wishlist.map((product) => {
                const hasValidImage = Boolean(
                  product.image &&
                  !product.image.includes('placeholder') &&
                  typeof product.image === 'string' &&
                  product.image.trim() !== ''
                );

                // Calculate discount only if authentic original price exists and exceeds current price
                let discountPercent = null;
                if (product.originalPrice && product.price) {
                  const orig = parsePrice(product.originalPrice);
                  const curr = parsePrice(product.price);
                  if (orig > curr && curr > 0) {
                    discountPercent = Math.round(((orig - curr) / orig) * 100);
                  }
                }

                const isAdded = Boolean(addedIds[product.id || product._id]);

                return (
                  <motion.article
                    key={product.id}
                    className="wishlist-card"
                    aria-label={product.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Remove Button (Top-Right) */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      className="wishlist-card-remove-btn"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from wishlist"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </motion.button>

                    {/* Tag / Badge */}
                    {product.tag && (
                      <div
                        className={`wishlist-card-tag wishlist-card-tag--${product.tag
                          .replace(/\s+/g, '-')
                          .toLowerCase()}`}
                      >
                        {product.tag}
                      </div>
                    )}

                    {/* Clean 1:1 Image Container */}
                    <div
                      className="wishlist-card-img-wrap"
                      onClick={() => handleProductClick(product)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${product.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProductClick(product);
                        }
                      }}
                    >
                      {hasValidImage ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="wishlist-card-img"
                          loading="lazy"
                          onError={(e) => {
                            // Hide broken image immediately to maintain clean aesthetic
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="wishlist-card-img-empty"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="wishlist-card-info">
                      {product.category && (
                        <span className="wishlist-card-category">
                          {product.category}
                        </span>
                      )}

                      <h3
                        className="wishlist-card-title"
                        onClick={() => handleProductClick(product)}
                        role="button"
                        tabIndex={0}
                        title={product.name}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleProductClick(product);
                          }
                        }}
                      >
                        {product.name}
                      </h3>

                      {/* Price Presentation */}
                      <div className="wishlist-card-price-row">
                        <span className="wishlist-card-price">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="wishlist-card-orig-price">
                            ₹{product.originalPrice}
                          </span>
                        )}
                        {discountPercent !== null && (
                          <span className="wishlist-card-discount">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Actions: Add to Cart */}
                      <div className="wishlist-card-actions">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className={`wishlist-card-cart-btn ${isAdded ? 'added' : ''}`}
                          onClick={() => handleAddToCart(product)}
                          aria-label={
                            isAdded
                              ? `Go to cart with ${product.name}`
                              : `Add ${product.name} to cart`
                          }
                        >
                          {isAdded ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <ShoppingBag size={16} />
                              Go to Cart →
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <ShoppingBag size={16} />
                              Add to Cart
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </section>
        )}
      </div>

      {/* ── 4. Clear Wishlist Confirmation Modal (Portaled to document.body) ── */}
      {showClearConfirm && createPortal(
        <div
          className="wishlist-modal-backdrop"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="wishlist-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wishlist-modal-icon" aria-hidden="true">
              <AlertCircle size={36} stroke="#c93838" strokeWidth={2} />
            </div>
            <h3 id="clear-modal-title" className="wishlist-modal-title">
              Clear your entire wishlist?
            </h3>
            <p className="wishlist-modal-desc">
              This will remove all {wishlistCount} saved {wishlistCount === 1 ? 'item' : 'items'} from
              your wishlist. You can always add items back while browsing our shop.
            </p>
            <div className="wishlist-modal-actions">
              <button
                type="button"
                className="wishlist-modal-btn wishlist-modal-btn--cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wishlist-modal-btn wishlist-modal-btn--confirm"
                onClick={handleConfirmClear}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

