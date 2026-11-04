import { useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import './CartDrawer.css';

// Helper to safely parse numeric price from string formatted prices (e.g., '1,199' -> 1199)
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export default function CartDrawer({ onSelectProduct, onNavigateShop, onNavigateCart }) {
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useWishlist();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Navigate to product detail page on click
  const handleGoToProduct = (item) => {
    setIsCartOpen(false);
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

  // Calculate actual subtotal & total based solely on real product prices
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = parsePrice(item.price);
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  const total = subtotal;

  if (!isCartOpen) return null;

  return (
    <div
      className="cart-overlay"
      onClick={() => setIsCartOpen(false)}
      role="presentation"
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-label="Shopping Cart"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Drawer Header ── */}
        <div className="cart-header">
          <div className="cart-header-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h2>Shopping Cart</h2>
            <span className="cart-badge-count">{cartCount}</span>
          </div>

          <button
            type="button"
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* ── Drawer Body ── */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" aria-hidden="true">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b0a89b"
                  strokeWidth="1.5"
                >
                  <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className="cart-empty-title">Your cart is empty</h3>
              <p className="cart-empty-desc">
                Explore our handcrafted devotional idols, LED frames and wall décor
                to fill your cart.
              </p>
              <button
                type="button"
                className="cart-shop-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  if (onNavigateShop) {
                    onNavigateShop();
                  } else {
                    const el = document.getElementById('devotional');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => {
                const itemQty = item.quantity || 1;
                const unitPrice = parsePrice(item.price);
                const lineTotal = unitPrice * itemQty;

                return (
                  <div key={item.id} className="cart-item">
                    {/* Item Image */}
                    <div
                      className="cart-item-img-wrap"
                      onClick={() => handleGoToProduct(item)}
                      title="Click to view product details"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-img"
                        loading="lazy"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="cart-item-details">
                      <h4
                        className="cart-item-name"
                        onClick={() => handleGoToProduct(item)}
                        title={item.name}
                      >
                        {item.name}
                      </h4>

                      <div className="cart-item-pricing">
                        <span className="cart-item-unit-price">
                          Rs. {item.price} each
                        </span>
                      </div>

                      {/* Quantity & Remove Controls */}
                      <div className="cart-item-controls">
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() =>
                              updateCartQuantity(item.id, itemQty - 1)
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span
                            className="cart-qty-display"
                            aria-label={`Current quantity: ${itemQty}`}
                          >
                            {itemQty}
                          </span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() =>
                              updateCartQuantity(item.id, itemQty + 1)
                            }
                            aria-label={`Increase quantity of ${item.name}`}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-subtotal">
                          Rs. {lineTotal.toLocaleString('en-IN')}
                        </div>

                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          title="Remove item"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Drawer Footer (Subtotal, Total & Actions) ── */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-box">
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-val">
                  Rs. {subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="cart-summary-row cart-total-row">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-val">
                  Rs. {total.toLocaleString('en-IN')}
                </span>
              </div>

              <p className="cart-tax-notice">
                Inclusive of all taxes
              </p>
            </div>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={() => {
                alert('Order checkout will be connected to your payment gateway!');
              }}
            >
              PROCEED TO CHECKOUT • Rs. {total.toLocaleString('en-IN')}
            </button>

            <div className="cart-footer-links">
              <button
                type="button"
                className="cart-continue-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  if (onNavigateCart) onNavigateCart();
                }}
              >
                View Full Cart Page
              </button>

              <button
                type="button"
                className="cart-clear-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

