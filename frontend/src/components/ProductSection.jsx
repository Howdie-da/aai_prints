import { useState } from 'react';
import { Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './ProductSection.css';

function StarRating({ rating = 5.0, count }) {
  return (
    <div className="star-row" aria-label={`${rating} out of 5 stars${count ? `, ${count} reviews` : ''}`}>
      <span className="stars" style={{ display: 'inline-flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={12}
            strokeWidth={1.8}
            fill={i <= Math.floor(rating) ? 'var(--star-gold)' : '#e4cbba'}
            color={i <= Math.floor(rating) ? 'var(--star-gold)' : '#d6b9a3'}
          />
        ))}
      </span>
      <span className="rating-score">{Number(rating).toFixed(1)}</span>
      {count !== undefined && <span className="review-count">({count})</span>}
    </div>
  );
}

/**
 * Reusable ProductSection – displays a luxury responsive grid of home decor product cards.
 * Hardware-accelerated CSS hover transitions for smooth 60fps performance without JS layout thrashing.
 */
export default function ProductSection({
  title,
  subtitle,
  products,
  sectionId,
  onSelectProduct,
  onViewMore,
}) {
  const { isInWishlist, toggleWishlist, addToCart } = useWishlist();
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="prod-section" id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <div className="section-wrap">
        <div className="sec-header">
          <span className="sec-eyebrow">ARTISAN CRAFTSMANSHIP</span>
          <h2 className="sec-title" id={`${sectionId}-title`}>{title}</h2>
          {subtitle && <p className="sec-subtitle">{subtitle}</p>}
        </div>

        <div className="prod-grid">
          {products.map((p) => {
            const isFav = isInWishlist(p.id);
            const isAdded = Boolean(addedIds[p.id]);
            const productHref = `#/product/${p.slug || p.id}`;

            const handleProductClick = (e) => {
              if (onSelectProduct) {
                e.preventDefault();
                onSelectProduct(p);
              }
            };

            // Calculate authentic discount percentage and savings
            let discountPercent = null;
            let savingsAmount = null;
            if (p.originalPrice && p.price) {
              const orig = parseFloat(String(p.originalPrice).replace(/,/g, ''));
              const curr = parseFloat(String(p.price).replace(/,/g, ''));
              if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
                discountPercent = Math.round(((orig - curr) / orig) * 100);
                savingsAmount = Math.round(orig - curr);
              }
            }

            const primaryImg = p.image || (p.images && p.images[0]) || '/new-images/product-placeholder.jpg';
            const secondaryImg = p.images && p.images.length > 1 ? p.images[1] : null;

            return (
              <article
                key={p.id}
                id={`product-${p.id}`}
                className="prod-card"
                aria-label={p.name}
              >
                {/* Floating Tags (New Arrival, Best Seller, Handcrafted) */}
                <div className="prod-badge-dock">
                  {p.tag && (
                    <span className={`prod-tag prod-tag--${p.tag.replace(/\s+/g, '-').toLowerCase()}`}>
                      {p.tag}
                    </span>
                  )}
                  {discountPercent !== null && (
                    <span className="prod-save-pill">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist Heart Action */}
                <button
                  type="button"
                  className={`prod-wishlist-btn ${isFav ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                  aria-label={isFav ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                  title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={18}
                    strokeWidth={2}
                    fill={isFav ? '#dc2626' : 'none'}
                    color={isFav ? '#dc2626' : '#374151'}
                    className="prod-wishlist-heart"
                  />
                </button>

                {/* Museum Image Well with Secondary Photo Reveal */}
                <a
                  href={productHref}
                  className="prod-img-wrap"
                  onClick={handleProductClick}
                  tabIndex={0}
                  aria-label={`View ${p.name}`}
                >
                  <div className="prod-img-inner">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="prod-img prod-img-primary"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {secondaryImg && (
                      <img
                        src={secondaryImg}
                        alt={`${p.name} alternate view`}
                        className="prod-img prod-img-secondary"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </a>

                {/* Card Info Details */}
                <div className="prod-info">
                  {p.subcategory && (
                    <span className="prod-cat-crumb">{p.subcategory}</span>
                  )}

                  <h3 className="prod-name">
                    <a href={productHref} onClick={handleProductClick} title={p.name}>
                      {p.name}
                    </a>
                  </h3>

                  <StarRating rating={p.rating || 4.9} count={p.reviews || 28} />

                  <div className="prod-price-row">
                    <div className="price-group">
                      <span className="prod-price">₹{p.price}</span>
                      {p.originalPrice && (
                        <span className="prod-orig-price">₹{p.originalPrice}</span>
                      )}
                    </div>
                    {savingsAmount && (
                      <span className="prod-savings-text">Save ₹{savingsAmount}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`prod-cart-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => handleAddToCart(p)}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    <ShoppingBag size={15} strokeWidth={2.2} style={{ marginRight: '6px' }} />
                    <span>{isAdded ? 'Added to Cart ✓' : 'Add to Cart'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="sec-view-more-wrap">
          <button
            type="button"
            className="btn-view-more"
            onClick={onViewMore || (() => { window.location.hash = '#/shop'; })}
            aria-label={`View more ${title}`}
          >
            <span>VIEW MORE {title.toUpperCase()}</span>
            <ArrowRight size={14} strokeWidth={2.4} style={{ marginLeft: '6px' }} />
          </button>
        </div>
      </div>
    </section>
  );
}
