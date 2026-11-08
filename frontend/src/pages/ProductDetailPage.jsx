import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Package,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
  Edit3,
  Trash2,
  Check,
  ArrowRight,
} from 'lucide-react';
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

  // Lock body scroll and listen for Escape key when zoom modal is open
  useEffect(() => {
    if (isZoomOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsZoomOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isZoomOpen]);

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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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
                <ShieldCheck size={16} />
                <span>ADMIN ACCESS: Live Product Controls</span>
              </div>
              <div className="pdp-admin-actions">
                <button
                  type="button"
                  className="pdp-admin-btn pdp-admin-btn--edit"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit3 size={15} /> Edit Product &amp; Photos
                </button>
                <button
                  type="button"
                  className="pdp-admin-btn pdp-admin-btn--delete"
                  onClick={handleDirectDelete}
                  disabled={isDeleting}
                >
                  <Trash2 size={15} /> {isDeleting ? 'Deleting...' : 'Delete Product'}
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
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
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
                    </motion.button>
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
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                )}

                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    className="pdp-gallery-arrow pdp-arrow-next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
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
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeImageIndex}
                          src={currentImageSrc}
                          alt={product.name}
                          className="pdp-main-img"
                          loading="eager"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </AnimatePresence>
                      <span className="pdp-zoom-hint">
                        <ZoomIn size={14} />
                        Click to Zoom
                      </span>
                    </>
                  ) : (
                    <div className="pdp-main-image-empty" aria-hidden="true" />
                  )}
                </div>
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
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        key={v.id}
                        type="button"
                        className={`pdp-variant-chip ${selectedVariant?.id === v.id ? 'active' : ''}`}
                        onClick={() => setSelectedVariant(v)}
                        role="radio"
                        aria-checked={selectedVariant?.id === v.id}
                      >
                        {v.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="pdp-qty-section">
                <label htmlFor="pdp-qty-input" className="pdp-qty-label">Quantity:</label>
                <div className="pdp-qty-control">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    type="button"
                    className="pdp-qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </motion.button>
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
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    type="button"
                    className="pdp-qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="pdp-actions">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className={`pdp-btn-add-cart ${addedToast ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  aria-label={addedToast ? "Product added to cart" : "Add product to cart"}
                >
                  {addedToast ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={16} strokeWidth={2.5} /> Added to Cart
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingBag size={18} /> ADD TO CART
                    </span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className={`pdp-btn-wishlist ${isFav ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={18}
                    fill={isFav ? '#e53935' : 'none'}
                    stroke={isFav ? '#e53935' : 'currentColor'}
                    strokeWidth={2}
                  />
                  {isFav ? 'In Wishlist' : 'Wishlist'}
                </motion.button>
              </div>

              {/* Value Highlights */}
              <div className="pdp-value-points">
                <div className="pdp-value-point">
                  <Truck size={18} />
                  <div>
                    <strong>Standard Dispatch</strong>
                    <span>Handcrafted and dispatched within 24–48 hours</span>
                  </div>
                </div>

                <div className="pdp-value-point">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Secure Packaging</strong>
                    <span>Shipped in reinforced multi-layer protective packaging</span>
                  </div>
                </div>

                <div className="pdp-value-point">
                  <Package size={18} />
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
                <span className="pdp-accordion-icon">
                  {openAccordion === 'description' ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              <AnimatePresence>
                {openAccordion === 'description' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="pdp-accordion-content"
                    style={{ overflow: 'hidden' }}
                  >
                    <p>
                      Experience the timeless beauty of the <strong>{product.name}</strong> from Aai Prints.
                      Each piece is thoughtfully produced using high-precision craftsmanship and durable finishes.
                    </p>
                    <p>
                      {product.description ||
                        'Designed to infuse serene spiritual aura and aesthetic elegance into temples, living rooms, and office entrances.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <span className="pdp-accordion-icon">
                  {openAccordion === 'specs' ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              <AnimatePresence>
                {openAccordion === 'specs' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="pdp-accordion-content"
                    style={{ overflow: 'hidden' }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
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
                <span className="pdp-accordion-icon">
                  {openAccordion === 'delivery' ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              <AnimatePresence>
                {openAccordion === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="pdp-accordion-content"
                    style={{ overflow: 'hidden' }}
                  >
                    <p>
                      <strong>Dispatch:</strong> Orders are packaged and dispatched within 24 to 48 business hours.
                    </p>
                    <p>
                      <strong>Protective Packaging:</strong> Items are encased in corner-protected, shock-absorbent packaging to ensure safe transit.
                    </p>
                    <p>
                      <strong>Tracking:</strong> A live shipment tracking link is shared via SMS and Email once the order is handed to the delivery courier.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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
                      <Heart
                        size={18}
                        fill={relFav ? '#e53935' : 'none'}
                        stroke={relFav ? '#e53935' : '#444'}
                        strokeWidth={2}
                      />
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>View Product</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Zoom Modal (Portaled to document.body to guarantee 100vw/100vh viewport coverage) ── */}
      {isZoomOpen && currentImageSrc && createPortal(
        <div className="pdp-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <div className="pdp-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pdp-zoom-close"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Close zoomed view"
            >
              <X size={20} strokeWidth={2} />
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
        </div>,
        document.body
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
