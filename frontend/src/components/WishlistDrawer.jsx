import { useState, useEffect } from 'react';
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

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
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

  if (!isWishlistOpen) return null;

  return (
    <div className="wishlist-overlay" onClick={() => setIsWishlistOpen(false)}>
      <aside
        className="wishlist-drawer"
        role="dialog"
        aria-label="Wishlist items"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="wishlist-header">
          <div className="wishlist-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#e53935" stroke="#e53935" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2>My Wishlist</h2>
            <span className="wishlist-badge-count">{wishlist.length}</span>
          </div>
          <button
            type="button"
            className="wishlist-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="wishlist-body">
          {wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b0a89b" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="wishlist-empty-title">Your wishlist is empty</h3>
              <p className="wishlist-empty-desc">
                Explore our handcrafted devotional, car &amp; wall decor items and click the heart icon on any product to save your favorites here.
              </p>
              <button
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
              </button>
            </div>
          ) : (
            <div className="wishlist-items-list">
              {wishlist.map((item) => (
                <div key={item.id} className="wishlist-item">
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
                      <button
                        type="button"
                        className={`wishlist-add-cart-btn ${addedIds[item.id] ? 'added' : ''}`}
                        onClick={() => handleAddToCart(item)}
                      >
                        {addedIds[item.id] ? 'Added ✓' : 'Add to Cart'}
                      </button>

                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        title="Remove from wishlist"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {wishlist.length > 0 && (
          <div className="wishlist-footer">
            <button
              type="button"
              className="wishlist-view-page-btn"
              onClick={() => {
                setIsWishlistOpen(false);
                if (onNavigateWishlist) onNavigateWishlist();
              }}
            >
              View Full Wishlist Page
            </button>
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
      </aside>
    </div>
  );
}
