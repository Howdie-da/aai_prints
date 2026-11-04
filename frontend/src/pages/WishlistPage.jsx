import { useState } from 'react';
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

  // Added-to-cart temporary state per product id
  const [addedIds, setAddedIds] = useState({});

  // Confirmation modal for Clear All Wishlist
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
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
              <svg
                className="wishlist-header-heart"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="#e53935"
                stroke="#e53935"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h1 className="wishlist-page-title">My Wishlist</h1>
              <span className="wishlist-count-badge">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="wishlist-subtitle">
              Your saved favourites and handcrafted décor pieces.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="wishlist-header-actions">
              <button
                type="button"
                className="wishlist-clear-all-btn"
                onClick={() => setShowClearConfirm(true)}
                title="Clear all saved items"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear Wishlist
              </button>
            </div>
          )}
        </header>

        {/* ── 3. Main Content: Empty State OR Responsive Grid ── */}
        {wishlist.length === 0 ? (
          <section className="wishlist-empty-state" aria-label="Empty wishlist">
            <div className="wishlist-empty-icon-wrap" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="wishlist-empty-heading">Your Wishlist Is Empty</h2>
            <p className="wishlist-empty-description">
              You haven't saved any items yet. Explore our handcrafted devotional idols,
              backlit LED frames, and designer car &amp; wall décor to build your personal wishlist.
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

              const isAdded = Boolean(addedIds[product.id]);

              return (
                <article
                  key={product.id}
                  className="wishlist-card"
                  aria-label={product.name}
                >
                  {/* Remove Button (Top-Right) */}
                  <button
                    type="button"
                    className="wishlist-card-remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

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
                      <button
                        type="button"
                        className={`wishlist-card-cart-btn ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                        aria-label={
                          isAdded
                            ? `${product.name} added to cart`
                            : `Add ${product.name} to cart`
                        }
                      >
                        {isAdded ? (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Added to Cart ✓
                          </>
                        ) : (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* ── 4. Clear Wishlist Confirmation Modal ── */}
      {showClearConfirm && (
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
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c93838"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
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
        </div>
      )}
    </div>
  );
}

