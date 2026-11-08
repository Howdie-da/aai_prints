import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Trash2, Lock, ShieldCheck } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './CartDrawer.css';

// Helper to safely parse numeric price
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

const FREE_SHIPPING_THRESHOLD = 500;

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

  // Calculate actual subtotal & total
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = parsePrice(item.price);
    const qty = item.quantity || 1;
    return sum + unitPrice * qty;
  }, 0);

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          key="cart-overlay"
          className="cart-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setIsCartOpen(false)}
          role="presentation"
        >
          <motion.aside
            key="cart-drawer"
            className="cart-drawer"
            role="dialog"
            aria-label="Shopping Cart"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Drawer Header ── */}
            <div className="cart-header">
              <div className="cart-header-title">
                <ShoppingBag size={20} strokeWidth={2.2} style={{ color: 'var(--teal)' }} />
                <h2>Shopping Cart</h2>
                {cartCount > 0 && (
                  <span className="cart-badge-count">
                    {cartCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
                title="Close (Esc)"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>

            {/* ── Free Shipping Progress Bar ── */}
            <div className="cart-shipping-banner">
              <div className="cart-shipping-text">
                {amountToFreeShipping > 0 ? (
                  <span>Add <strong>₹{amountToFreeShipping}</strong> more to unlock <strong>FREE Express Shipping</strong></span>
                ) : (
                  <span className="cart-shipping-qualified">🎉 You've unlocked <strong>FREE Express Shipping</strong>!</span>
                )}
              </div>
              <div className="cart-shipping-meter">
                <div
                  className="cart-shipping-fill"
                  style={{ width: `${freeShippingProgress}%`, transition: 'width 0.4s ease' }}
                  role="progressbar"
                  aria-valuenow={freeShippingProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>

            {/* ── Drawer Body ── */}
            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon" aria-hidden="true">
                    <ShoppingBag size={48} strokeWidth={1.5} style={{ color: '#b0a89b' }} />
                  </div>
                  <h3 className="cart-empty-title">Your cart is empty</h3>
                  <p className="cart-empty-desc">
                    Explore our illuminated backlit frames, handcrafted brass idols, and designer wall art.
                  </p>
                  <button
                    type="button"
                    className="cart-shop-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      if (onNavigateShop) {
                        onNavigateShop();
                      } else {
                        window.location.hash = '#/shop';
                      }
                    }}
                  >
                    START SHOPPING
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item) => {
                    const itemQty = item.quantity || 1;
                    const unitPrice = parsePrice(item.price);
                    const lineTotal = unitPrice * itemQty;
                    const itemKey = item.cartItemId || item.backendItemId || item.id;

                    return (
                      <div
                        key={itemKey}
                        className="cart-item"
                      >
                        {/* Item Image */}
                        <div
                          className="cart-item-img-wrap"
                          onClick={() => handleGoToProduct(item)}
                          title="Click to view product details"
                        >
                          <img
                            src={item.image || '/new-images/product-placeholder.jpg'}
                            alt={item.name}
                            className="cart-item-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = '/new-images/product-placeholder.jpg';
                            }}
                          />
                        </div>

                        {/* Item Details */}
                        <div className="cart-item-details">
                          <div className="cart-item-top">
                            <h4
                              className="cart-item-name"
                              onClick={() => handleGoToProduct(item)}
                              title={item.name}
                            >
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              className="cart-item-remove-btn"
                              onClick={() => removeFromCart(itemKey)}
                              aria-label={`Remove ${item.name} from cart`}
                              title="Remove item"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>

                          {/* Variant tag if present */}
                          {(item.selectedVariant || item.variantName) && (
                            <span className="cart-item-variant">
                              Option: {item.selectedVariant?.label || item.variantName}
                            </span>
                          )}

                          <div className="cart-item-bottom">
                            {/* Quantity Stepper */}
                            <div className="cart-item-stepper">
                              <button
                                type="button"
                                className="cart-stepper-btn"
                                onClick={() => updateCartQuantity(itemKey, itemQty - 1)}
                                disabled={itemQty <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} strokeWidth={2.4} />
                              </button>
                              <span className="cart-stepper-qty" aria-live="polite">
                                {itemQty}
                              </span>
                              <button
                                type="button"
                                className="cart-stepper-btn"
                                onClick={() => updateCartQuantity(itemKey, itemQty + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} strokeWidth={2.4} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="cart-item-pricing">
                              <span className="cart-item-total">₹{lineTotal.toLocaleString()}</span>
                              {itemQty > 1 && (
                                <span className="cart-item-unit">₹{unitPrice} each</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Drawer Footer ── */}
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-subtotal-row">
                  <span className="cart-subtotal-label">Subtotal</span>
                  <span className="cart-subtotal-value">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-subtotal-note">
                  <span>Delivery Charges</span>
                  <span className={amountToFreeShipping === 0 ? 'text-free' : ''}>
                    {amountToFreeShipping === 0 ? 'FREE' : '₹49 at checkout'}
                  </span>
                </div>

                {/* High-Impact Checkout Action */}
                <button
                  type="button"
                  className="cart-checkout-btn btn-gold"
                  onClick={() => {
                    setIsCartOpen(false);
                    if (onNavigateCart) {
                      onNavigateCart();
                    } else {
                      window.location.hash = '#/cart';
                    }
                  }}
                >
                  <Lock size={15} strokeWidth={2.2} style={{ marginRight: '6px' }} />
                  <span>PROCEED TO SECURE CHECKOUT</span>
                </button>

                {/* Trust Assurance Strip */}
                <div className="cart-trust-strip">
                  <span>✦ 256-Bit SSL Encryption</span>
                  <span>✦ Safe Transit Guaranteed</span>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
