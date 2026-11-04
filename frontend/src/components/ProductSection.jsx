import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import './ProductSection.css';

function StarRating({ rating, count }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = i <= Math.floor(rating)
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
      {count !== undefined && <span className="review-count">{count} reviews</span>}
    </div>
  );
}

/**
 * Reusable ProductSection – displays a responsive grid of home décor product cards.
 * Props:
 *   title           – section heading (e.g. "Devotional Décor")
 *   subtitle        – category tag cloud under heading
 *   products        – array of product objects
 *   sectionId       – anchor id
 *   onSelectProduct – handler to open product detail page
 *   onViewMore      – handler to navigate to corresponding shop category
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

  return (
    <section className="prod-section" id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <div className="section-wrap">
        <h2 className="sec-title" id={`${sectionId}-title`}>{title}</h2>
        {subtitle && <p className="sec-subtitle">{subtitle}</p>}

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

            // Calculate discount percentage if authentic original price exists and exceeds price
            let discountPercent = null;
            if (p.originalPrice && p.price) {
              const orig = parseFloat(String(p.originalPrice).replace(/,/g, ''));
              const curr = parseFloat(String(p.price).replace(/,/g, ''));
              if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
                discountPercent = Math.round(((orig - curr) / orig) * 100);
              }
            }

            const hasValidImage = Boolean(
              p.image &&
              !p.image.includes('placeholder') &&
              typeof p.image === 'string' &&
              p.image.trim() !== ''
            );

            return (
              <article key={p.id} id={`product-${p.id}`} className="prod-card" aria-label={p.name}>
                {/* Tags (New Arrival, Best Seller) */}
                {p.tag && (
                  <div className={`prod-tag prod-tag--${p.tag.replace(/\s+/g, '-').toLowerCase()}`}>
                    {p.tag}
                  </div>
                )}

                {/* Wishlist Heart Icon – positioned in the top-right corner of the image */}
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
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isFav ? '#e53935' : 'none'}
                    stroke={isFav ? '#e53935' : '#444'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="prod-wishlist-heart"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                {/* Product Image */}
                <a
                  href={productHref}
                  className="prod-img-wrap"
                  onClick={handleProductClick}
                  tabIndex={0}
                  aria-label={`View ${p.name}`}
                >
                  {hasValidImage ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="prod-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="prod-img-empty" aria-hidden="true" />
                  )}
                </a>

                {/* Card Info */}
                <div className="prod-info">
                  <h3 className="prod-name">
                    <a href={productHref} onClick={handleProductClick}>
                      {p.name}
                    </a>
                  </h3>

                  {p.rating !== undefined && (
                    <StarRating rating={p.rating} count={p.reviews} />
                  )}

                  <div className="prod-price-row">
                    <span className="prod-price">₹{p.price}</span>
                    {p.originalPrice && (
                      <span className="prod-orig-price">₹{p.originalPrice}</span>
                    )}
                    {discountPercent !== null && (
                      <span className="prod-discount">{discountPercent}% OFF</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`prod-cart-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => handleAddToCart(p)}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    {isAdded ? 'Added to Cart ✓' : 'Add to Cart'}
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
            VIEW MORE {title.toUpperCase()} →
          </button>
        </div>
      </div>
    </section>
  );
}
