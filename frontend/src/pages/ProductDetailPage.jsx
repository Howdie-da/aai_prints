import { useState, useEffect, useMemo } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import AdminEditProductModal from '../components/AdminEditProductModal';
import { api } from '../services/api';
import { normalizeProduct } from '../services/productService';
import './ProductDetailPage.css';

function StarRating({ rating, count }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill =
      i <= Math.floor(rating)
        ? 'full'
        : i - rating < 1 && i > Math.floor(rating)
        ? 'half'
        : 'empty';
    stars.push(
      <span key={i} className={`star star-${fill}`}>★</span>
    );
  }
  return (
    <div className="star-row" aria-label={`${rating} out of 5 stars, ${count} reviews`}>
      <span className="stars">{stars}</span>
      {count !== undefined && (
        <span className="review-count">
          {rating.toFixed(1)} ({count} customer {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}

export default function ProductDetailPage({
  product: initialProduct,
  allProducts = [],
  onNavigateHome,
  onNavigateShop,
  onSelectProduct,
  onProductUpdated,
  onProductDeleted
}) {
  const { isInWishlist, toggleWishlist, addToCart } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const [product, setProduct] = useState(initialProduct);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  const handleProductUpdated = (updated) => {
    const normalized = normalizeProduct(updated);
    setProduct(normalized);
    if (onProductUpdated) {
      onProductUpdated(normalized);
    }
  };

  const handleDirectDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}" from the database? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const targetId = product._id || product.id;
      await api.delete(`/products/${targetId}?hard=true`);
      if (onProductDeleted) {
        onProductDeleted(targetId);
      } else if (onNavigateShop) {
        onNavigateShop('All');
      }
    } catch (err) {
      alert(`Delete failed: ${err.data?.message || err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Selected quantity
  const [quantity, setQuantity] = useState(1);

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState(() => {
    return product?.variants && product.variants.length > 0 ? product.variants[0] : null;
  });

  // Active gallery image index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accordion active tab
  const [openAccordion, setOpenAccordion] = useState('description');

  // Add to Cart visual feedback state & duplicate click prevention
  const [addedToast, setAddedToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Zoom modal state
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setAddedToast(false);
    setIsAdding(false);
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  // Clean gallery images array: exclude placeholder pictures
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const rawList = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
    // Filter out any placeholder picture references
    return rawList.filter((img) => img && !img.includes('placeholder'));
  }, [product]);

  // Related products (same category or others, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const others = allProducts.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [product, allProducts]);

  // Calculate discount percentage if valid originalPrice exists
  const discountPercent = useMemo(() => {
    if (product?.originalPrice && product?.price) {
      const orig = parseFloat(String(product.originalPrice).replace(/,/g, ''));
      const curr = parseFloat(String(product.price).replace(/,/g, ''));
      if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
        return Math.round(((orig - curr) / orig) * 100);
      }
    }
    return null;
  }, [product?.price, product?.originalPrice]);

  if (!product) {
    return (
      <div className="pdp-not-found">
        <div className="pdp-container">
          <h2>Product Not Found</h2>
          <p>We couldn't find the product you're looking for.</p>
          <button type="button" className="btn-primary" onClick={() => onNavigateShop && onNavigateShop('All')}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Add to Cart with debounce to prevent duplicate clicks
  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);

    const itemToAdd = selectedVariant
      ? {
          ...product,
          variant: selectedVariant.label,
          variantId: selectedVariant.id,
        }
      : product;

    addToCart(itemToAdd, quantity);
    setAddedToast(true);

    setTimeout(() => {
      setAddedToast(false);
      setIsAdding(false);
    }, 2000);
  };

  const toggleAccordionSection = (sectionKey) => {
    setOpenAccordion((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const hasGalleryImages = galleryImages.length > 0;
  const currentImageSrc = hasGalleryImages ? galleryImages[activeImageIndex] : null;

  return (
    <div className="pdp-page">
      {/* ── 1. Breadcrumbs ── */}
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <div className="pdp-container">
          <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          <button
            type="button"
            className="breadcrumb-link"
            onClick={() => onNavigateShop && onNavigateShop('All')}
          >
            Shop
          </button>
          {product.category && (
            <>
              <span className="breadcrumb-separator">/</span>
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => onNavigateShop && onNavigateShop(product.category)}
              >
                {product.category}
              </button>
            </>
          )}
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </nav>

      {/* ── 2. Main Product Section (2-Column Desktop Layout) ── */}
      <section className="pdp-main-section">
        <div className="pdp-container">
          {isAdmin && (
            <div className="pdp-admin-bar">
              <div className="pdp-admin-badge">
                <span>🛡️ ADMIN ACCESS: Live Product Controls</span>
              </div>
              <div className="pdp-admin-actions">
                <button
                  type="button"
                  className="pdp-admin-btn pdp-admin-btn--edit"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  ✏️ Edit Product &amp; Photos
                </button>
                <button
                  type="button"
                  className="pdp-admin-btn pdp-admin-btn--delete"
                  onClick={handleDirectDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : '🗑️ Delete Product'}
                </button>
              </div>
            </div>
          )}

          <div className="pdp-grid">

          {/* ── LEFT COLUMN: Product Gallery ── */}
          <div className="pdp-gallery-wrap">
            {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
            {galleryImages.length > 1 && (
              <div className="pdp-thumbnails" role="tablist" aria-label="Product thumbnails">
                {galleryImages.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdp-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    role="tab"
                    aria-selected={idx === activeImageIndex}
                    aria-label={`Thumbnail ${idx + 1}`}
                  >
                    <img
                      src={imgSrc}
                      alt=""
                      className="pdp-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="pdp-main-image-box">
              {product.tag && (
                <div className={`pdp-badge pdp-badge--${product.tag.replace(/\s+/g, '-').toLowerCase()}`}>
                  {product.tag}
                </div>
              )}

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  className="pdp-gallery-arrow pdp-arrow-prev"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <div
                className="pdp-main-image-container"
                onClick={() => {
                  if (currentImageSrc) setIsZoomOpen(true);
                }}
                title={currentImageSrc ? "Click to view full image" : ""}
                role={currentImageSrc ? "button" : undefined}
                tabIndex={currentImageSrc ? 0 : undefined}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && currentImageSrc) {
                    e.preventDefault();
                    setIsZoomOpen(true);
                  }
                }}
              >
                {currentImageSrc ? (
                  <>
                    <img
                      src={currentImageSrc}
                      alt={product.name}
                      className="pdp-main-img"
                      loading="eager"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="pdp-zoom-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Click to Zoom
                    </span>
                  </>
                ) : (
                  <div className="pdp-main-image-empty" aria-hidden="true" />
                )}
              </div>

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  className="pdp-gallery-arrow pdp-arrow-next"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Product Information & Purchase ── */}
          <div className="pdp-info-wrap">
            {product.category && (
              <span className="pdp-category-tag">{product.category}</span>
            )}

            <h1 className="pdp-title">{product.name}</h1>

            {/* Rating (rendered only when authentic review data exists) */}
            {product.rating !== undefined && product.rating !== null && (
              <div className="pdp-rating-row">
                <StarRating rating={product.rating} count={product.reviews} />
              </div>
            )}

            {/* Price Presentation */}
            <div className="pdp-price-box">
              <span className="pdp-price">₹{product.price}</span>
              {product.originalPrice && (
                <span className="pdp-price-original">₹{product.originalPrice}</span>
              )}
              {discountPercent && (
                <span className="pdp-discount-badge">{discountPercent}% OFF</span>
              )}
              <span className="pdp-tax-note">Inclusive of all taxes</span>
            </div>

            {/* Stock / Dispatch status */}
            <div className="pdp-status-badge">
              <span className="pdp-status-dot" />
              <span>
                {product.availability === 'in_stock'
                  ? 'In Stock – Ready to Dispatch within 24–48 Hours'
                  : 'Available – Handcrafted on order'}
              </span>
            </div>

            {/* Description */}
            <p className="pdp-short-desc">
              {product.description ||
                'Thoughtfully handcrafted by Aai Prints artisans. Perfect for spiritual corners, living rooms, work desks, and car dashboards.'}
            </p>

            {/* Variants Selector (only rendered when real options exist) */}
            {product.variants && product.variants.length > 0 && (
              <div className="pdp-variants-section">
                <label className="pdp-variants-label">Available Options / Sizes:</label>
                <div className="pdp-variants-list" role="radiogroup" aria-label="Product options">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`pdp-variant-chip ${selectedVariant?.id === v.id ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(v)}
                      role="radio"
                      aria-checked={selectedVariant?.id === v.id}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pdp-qty-section">
              <label htmlFor="pdp-qty-input" className="pdp-qty-label">Quantity:</label>
              <div className="pdp-qty-control">
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  id="pdp-qty-input"
                  type="number"
                  className="pdp-qty-input"
                  value={quantity}
                  min="1"
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) setQuantity(val);
                  }}
                  aria-label="Product quantity"
                />
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pdp-actions">
              <button
                type="button"
                className={`pdp-btn-add-cart ${addedToast ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding}
                aria-label={addedToast ? "Product added to cart" : "Add product to cart"}
              >
                {addedToast ? (
                  <>✓ Added to Cart</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    ADD TO CART
                  </>
                )}
              </button>

              <button
                type="button"
                className={`pdp-btn-wishlist ${isFav ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={isFav ? '#e53935' : 'none'}
                  stroke={isFav ? '#e53935' : 'currentColor'}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isFav ? 'In Wishlist' : 'Wishlist'}
              </button>
            </div>

            {/* Value Highlights */}
            <div className="pdp-value-points">
              <div className="pdp-value-point">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div>
                  <strong>Standard Dispatch</strong>
                  <span>Handcrafted and dispatched within 24–48 hours</span>
                </div>
              </div>

              <div className="pdp-value-point">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <strong>Secure Packaging</strong>
                  <span>Shipped in reinforced multi-layer protective packaging</span>
                </div>
              </div>

              <div className="pdp-value-point">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <div>
                  <strong>Gift-Ready Presentation</strong>
                  <span>Artisanal presentation suitable for gifting</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        </div>
      </section>

      {/* ── 3. Expandable Accordions: Details, Specifications, Delivery ── */}
      <section className="pdp-accordions-section">
        <div className="pdp-container">
          <div className="pdp-accordions-card">

            {/* 1. Description */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className={`pdp-accordion-header ${openAccordion === 'description' ? 'active' : ''}`}
                onClick={() => toggleAccordionSection('description')}
                aria-expanded={openAccordion === 'description'}
              >
                <span>Description &amp; Artistic Craftsmanship</span>
                <span className="pdp-accordion-icon">{openAccordion === 'description' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'description' && (
                <div className="pdp-accordion-content">
                  <p>
                    Experience the timeless beauty of the <strong>{product.name}</strong> from Aai Prints.
                    Each piece is thoughtfully produced using high-precision craftsmanship and durable finishes.
                  </p>
                  <p>
                    {product.description ||
                      'Designed to infuse serene spiritual aura and aesthetic elegance into temples, living rooms, and office entrances.'}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Specifications Table */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className={`pdp-accordion-header ${openAccordion === 'specs' ? 'active' : ''}`}
                onClick={() => toggleAccordionSection('specs')}
                aria-expanded={openAccordion === 'specs'}
              >
                <span>Specifications &amp; Dimensions</span>
                <span className="pdp-accordion-icon">{openAccordion === 'specs' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'specs' && (
                <div className="pdp-accordion-content">
                  <table className="pdp-specs-table">
                    <tbody>
                      <tr>
                        <th>Brand</th>
                        <td>Aai Prints</td>
                      </tr>
                      <tr>
                        <th>Product ID</th>
                        <td>AAP-{String(product.id).padStart(4, '0')}</td>
                      </tr>
                      {product.category && (
                        <tr>
                          <th>Category</th>
                          <td>{product.category}</td>
                        </tr>
                      )}
                      {product.subcategory && (
                        <tr>
                          <th>Subcategory</th>
                          <td>{product.subcategory}</td>
                        </tr>
                      )}
                      {product.specifications &&
                        Object.entries(product.specifications).map(([key, val]) => (
                          <tr key={key}>
                            <th style={{ textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </th>
                            <td>{val}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. Delivery & Dispatch Area */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className={`pdp-accordion-header ${openAccordion === 'delivery' ? 'active' : ''}`}
                onClick={() => toggleAccordionSection('delivery')}
                aria-expanded={openAccordion === 'delivery'}
              >
                <span>Delivery &amp; Packaging Details</span>
                <span className="pdp-accordion-icon">{openAccordion === 'delivery' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'delivery' && (
                <div className="pdp-accordion-content">
                  <p>
                    <strong>Dispatch:</strong> Orders are packaged and dispatched within 24 to 48 business hours.
                  </p>
                  <p>
                    <strong>Protective Packaging:</strong> Items are encased in corner-protected, shock-absorbent packaging to ensure safe transit.
                  </p>
                  <p>
                    <strong>Tracking:</strong> A live shipment tracking link is shared via SMS and Email once the order is handed to the delivery courier.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Related Products Section ── */}
      {relatedProducts.length > 0 && (
        <section className="pdp-related-section">
          <div className="pdp-container">
            <h2 className="pdp-related-title">You May Also Like</h2>
            <p className="pdp-related-subtitle">Carefully matched pieces from our handcrafted decor collection</p>

            <div className="pdp-related-grid">
              {relatedProducts.map((rel) => {
                const relFav = isInWishlist(rel.id);
                const relHasImg = Boolean(rel.image && !rel.image.includes('placeholder'));

                return (
                  <article key={rel.id} className="pdp-rel-card">
                    {rel.tag && (
                      <div className={`prod-tag prod-tag--${rel.tag.replace(/\s+/g, '-').toLowerCase()}`}>
                        {rel.tag}
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      className={`prod-wishlist-btn ${relFav ? 'is-active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(rel);
                      }}
                      aria-label={relFav ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={relFav ? '#e53935' : 'none'}
                        stroke={relFav ? '#e53935' : '#444'}
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* Related Image Area */}
                    <div
                      className="pdp-rel-img-wrap"
                      onClick={() => onSelectProduct && onSelectProduct(rel)}
                      title={rel.name}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectProduct && onSelectProduct(rel);
                        }
                      }}
                    >
                      {relHasImg ? (
                        <img
                          src={rel.image}
                          alt={rel.name}
                          className="pdp-rel-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="pdp-rel-img-empty" aria-hidden="true" />
                      )}
                    </div>

                    <div className="pdp-rel-info">
                      <span className="pdp-rel-cat">{rel.category}</span>
                      <h3
                        className="pdp-rel-name"
                        onClick={() => onSelectProduct && onSelectProduct(rel)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectProduct && onSelectProduct(rel);
                          }
                        }}
                      >
                        {rel.name}
                      </h3>
                      <div className="pdp-rel-price">₹{rel.price}</div>
                      <button
                        type="button"
                        className="pdp-rel-view-btn"
                        onClick={() => onSelectProduct && onSelectProduct(rel)}
                      >
                        View Product →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Zoom Modal ── */}
      {isZoomOpen && currentImageSrc && (
        <div className="pdp-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <div className="pdp-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pdp-zoom-close"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Close zoomed view"
            >
              ✕
            </button>
            <img
              src={currentImageSrc}
              alt={product.name}
              className="pdp-zoom-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="pdp-zoom-caption">{product.name}</p>
          </div>
        </div>
      )}

      {/* ── 6. Admin Edit Product Modal ── */}
      {isAdmin && (
        <AdminEditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product}
          onProductUpdated={handleProductUpdated}
          onProductDeleted={(deletedId) => {
            if (onProductDeleted) onProductDeleted(deletedId);
            else if (onNavigateShop) onNavigateShop('All');
          }}
        />
      )}
    </div>
  );
}
