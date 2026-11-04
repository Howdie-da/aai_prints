import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import './CartPage.css';

// Helper to safely parse numeric price from string formatted prices (e.g., '1,199' -> 1199)
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export default function CartPage({
  onNavigateHome,
  onNavigateShop,
  onSelectProduct,
}) {
  const {
    cart,
    cartCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useWishlist();

  // Clear Cart confirmation dialog state
  const [showClearModal, setShowClearModal] = useState(false);

  // Frontend-only Checkout notice state
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

  // Calculations based strictly on actual product data
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = parsePrice(item.price);
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  const originalTotal = cart.reduce((sum, item) => {
    const origPrice = item.originalPrice ? parsePrice(item.originalPrice) : parsePrice(item.price);
    const qty = item.quantity || 1;
    return sum + origPrice * qty;
  }, 0);

  const totalSavings = originalTotal > subtotal ? originalTotal - subtotal : 0;
  const finalTotal = subtotal;

  const handleDecrease = (item) => {
    const currentQty = item.quantity || 1;
    if (currentQty > 1) {
      updateCartQuantity(item.cartItemId || item.id, currentQty - 1);
    }
  };

  const handleIncrease = (item) => {
    const currentQty = item.quantity || 1;
    updateCartQuantity(item.cartItemId || item.id, currentQty + 1);
  };

  const handleManualQty = (item, val) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      updateCartQuantity(item.cartItemId || item.id, parsed);
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.cartItemId || item.id);
  };

  const handleConfirmClear = () => {
    clearCart();
    setShowClearModal(false);
  };

  const handleGoToProduct = (item) => {
    if (onSelectProduct) {
      onSelectProduct(item);
    }
  };

  return (
    <div className="cart-page">
      {/* ── 1. Breadcrumbs ── */}
      <nav className="cart-breadcrumb" aria-label="Breadcrumb">
        <div className="cart-container">
          <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          <button type="button" className="breadcrumb-link" onClick={onNavigateShop}>
            Shop
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Shopping Cart</span>
        </div>
      </nav>

      <div className="cart-container">
        {/* ── 2. Page Header ── */}
        <header className="cart-page-header">
          <div className="cart-page-header-text">
            <h1 className="cart-page-title">Shopping Cart</h1>
            <span className="cart-page-count-badge">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              className="cart-clear-trigger-btn"
              onClick={() => setShowClearModal(true)}
              aria-label="Clear all items from cart"
            >
              Clear Cart
            </button>
          )}
        </header>

        {/* ── 3. Content Area ── */}
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="cart-empty-card">
            <div className="cart-empty-icon" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="cart-empty-title">Your Cart Is Empty</h2>
            <p className="cart-empty-desc">
              You haven't added any home décor pieces to your cart yet. Explore our handcrafted spiritual idols, illuminated frames, and artisan wall art.
            </p>
            <button
              type="button"
              className="cart-empty-cta-btn"
              onClick={onNavigateShop}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Cart Grid: Items (Left) + Order Summary (Right) */
          <div className="cart-page-layout">

            {/* Left: Cart Items List */}
            <div className="cart-items-section">
              <div className="cart-items-list">
                {cart.map((item) => {
                  const qty = item.quantity || 1;
                  const unitPrice = parsePrice(item.price);
                  const itemSubtotal = unitPrice * qty;
                  const itemKey = item.cartItemId || (item.variantId ? `${item.id}-${item.variantId}` : String(item.id));
                  const hasImage = Boolean(item.image && !item.image.includes('placeholder'));

                  // Discount calculation if originalPrice exists
                  let itemDiscountPercent = null;
                  if (item.originalPrice && item.price) {
                    const orig = parsePrice(item.originalPrice);
                    if (orig > unitPrice) {
                      itemDiscountPercent = Math.round(((orig - unitPrice) / orig) * 100);
                    }
                  }

                  return (
                    <article key={itemKey} className="cart-item-card" aria-label={item.name}>
                      {/* Product Image */}
                      <div
                        className="cart-item-img-wrap"
                        onClick={() => handleGoToProduct(item)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${item.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleGoToProduct(item);
                          }
                        }}
                      >
                        {hasImage ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="cart-item-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="cart-item-img-empty" aria-hidden="true" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <div className="cart-item-main-info">
                          {item.category && (
                            <span className="cart-item-cat">{item.category}</span>
                          )}
                          <h3
                            className="cart-item-name"
                            onClick={() => handleGoToProduct(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleGoToProduct(item);
                              }
                            }}
                          >
                            {item.name}
                          </h3>

                          {item.variant && (
                            <div className="cart-item-variant">
                              Option: <strong>{item.variant}</strong>
                            </div>
                          )}

                          <div className="cart-item-price-row">
                            <span className="cart-item-unit-price">₹{item.price}</span>
                            {item.originalPrice && (
                              <span className="cart-item-orig-price">₹{item.originalPrice}</span>
                            )}
                            {itemDiscountPercent && (
                              <span className="cart-item-discount">{itemDiscountPercent}% OFF</span>
                            )}
                          </div>
                        </div>

                        {/* Controls & Subtotal */}
                        <div className="cart-item-actions-row">
                          <div className="cart-item-qty-control" aria-label="Quantity selector">
                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() => handleDecrease(item)}
                              disabled={qty <= 1}
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              className="cart-qty-input"
                              value={qty}
                              min="1"
                              onChange={(e) => handleManualQty(item, e.target.value)}
                              aria-label="Item quantity"
                            />
                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() => handleIncrease(item)}
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-subtotal-box">
                            <span className="cart-subtotal-label">Subtotal:</span>
                            <span className="cart-subtotal-val">
                              ₹{itemSubtotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="cart-item-remove-btn"
                            onClick={() => handleRemove(item)}
                            aria-label={`Remove ${item.name} from cart`}
                            title="Remove item"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="cart-items-footer-nav">
                <button
                  type="button"
                  className="cart-continue-link"
                  onClick={onNavigateShop}
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* Right: Order Summary */}
            <aside className="cart-summary-section" aria-label="Order summary">
              <div className="cart-summary-card">
                <h2 className="cart-summary-heading">Order Summary</h2>

                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Items Subtotal</span>
                    <span className="cart-summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="cart-summary-row cart-savings-row">
                      <span className="cart-summary-label">Promotional Savings</span>
                      <span className="cart-summary-val">−₹{totalSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Shipping</span>
                    <span className="cart-summary-shipping-note">
                      Calculated at checkout
                    </span>
                  </div>

                  {subtotal >= 500 && (
                    <div className="cart-free-shipping-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Eligible for Free Standard Delivery</span>
                    </div>
                  )}

                  <div className="cart-summary-divider" />

                  <div className="cart-summary-row cart-total-row">
                    <span className="cart-total-label">Estimated Total</span>
                    <span className="cart-total-val">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <p className="cart-tax-notice">
                    Inclusive of all applicable taxes
                  </p>
                </div>

                <button
                  type="button"
                  className="cart-checkout-cta"
                  onClick={() => setShowCheckoutNotice(true)}
                  aria-label={`Proceed to checkout with total amount ₹${finalTotal.toLocaleString('en-IN')}`}
                >
                  PROCEED TO CHECKOUT • ₹{finalTotal.toLocaleString('en-IN')}
                </button>

                {/* Trust Badges */}
                <div className="cart-trust-badges">
                  <div className="cart-trust-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Secure &amp; Encrypted Ordering</span>
                  </div>
                  <div className="cart-trust-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Artisan Handcrafted Quality Guarantee</span>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        )}
      </div>

      {/* ── 4. Confirmation Dialog: Clear Entire Cart ── */}
      {showClearModal && (
        <div className="cart-modal-overlay" onClick={() => setShowClearModal(false)}>
          <div
            className="cart-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
          >
            <h3 id="clear-cart-title" className="cart-modal-title">Clear Entire Cart?</h3>
            <p className="cart-modal-msg">
              Are you sure you want to remove all <strong>{cartCount}</strong> {cartCount === 1 ? 'item' : 'items'} from your shopping cart?
            </p>
            <div className="cart-modal-actions">
              <button
                type="button"
                className="cart-modal-btn cart-modal-btn--cancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cart-modal-btn cart-modal-btn--confirm"
                onClick={handleConfirmClear}
              >
                Yes, Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Frontend Notice: Proceed to Checkout ── */}
      {showCheckoutNotice && (
        <div className="cart-modal-overlay" onClick={() => setShowCheckoutNotice(false)}>
          <div
            className="cart-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-notice-title"
          >
            <div className="cart-checkout-notice-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 id="checkout-notice-title" className="cart-modal-title">Checkout Integration</h3>
            <p className="cart-modal-msg">
              Payment gateway and online checkout integration will be connected by our backend team.
              Your cart with <strong>{cartCount} {cartCount === 1 ? 'item' : 'items'}</strong> (Total: <strong>₹{finalTotal.toLocaleString('en-IN')}</strong>) is saved in your browser.
            </p>
            <div className="cart-modal-actions">
              <button
                type="button"
                className="cart-modal-btn cart-modal-btn--primary"
                onClick={() => setShowCheckoutNotice(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

