import { useState, useMemo, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import './ShopPage.css';

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
      {count !== undefined && <span className="review-count">({count})</span>}
    </div>
  );
}

export default function ShopPage({
  products = [],
  selectedCategory = 'All',
  onSelectCategory,
  onNavigateHome,
  onSelectProduct,
}) {
  const { isInWishlist, toggleWishlist, addToCart } = useWishlist();

  // Filter & Sort States
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'All');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedIds, setAddedIds] = useState({});

  // Sync activeCategory when selectedCategory prop changes
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
      setActiveSubcategory('');
    }
  }, [selectedCategory]);

  // Extract unique categories from actual products
  const categoryList = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Map subcategories per category
  const subcategoryMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.category && p.subcategory) {
        if (!map[p.category]) map[p.category] = new Set();
        map[p.category].add(p.subcategory);
      }
    });
    const result = {};
    Object.keys(map).forEach((cat) => {
      result[cat] = Array.from(map[cat]);
    });
    return result;
  }, [products]);

  // Price range bounds
  const priceBounds = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    products.forEach((p) => {
      const val = parseFloat(String(p.price).replace(/,/g, ''));
      if (!isNaN(val)) {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    });
    return {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 2000 : max,
    };
  }, [products]);

  // Handle Add to Cart with visual feedback
  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Category / Collection Filter
    if (activeCategory && activeCategory !== 'All') {
      const target = activeCategory.toLowerCase().trim();
      result = result.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const name = (p.name || '').toLowerCase();

        // Direct category or subcategory match
        if (cat === target || sub === target) return true;

        // Devotional collection umbrella
        if (target === 'devotional' || target === 'devotional décor' || target === 'devotional decor') {
          return (
            cat === 'backlit led frames' ||
            cat === 'desk standees' ||
            cat === 'wall hangings' ||
            sub.includes('spiritual') ||
            sub.includes('devotional') ||
            sub.includes('sacred')
          );
        }

        // Idols & Tabletop subcategory under Devotional
        if (target === 'idols & tabletop' || target === 'idols and tabletop') {
          return (
            cat === 'dashboard idols' ||
            cat === 'desk standees' ||
            sub.includes('model') ||
            sub.includes('idol') ||
            name.includes('idol') ||
            name.includes('mandir')
          );
        }

        // Yantra & Chakra subcategory under Devotional
        if (target === 'yantra & chakra' || target === 'yantra and chakra') {
          return (
            sub.includes('yantra') ||
            name.includes('yantra') ||
            cat === 'wall hangings'
          );
        }

        // Car décor collection umbrella
        if (target === 'car décor' || target === 'car decor') {
          return cat === 'dashboard idols' || cat === 'car hangings' || sub.includes('car');
        }

        // Combo Sets subcategory under Car Décor
        if (target === 'combo sets' || target === 'combo') {
          return (
            sub.includes('combo') ||
            name.includes('combo') ||
            name.includes('set') ||
            cat === 'dashboard idols' ||
            cat === 'car hangings'
          );
        }

        // Wall décor collection umbrella
        if (target === 'wall décor' || target === 'wall decor') {
          return (
            cat === 'metal wall art' ||
            cat === 'wall clocks' ||
            cat === 'wall hangings' ||
            cat === 'backlit led frames'
          );
        }

        // Framed wall art alias
        if (target === 'framed wall art' || target === 'framed art') {
          return cat === 'backlit led frames' || name.includes('frame') || sub.includes('frame');
        }

        // Ganesh Chaturthi subcategory under Festive
        if (target === 'ganesh chaturthi' || target === 'ganesha') {
          return name.includes('ganesh') || sub.includes('spiritual');
        }

        // Jhanki Sets subcategory under Festive
        if (target === 'jhanki sets' || target === 'jhanki') {
          return sub.includes('model') || name.includes('mandir') || cat === 'desk standees';
        }

        // Diwali subcategory under Festive
        if (target === 'diwali') {
          return cat === 'backlit led frames' || sub.includes('lighting') || sub.includes('festive');
        }

        // Gifts / festive umbrella
          if (target === 'gifts' || target === 'festive') {
            return (
              cat === 'desk standees' ||
              cat === 'dashboard idols' ||
              sub.includes('festive') ||
              sub.includes('model') ||
              name.includes('set')
            );
          }

          // Gift Combos subcategory under Gifts
          if (target === 'gift combos') {
            return (
              name.includes('combo') ||
              name.includes('set') ||
              sub.includes('model') ||
              cat === 'dashboard idols'
            );
          }

          // Return Gifts subcategory under Gifts
          if (target === 'return gifts') {
            return cat === 'car hangings' || cat === 'desk standees';
          }

          return false;
        });
    }

    // 2. Specific Subcategory Filter
    if (activeSubcategory) {
      const subTarget = activeSubcategory.toLowerCase().trim();
      result = result.filter(
        (p) => (p.subcategory || '').toLowerCase().trim() === subTarget
      );
    }

    // 3. Search Filter (case-insensitive name, category, and subcategory search)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.category && p.category.toLowerCase().includes(query)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(query))
      );
    }

    // 4. Price Filter
    if (minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter((p) => {
          const priceVal = parseFloat(String(p.price).replace(/,/g, ''));
          return priceVal >= min;
        });
      }
    }

    if (maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter((p) => {
          const priceVal = parseFloat(String(p.price).replace(/,/g, ''));
          return priceVal <= max;
        });
      }
    }

    // 5. Sorting
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => {
          const pa = parseFloat(String(a.price).replace(/,/g, ''));
          const pb = parseFloat(String(b.price).replace(/,/g, ''));
          return pa - pb;
        });
        break;

      case 'price-high-low':
        result.sort((a, b) => {
          const pa = parseFloat(String(a.price).replace(/,/g, ''));
          const pb = parseFloat(String(b.price).replace(/,/g, ''));
          return pb - pa;
        });
        break;

      case 'alpha-a-z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'best-selling':
        result.sort((a, b) => {
          const aBest = a.tag === 'Best Seller' ? 1 : 0;
          const bBest = b.tag === 'Best Seller' ? 1 : 0;
          if (bBest !== aBest) return bBest - aBest;
          return (b.reviews || 0) - (a.reviews || 0);
        });
        break;

      case 'newest':
        result.sort((a, b) => {
          const aNew = a.tag === 'New Arrival' ? 1 : 0;
          const bNew = b.tag === 'New Arrival' ? 1 : 0;
          if (bNew !== aNew) return bNew - aNew;
          return b.id - a.id;
        });
        break;

      case 'featured':
      default:
        // Default catalogue order
        break;
    }

    return result;
  }, [products, activeCategory, activeSubcategory, searchQuery, minPrice, maxPrice, sortBy]);

  // Clear all filters
  const handleClearFilters = () => {
    setActiveCategory('All');
    setActiveSubcategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    if (onSelectCategory) onSelectCategory('All');
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    activeSubcategory !== '' ||
    searchQuery.trim() !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'featured';

  const changeCategory = (cat) => {
    setActiveCategory(cat);
    setActiveSubcategory('');
    if (onSelectCategory) onSelectCategory(cat);
    setMobileFilterOpen(false);
  };

  const changeSubcategory = (sub) => {
    setActiveSubcategory(sub === activeSubcategory ? '' : sub);
    setMobileFilterOpen(false);
  };

  // Compute active category title for header and breadcrumb
  const displayTitle = activeSubcategory
    ? activeSubcategory
    : activeCategory === 'All'
      ? 'Shop All Products'
      : activeCategory;

  return (
    <div className="shop-page">
      {/* ── 1. Breadcrumb Navigation ── */}
      <nav className="shop-breadcrumb" aria-label="Breadcrumb">
        <div className="shop-container">
          <button type="button" className="breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          {activeCategory !== 'All' ? (
            <>
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => changeCategory('All')}
              >
                Shop
              </button>
              <span className="breadcrumb-separator">/</span>
              {activeSubcategory ? (
                <>
                  <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => setActiveSubcategory('')}
                  >
                    {activeCategory}
                  </button>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">{activeSubcategory}</span>
                </>
              ) : (
                <span className="breadcrumb-current">{activeCategory}</span>
              )}
            </>
          ) : (
            <span className="breadcrumb-current">Shop</span>
          )}
        </div>
      </nav>

      <div className="shop-container">
        {/* ── 2. Page Header ── */}
        <header className="shop-header">
          <div className="shop-header-text">
            <h1 className="shop-title">{displayTitle}</h1>
            <p className="shop-subtitle">
              {activeCategory === 'All'
                ? 'Explore authentic devotional idols, handcrafted wall hangings, and designer décor for your home and car.'
                : `Handcrafted ${displayTitle.toLowerCase()} collection with authentic artisanal finishes.`}
            </p>
          </div>
          <div className="shop-header-count">
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
          </div>
        </header>

        {/* ── 3. Top Control Bar (Search, Mobile Filter Trigger, Sort) ── */}
        <div className="shop-controls-bar">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            className="mobile-filter-trigger"
            onClick={() => setMobileFilterOpen(true)}
            aria-label="Open filter sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filter &amp; Refine</span>
            {hasActiveFilters && <span className="filter-active-dot" />}
          </button>

          {/* Quick Search */}
          <div className="shop-search-box">
            <svg className="shop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="shop-search-input"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter products by name"
            />
            {searchQuery && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="shop-sort-box">
            <label htmlFor="shop-sort-select" className="shop-sort-label">Sort by:</label>
            <select
              id="shop-sort-select"
              className="shop-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="best-selling">Best Selling</option>
              <option value="newest">Newest</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="alpha-a-z">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* ── 4. Active Filter Chips Strip ── */}
        {hasActiveFilters && (
          <div className="active-filters-strip">
            <span className="active-filters-label">Active filters:</span>
            {activeCategory !== 'All' && (
              <span className="filter-chip">
                {activeCategory}
                <button
                  type="button"
                  onClick={() => changeCategory('All')}
                  aria-label={`Remove category filter ${activeCategory}`}
                >
                  ✕
                </button>
              </span>
            )}
            {activeSubcategory && (
              <span className="filter-chip filter-chip--sub">
                {activeSubcategory}
                <button
                  type="button"
                  onClick={() => setActiveSubcategory('')}
                  aria-label={`Remove subcategory filter ${activeSubcategory}`}
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="filter-chip">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search filter"
                >
                  ✕
                </button>
              </span>
            )}
            {(minPrice !== '' || maxPrice !== '') && (
              <span className="filter-chip">
                ₹{minPrice || priceBounds.min} – ₹{maxPrice || priceBounds.max}
                <button
                  type="button"
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  aria-label="Reset price filter"
                >
                  ✕
                </button>
              </span>
            )}
            {sortBy !== 'featured' && (
              <span className="filter-chip">
                Sort: {sortBy.replace(/-/g, ' ')}
                <button
                  type="button"
                  onClick={() => setSortBy('featured')}
                  aria-label="Reset sort order"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* ── 5. Main Content: Sidebar + Product Grid ── */}
        <div className="shop-layout">
          {/* Desktop Filter Sidebar */}
          <aside className="shop-sidebar" aria-label="Product filters">
            {/* Category Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <h3 className="filter-group-title">Categories</h3>
                {activeCategory !== 'All' && (
                  <button
                    type="button"
                    className="filter-reset-link"
                    onClick={() => changeCategory('All')}
                  >
                    Reset
                  </button>
                )}
              </div>
              <ul className="category-filter-list">
                {categoryList.map((cat) => {
                  const count = cat === 'All'
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                  const isCatActive = activeCategory === cat;
                  const subcats = subcategoryMap[cat] || [];

                  return (
                    <li key={cat} className="category-filter-node">
                      <button
                        type="button"
                        className={`category-filter-item ${isCatActive ? 'active' : ''}`}
                        onClick={() => changeCategory(cat)}
                      >
                        <span className="cat-name">{cat}</span>
                        <span className="cat-count">({count})</span>
                      </button>

                      {/* Subcategories (visible when category is active) */}
                      {isCatActive && subcats.length > 0 && (
                        <ul className="subcategory-filter-list">
                          {subcats.map((sub) => {
                            const subCount = products.filter(
                              (p) => p.category === cat && p.subcategory === sub
                            ).length;
                            const isSubActive = activeSubcategory === sub;

                            return (
                              <li key={sub}>
                                <button
                                  type="button"
                                  className={`subcategory-filter-item ${isSubActive ? 'active' : ''}`}
                                  onClick={() => changeSubcategory(sub)}
                                >
                                  <span className="sub-bullet" />
                                  <span className="sub-name">{sub}</span>
                                  <span className="sub-count">({subCount})</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <h3 className="filter-group-title">Price Range</h3>
                {(minPrice !== '' || maxPrice !== '') && (
                  <button
                    type="button"
                    className="filter-reset-link"
                    onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="price-inputs-row">
                <div className="price-field">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    min={priceBounds.min}
                    max={priceBounds.max}
                    onChange={(e) => setMinPrice(e.target.value)}
                    aria-label="Minimum price"
                  />
                </div>
                <span className="price-to-separator">to</span>
                <div className="price-field">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    min={priceBounds.min}
                    max={priceBounds.max}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    aria-label="Maximum price"
                  />
                </div>
              </div>

              {/* Quick Price Bracket Chips */}
              <div className="price-quick-chips">
                <button
                  type="button"
                  className={`price-chip ${minPrice === '' && maxPrice === '' ? 'active' : ''}`}
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                >
                  All Prices
                </button>
                <button
                  type="button"
                  className={`price-chip ${maxPrice === '500' && minPrice === '' ? 'active' : ''}`}
                  onClick={() => { setMinPrice(''); setMaxPrice('500'); }}
                >
                  Under ₹500
                </button>
                <button
                  type="button"
                  className={`price-chip ${minPrice === '500' && maxPrice === '1000' ? 'active' : ''}`}
                  onClick={() => { setMinPrice('500'); setMaxPrice('1000'); }}
                >
                  ₹500 – ₹1,000
                </button>
                <button
                  type="button"
                  className={`price-chip ${minPrice === '1000' && maxPrice === '' ? 'active' : ''}`}
                  onClick={() => { setMinPrice('1000'); setMaxPrice(''); }}
                >
                  Above ₹1,000
                </button>
              </div>
            </div>

            {/* Sidebar Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="sidebar-reset-btn"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            )}
          </aside>

          {/* Products Grid Content Area */}
          <main className="shop-products-area">
            {filteredProducts.length === 0 ? (
              searchQuery.trim() ? (
                /* No search results state */
                <div className="shop-no-results">
                  <div className="no-results-icon" aria-hidden="true">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h3 className="no-results-title">No search results</h3>
                  <p className="no-results-desc">
                    We couldn't find any products matching <strong>"{searchQuery}"</strong>. Please check your spelling or clear your search term.
                  </p>
                  <div className="no-results-actions">
                    <button
                      type="button"
                      className="no-results-btn no-results-btn--primary"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </button>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="no-results-btn no-results-btn--secondary"
                        onClick={handleClearFilters}
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* No filter matches state */
                <div className="shop-no-results">
                  <div className="no-results-icon" aria-hidden="true">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="4" y1="21" x2="4" y2="14" />
                      <line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" />
                      <line x1="20" y1="12" x2="20" y2="3" />
                    </svg>
                  </div>
                  <h3 className="no-results-title">No products match your filters</h3>
                  <p className="no-results-desc">
                    No products currently match your selected price range or category combinations. Try broadening your criteria.
                  </p>
                  <button
                    type="button"
                    className="no-results-btn no-results-btn--primary"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              )
            ) : (
              <div className="shop-grid">
                {filteredProducts.map((p) => {
                  const isFav = isInWishlist(p.id);
                  const hasImage = Boolean(p.image && !p.image.includes('placeholder'));

                  // Calculate discount percentage if originalPrice exists
                  let discountPercent = null;
                  if (p.originalPrice && p.price) {
                    const orig = parseFloat(String(p.originalPrice).replace(/,/g, ''));
                    const curr = parseFloat(String(p.price).replace(/,/g, ''));
                    if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
                      discountPercent = Math.round(((orig - curr) / orig) * 100);
                    }
                  }

                  return (
                    <article key={p.id} id={`product-${p.id}`} className="shop-card" aria-label={p.name}>
                      {/* Product Tag */}
                      {p.tag && (
                        <div className={`prod-tag prod-tag--${p.tag.replace(/\s+/g, '-').toLowerCase()}`}>
                          {p.tag}
                        </div>
                      )}

                      {/* Wishlist Heart Button */}
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

                      {/* Product Image Area - Clean aspect ratio container without broken icons */}
                      <div
                        className="shop-card-img-wrap"
                        onClick={() => onSelectProduct && onSelectProduct(p)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${p.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectProduct && onSelectProduct(p);
                          }
                        }}
                      >
                        {hasImage ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="shop-card-img"
                            loading="lazy"
                            onError={(e) => {
                              // If image fails, hide img tag immediately to prevent broken icon
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="shop-card-img-empty" aria-hidden="true" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="shop-card-info">
                        {p.category && (
                          <span className="shop-card-category">{p.category}</span>
                        )}
                        <h3
                          className="shop-card-name"
                          onClick={() => onSelectProduct && onSelectProduct(p)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectProduct && onSelectProduct(p);
                            }
                          }}
                        >
                          {p.name}
                        </h3>

                        {p.rating !== undefined && (
                          <StarRating rating={p.rating} count={p.reviews} />
                        )}

                        <div className="shop-card-price-row">
                          <span className="shop-card-price">₹{p.price}</span>
                          {p.originalPrice && (
                            <span className="shop-card-orig-price">₹{p.originalPrice}</span>
                          )}
                          {discountPercent && (
                            <span className="shop-card-discount">{discountPercent}% OFF</span>
                          )}
                        </div>

                        {/* Add to Cart button */}
                        <button
                          type="button"
                          className={`shop-card-cart-btn ${addedIds[p.id] ? 'added' : ''}`}
                          onClick={() => handleAddToCart(p)}
                          aria-label={`Add ${p.name} to cart`}
                        >
                          {addedIds[p.id] ? 'Added to Cart ✓' : 'Add to Cart'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── 6. Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="mobile-filter-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            <div className="mobile-filter-header">
              <h3>Filter Products</h3>
              <button
                type="button"
                className="mobile-filter-close"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filter drawer"
              >
                ✕
              </button>
            </div>

            <div className="mobile-filter-body">
              {/* Category */}
              <div className="filter-group">
                <h4 className="filter-group-title">Category</h4>
                <div className="mobile-cat-chips">
                  {categoryList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`mobile-cat-chip ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => changeCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories (if active category has subcategories) */}
              {activeCategory !== 'All' && subcategoryMap[activeCategory]?.length > 0 && (
                <div className="filter-group">
                  <h4 className="filter-group-title">Subcategory</h4>
                  <div className="mobile-cat-chips">
                    {subcategoryMap[activeCategory].map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        className={`mobile-cat-chip ${activeSubcategory === sub ? 'active' : ''}`}
                        onClick={() => changeSubcategory(sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="filter-group">
                <h4 className="filter-group-title">Price Range</h4>
                <div className="price-inputs-row">
                  <div className="price-field">
                    <span className="currency-prefix">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      aria-label="Minimum price"
                    />
                  </div>
                  <span className="price-to-separator">to</span>
                  <div className="price-field">
                    <span className="currency-prefix">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      aria-label="Maximum price"
                    />
                  </div>
                </div>

                <div className="price-quick-chips">
                  <button
                    type="button"
                    className={`price-chip ${maxPrice === '500' && minPrice === '' ? 'active' : ''}`}
                    onClick={() => { setMinPrice(''); setMaxPrice('500'); }}
                  >
                    Under ₹500
                  </button>
                  <button
                    type="button"
                    className={`price-chip ${minPrice === '500' && maxPrice === '1000' ? 'active' : ''}`}
                    onClick={() => { setMinPrice('500'); setMaxPrice('1000'); }}
                  >
                    ₹500 – ₹1,000
                  </button>
                  <button
                    type="button"
                    className={`price-chip ${minPrice === '1000' && maxPrice === '' ? 'active' : ''}`}
                    onClick={() => { setMinPrice('1000'); setMaxPrice(''); }}
                  >
                    Above ₹1,000
                  </button>
                </div>
              </div>
            </div>

            <div className="mobile-filter-footer">
              <button
                type="button"
                className="mobile-filter-clear-btn"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
              <button
                type="button"
                className="mobile-filter-apply-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
