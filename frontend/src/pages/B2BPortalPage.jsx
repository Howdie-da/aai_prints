import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Package,
  Search,
  X,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { fetchB2BProducts, B2B_CATEGORIES } from '../services/b2bService';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import './B2BPortalPage.css';

/**
 * Resolves active unit price from product's variable price entries / tiers
 */
function resolveVariablePricing(product, qty) {
  const tiers =
    Array.isArray(product.tierPricing) && product.tierPricing.length > 0
      ? product.tierPricing
      : null;

  if (!tiers || tiers.length === 0) {
    const basePrice = product.price != null ? Number(product.price) : 0;
    return {
      activeUnitPrice: basePrice,
      activeTierIndex: -1,
      tiers: [],
    };
  }

  // Sort tiers ascending by minQty
  const sorted = [...tiers].sort((a, b) => Number(a.minQty) - Number(b.minQty));

  let activeIndex = 0;
  let activePrice = Number(sorted[0].unitPrice);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    if (qty >= Number(t.minQty)) {
      if (t.maxQty == null || t.maxQty === '' || qty <= Number(t.maxQty)) {
        activePrice = Number(t.unitPrice);
        activeIndex = i;
        break;
      }
    }
  }

  return {
    activeUnitPrice: activePrice,
    activeTierIndex: activeIndex,
    tiers: sorted,
  };
}

/**
 * Single Wholesale Product Card Component
 * Unrestrictive quantity typing, inline MOQ validation, and variable pricing showcase
 */
function WholesaleProductCard({ product, onAddToCart, onBuyNow }) {
  const moq = Math.max(1, Number(product.moq) || 1);
  const [quantityInput, setQuantityInput] = useState(String(moq));
  const [moqError, setMoqError] = useState(null);
  const [added, setAdded] = useState(false);

  // Sync default quantity if product changes
  useEffect(() => {
    setQuantityInput(String(moq));
    setMoqError(null);
  }, [moq]);

  const numericQty = parseInt(quantityInput, 10);
  const isInvalid = !quantityInput || isNaN(numericQty) || numericQty <= 0;
  const isBelowMoq = !isInvalid && numericQty < moq;

  // Resolve variable pricing based on entered quantity
  const effectiveQty = isInvalid ? moq : numericQty;
  const { activeUnitPrice, activeTierIndex, tiers } = useMemo(
    () => resolveVariablePricing(product, effectiveQty),
    [product, effectiveQty]
  );

  const primaryImg =
    (product.images && product.images[0]) ||
    product.image ||
    '/new-images/product-placeholder.jpg';

  // Steppers
  const handleDecrease = () => {
    const curr = parseInt(quantityInput, 10) || moq;
    const nextVal = Math.max(1, curr - 1);
    setQuantityInput(String(nextVal));
    if (nextVal < moq) {
      setMoqError(`Minimum order quantity is ${moq} units.`);
    } else {
      setMoqError(null);
    }
  };

  const handleIncrease = () => {
    const curr = parseInt(quantityInput, 10) || moq;
    const nextVal = curr + 1;
    setQuantityInput(String(nextVal));
    if (nextVal >= moq) {
      setMoqError(null);
    }
  };

  // Free typing input handler
  const handleQuantityChange = (e) => {
    const val = e.target.value;
    setQuantityInput(val);
    const n = parseInt(val, 10);
    if (!val || isNaN(n) || n < moq) {
      setMoqError(`Minimum order quantity is ${moq} units.`);
    } else {
      setMoqError(null);
    }
  };

  // Add to Cart
  const handleAdd = () => {
    if (isInvalid || numericQty < moq) {
      setMoqError(`Minimum order quantity is ${moq} units. Please enter ${moq} or more.`);
      return;
    }
    setMoqError(null);
    onAddToCart(product, numericQty, activeUnitPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Buy Now
  const handleBuy = () => {
    if (isInvalid || numericQty < moq) {
      setMoqError(`Minimum order quantity is ${moq} units. Please enter ${moq} or more.`);
      return;
    }
    setMoqError(null);
    onBuyNow(product, numericQty, activeUnitPrice);
  };

  const orderTotal = !isInvalid && !isBelowMoq ? numericQty * activeUnitPrice : 0;

  return (
    <div className="wholesale-card">
      <div className="wholesale-card-img-wrap">
        <img
          src={primaryImg}
          alt={product.name}
          className="wholesale-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/new-images/product-placeholder.jpg';
          }}
        />
        <span className="wholesale-moq-pill">MOQ: {moq} Units</span>
      </div>

      <div className="wholesale-card-body">
        <span className="wholesale-card-category">{product.category}</span>
        <h3 className="wholesale-card-title">{product.name}</h3>
        <p className="wholesale-card-desc">{product.description}</p>

        {/* Pricing Strip */}
        <div className="wholesale-price-strip">
          <div className="wholesale-unit-price">
            <span className="price-label">Wholesale Rate</span>
            <span className="price-amount">
              ₹{activeUnitPrice.toLocaleString('en-IN')}{' '}
              <small className="price-unit">/ unit</small>
            </span>
          </div>
          <div className="wholesale-stock-status">
            <span className="stock-dot" />
            <span>In Stock ({product.stock || 500} units)</span>
          </div>
        </div>

        {/* Variable Pricing Showcase */}
        {tiers && tiers.length > 0 && (
          <div className="wholesale-tiers-box">
            <span className="tiers-box-label">Variable Pricing:</span>
            <div className="tiers-chips-list">
              {tiers.map((tier, idx) => {
                const isActive = !isInvalid && !isBelowMoq && idx === activeTierIndex;
                const rangeLabel = tier.maxQty
                  ? `${tier.minQty}–${tier.maxQty} pcs`
                  : `${tier.minQty}+ pcs`;

                return (
                  <div
                    key={idx}
                    className={`tier-chip ${isActive ? 'tier-chip-active' : ''}`}
                    title={isActive ? 'Active pricing tier for entered quantity' : ''}
                  >
                    <span className="tier-chip-range">{rangeLabel}</span>
                    <strong className="tier-chip-price">
                      ₹{Number(tier.unitPrice).toLocaleString('en-IN')}
                      <small>/ea</small>
                    </strong>
                    {isActive && <span className="tier-active-pill">Applied</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Simplified Quantity Controls */}
        <div className="wholesale-qty-box">
          <div className="wholesale-qty-selector">
            <label htmlFor={`qty-${product._id || product.id}`} className="qty-label">
              Quantity:
            </label>
            <div className={`qty-stepper ${isBelowMoq ? 'has-error' : ''}`}>
              <button
                type="button"
                className="qty-btn"
                onClick={handleDecrease}
                title="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <input
                id={`qty-${product._id || product.id}`}
                type="number"
                min="1"
                className={`qty-input ${isBelowMoq ? 'qty-input-error' : ''}`}
                value={quantityInput}
                onChange={handleQuantityChange}
                placeholder={String(moq)}
              />
              <button
                type="button"
                className="qty-btn"
                onClick={handleIncrease}
                title="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div className="wholesale-order-calc">
            {!isInvalid && !isBelowMoq ? (
              <span>
                Total: <strong>₹{orderTotal.toLocaleString('en-IN')}</strong>
              </span>
            ) : (
              <span className="calc-paused">Order paused</span>
            )}
          </div>
        </div>

        {/* Inline MOQ Error Message */}
        {moqError && (
          <div className="wholesale-moq-error">
            <AlertCircle size={13} />
            <span>{moqError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="wholesale-actions-row">
          <button
            type="button"
            className={`wholesale-btn wholesale-btn-cart ${added ? 'added' : ''}`}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <CheckCircle2 size={16} /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add to Cart
              </>
            )}
          </button>
          <button
            type="button"
            className="wholesale-btn wholesale-btn-buy"
            onClick={handleBuy}
          >
            <Zap size={15} /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wholesale Storefront Main Page
 */
export default function B2BPortalPage({
  onNavigateHome,
  onNavigateAdminB2B,
  onNavigateCart,
  isAdmin: propIsAdmin,
}) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = propIsAdmin || (isAuthenticated && user?.role === 'admin');
  const { addToCart, setIsCartOpen } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Us Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Load Wholesale Catalog
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchB2BProducts().then((data) => {
      if (isMounted) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase()?.includes(q);
        const matchDesc = p.description?.toLowerCase()?.includes(q);
        const matchCat = p.category?.toLowerCase()?.includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Add to Cart
  const handleAddToCart = (product, quantity, unitPrice) => {
    const itemToAdd = {
      id: product._id || product.id,
      _id: product._id || product.id,
      name: product.name,
      price: unitPrice,
      basePrice: unitPrice,
      image:
        (product.images && product.images[0]) ||
        product.image ||
        '/new-images/product-placeholder.jpg',
      images: product.images || [product.image || '/new-images/product-placeholder.jpg'],
      isWholesale: true,
      moq: product.moq,
    };
    addToCart(itemToAdd, quantity);
    setIsCartOpen(true);
  };

  // Handle Buy Now (add to cart and proceed directly to cart / checkout)
  const handleBuyNow = (product, quantity, unitPrice) => {
    const itemToAdd = {
      id: product._id || product.id,
      _id: product._id || product.id,
      name: product.name,
      price: unitPrice,
      basePrice: unitPrice,
      image:
        (product.images && product.images[0]) ||
        product.image ||
        '/new-images/product-placeholder.jpg',
      images: product.images || [product.image || '/new-images/product-placeholder.jpg'],
      isWholesale: true,
      moq: product.moq,
    };
    addToCart(itemToAdd, quantity);
    if (onNavigateCart) {
      onNavigateCart();
    } else {
      window.location.hash = '#/cart';
    }
  };

  // Submit Contact Us message
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setIsContactModalOpen(false);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    }, 2500);
  };

  return (
    <div className="wholesale-store-page">
      {/* ── Wholesale Store Header Banner ── */}
      <header className="wholesale-hero">
        <div className="wholesale-hero-wrap">
          <div className="wholesale-hero-content">
            <span className="wholesale-pill-badge">WHOLESALE / BULK STORE</span>
            <h1 className="wholesale-hero-title">Factory-Direct Wholesale Store</h1>
            <p className="wholesale-hero-subtitle">
              Order  devotional wall hangings, brass idols, and home decor at factory wholesale rates. Minimum order quantities with variable volume discounts, secure checkout, and direct delivery.
            </p>

            <div className="wholesale-hero-actions">
              <button
                type="button"
                className="wholesale-contact-btn"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Phone size={15} /> Contact Us
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className="wholesale-admin-btn"
                  onClick={onNavigateAdminB2B}
                >
                  <Building2 size={15} /> Manage Wholesale Catalog
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Wholesale Catalog Section ── */}
      <section className="wholesale-catalog-section">
        <div className="wholesale-container">
          <div className="wholesale-section-top">
            <div>
              <span className="sec-eyebrow">CATALOG</span>
              <h2 className="sec-title">Wholesale Products</h2>
            </div>

            {/* Quick Search */}
            <div className="wholesale-search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search wholesale items..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="wholesale-category-tabs">
            {B2B_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`wholesale-cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="wholesale-count-strip">
            <span>
              Showing <strong>{filteredProducts.length}</strong> wholesale products
            </span>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="wholesale-loading-box">
              <div className="wholesale-spinner" />
              <p>Loading wholesale catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="wholesale-empty-box">
              <Package size={48} strokeWidth={1.5} style={{ color: 'var(--teal)' }} />
              <h3>No Wholesale Products Found</h3>
              <p>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try selecting a different category or clearing the search.'
                  : 'No wholesale items in catalog yet. Admins can add products via the Wholesale Admin portal.'}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  className="wholesale-btn-reset"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="wholesale-grid">
              {filteredProducts.map((p) => (
                <WholesaleProductCard
                  key={p.id || p._id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact Us Modal (Portaled to document.body) ── */}
      {isContactModalOpen && createPortal(
        <div
          className="wholesale-modal-overlay"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            className="wholesale-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wholesale-modal-header">
              <div>
                <h3>Contact Wholesale Desk</h3>
                <p>Have bulk questions or custom requests? Reach our team directly.</p>
              </div>
              <button
                type="button"
                className="wholesale-modal-close"
                onClick={() => setIsContactModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Direct Contact Channels */}
            <div className="wholesale-contact-channels">
              <a href="tel:+919876543210" className="contact-channel-pill">
                <Phone size={15} />
                <span>+91 98765 43210</span>
              </a>
              <a
                href="https://wa.me/919876543210?text=Hello%20Aai%20Prints%20Wholesale%20Team,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="contact-channel-pill whatsapp"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
              </a>
              <a href="mailto:wholesale@aaiprints.com" className="contact-channel-pill">
                <Mail size={15} />
                <span>wholesale@aaiprints.com</span>
              </a>
            </div>

            {/* Quick Contact Message Form */}
            {contactSubmitted ? (
              <div className="wholesale-contact-success">
                <CheckCircle2 size={36} style={{ color: '#059669' }} />
                <h4>Message Sent Successfully!</h4>
                <p>Our wholesale team has received your message and will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="wholesale-contact-form">
                <div className="form-field">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Your Message / Requirement *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us what you are looking for..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="wholesale-contact-submit">
                  <Send size={15} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
