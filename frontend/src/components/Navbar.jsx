import { useState, useRef, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { navLinks, getActiveNavLabel } from '../data/navigationConfig';
import './Navbar.css';

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function Navbar({
  products = [],
  currentPage = 'home',
  selectedCategory = 'All',
  onNavigate,
  onSelectProduct,
  onOpenAccount,
}) {
  const { wishlistCount, cartCount, setIsWishlistOpen, setIsCartOpen } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);

  // Search feature states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  // Close search and mobile menu when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (menuOpen) setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, menuOpen]);

  const toggleMobileSubmenu = (label) => {
    setMobileSubmenu((prev) => (prev === label ? null : label));
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Filter products by name using case-insensitive matching
  const filteredProducts = searchQuery.trim()
    ? products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    : [];

  // Navigate to matching product on click or enter
  const handleSelectProduct = (product) => {
    closeSearch();
    if (onSelectProduct) {
      onSelectProduct(product);
      return;
    }
    // Fallback: Scroll to matching product on current page
    const el = document.getElementById(`product-${product.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('prod-card-highlight');
      setTimeout(() => el.classList.remove('prod-card-highlight'), 2200);
    } else if (onNavigate) {
      onNavigate('shop', 'All');
      setTimeout(() => {
        const item = document.getElementById(`product-${product.id}`);
        if (item) {
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          item.classList.add('prod-card-highlight');
          setTimeout(() => item.classList.remove('prod-card-highlight'), 2200);
        }
      }, 150);
    }
  };

  // Handle Enter key on search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        handleSelectProduct(filteredProducts[0]);
      }
    }
  };

  const handleNavClick = (e, link) => {
    if (link.label === 'REVIEWS') {
      e.preventDefault();
      setMenuOpen(false);
        if (onNavigate) {
          onNavigate('home', 'reviews');
        } else {
          const el = document.getElementById('reviews');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      if (link.page && onNavigate) {
        e.preventDefault();
        onNavigate(link.page, link.category || 'All');
        setMenuOpen(false);
      }
    };

    // Strictly compute at most ONE active top-level navigation label
    const activeNavLabel = getActiveNavLabel(currentPage, selectedCategory);

    return (
      <header className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">

          {/* aai Prints Brand Logo */}
          <a
            href="#/"
            className="navbar-logo"
            aria-label="aai Prints Home"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('home');
              }
            }}
          >
            <img
              src="/new-images/logo.png"
              alt="aai Prints"
              className="site-logo"
            />
          </a>

          {/* ── Desktop Nav ── */}
          <nav className="nav-links" aria-label="Site navigation">
            {navLinks.map((link) => {
              const isActive = link.label === activeNavLabel;

              return (
                <div
                  key={link.label}
                  className="nav-item-wrap"
                  onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <a
                    href={link.href}
                    className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                    onClick={(e) => handleNavClick(e, link)}
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown />}
                  </a>

                  {link.hasDropdown && (
                    <div
                      className={`nav-dropdown ${openDropdown === link.label ? 'is-visible' : ''}`}
                      role="menu"
                    >
                      {link.children.map((child) => {
                        const isChildActive =
                          Boolean(selectedCategory) &&
                          String(selectedCategory).toLowerCase().trim() === (child.category || '').toLowerCase().trim();

                        return (
                          <a
                            key={child.label}
                            href={child.href}
                            className={`nav-dropdown-item ${isChildActive ? 'nav-dropdown-item--active' : ''}`}
                            role="menuitem"
                            onClick={(e) => {
                              if (onNavigate) {
                                e.preventDefault();
                                onNavigate('shop', child.category || 'All');
                                setOpenDropdown(null);
                              }
                            }}
                          >
                            {child.label}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Right Icons: Search, Account, Wishlist, Cart ── */}
          <div className="navbar-icons">
            <button
              className={`icon-btn ${searchOpen ? 'icon-btn--active' : ''}`}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              title="Search products"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-expanded={searchOpen}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button
              className="icon-btn"
              aria-label="My Account"
              title="My Account"
              onClick={onOpenAccount}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button
              className={`icon-btn pos-rel ${currentPage === 'wishlist' ? 'icon-btn--active' : ''}`}
              aria-label={`Wishlist (${wishlistCount} items)`}
              title="View Wishlist"
              onClick={() => setIsWishlistOpen(true)}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill={wishlistCount > 0 ? '#e53935' : 'none'}
                stroke={wishlistCount > 0 ? '#e53935' : 'currentColor'}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="icon-badge">{wishlistCount}</span>
            </button>
            <button
              className={`icon-btn pos-rel ${currentPage === 'cart' ? 'icon-btn--active' : ''}`}
              aria-label={`Cart (${cartCount} items)`}
              title="View Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="icon-badge">{cartCount}</span>
            </button>

            {/* Hamburger – mobile only */}
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── Search Interface Drawer (Opens below Navbar) ── */}
        {searchOpen && (
          <div className="navbar-search-drawer" role="search" aria-label="Product Search">
            <div className="search-bar-inner">
              <div className="search-input-box">
                <svg className="search-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search for products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Clear search input"
                    title="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                className="search-close-btn"
                onClick={closeSearch}
                aria-label="Close search"
                title="Close search (Esc)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span className="search-close-text">Close</span>
              </button>
            </div>

            {/* Dynamic Search Results */}
            {searchQuery.trim() && (
              <div className="search-results-wrapper">
                <div className="search-results-container">
                  {filteredProducts.length > 0 ? (
                    <div className="search-results-list" role="listbox">
                      <div className="search-results-header">
                        <span>Found <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'match' : 'matches'}</span>
                        <span className="search-results-hint">Press Enter or click to view</span>
                      </div>
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="search-result-item"
                          role="option"
                          onClick={() => handleSelectProduct(p)}
                        >
                          <div className="search-result-img-wrap">
                            {p.image && !p.image.includes('placeholder') ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="search-result-img"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="search-result-img-empty" />
                            )}
                          </div>
                          <div className="search-result-info">
                            <span className="search-result-name">{p.name}</span>
                            <span className="search-result-price">Rs. {p.price}</span>
                          </div>
                          <span className="search-result-action">
                            View
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="search-no-results">
                      <p className="search-no-results-title">No products found</p>
                      <p className="search-no-results-desc">
                        No products matched "<strong>{searchQuery}</strong>". Try searching for <em>Ganesha</em>, <em>Ram Mandir</em>, <em>Frame</em>, <em>Clock</em>, or <em>Metal Art</em>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Mobile Dropdown Menu ── */}
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
                      {navLinks.map((link) => {
                        const isGroupActive = link.label === activeNavLabel;

                        return (
                          <div key={link.label} className="mobile-nav-group">
                            <div className="mobile-nav-row">
                              <a
                                href={link.href}
                                className={`mobile-nav-link ${isGroupActive ? 'mobile-nav-link--active' : ''}`}
                                onClick={(e) => {
                                  if (!link.hasDropdown) {
                                    handleNavClick(e, link);
                                  } else {
                                    e.preventDefault();
                                    toggleMobileSubmenu(link.label);
                                  }
                                }}
                              >
                                  { link.label }
                  </a>
                  {link.hasDropdown && (
                              <button
                                type="button"
                                className="mobile-sub-toggle"
                                onClick={() => toggleMobileSubmenu(link.label)}
                                aria-label={`Toggle ${link.label} submenu`}
                              >
                                <span className={`sub-chevron ${mobileSubmenu === link.label ? 'open' : ''}`}>›</span>
                              </button>
                            )}
                          </div>
                {
                          link.hasDropdown && mobileSubmenu === link.label && (
                            <div className="mobile-sub-list">
                              {link.children.map((child) => {
                                const isChildActive =
                                  Boolean(selectedCategory) &&
                                  String(selectedCategory).toLowerCase().trim() === (child.category || '').toLowerCase().trim();

                                return (
                                  <a
                                    key={child.label}
                                    href={child.href}
                                    className={`mobile-sub-link ${isChildActive ? 'mobile-sub-link--active' : ''}`}
                                    onClick={(e) => {
                                      if (onNavigate) {
                                        e.preventDefault();
                                        onNavigate('shop', child.category || 'All');
                                        setMenuOpen(false);
                                      }
                                    }}
                                  >
                                    {child.label}
                                  </a>
                                );
                              })}
                              <a
                                href={link.href}
                                className="mobile-sub-link mobile-sub-link--view-all"
                                onClick={(e) => {
                                  if (onNavigate) {
                                    e.preventDefault();
                                    onNavigate(link.page || 'shop', link.category || 'All');
                                    setMenuOpen(false);
                                  }
                                }}
                              >
                                View All {link.label} →
                              </a>
              </div>
            )}
          </div>
        );
          })}

        {/* Quick Access Actions for Mobile Menu */}
        <div className="mobile-menu-footer">
          <button
            type="button"
            className="mobile-footer-link"
            onClick={() => {
              setMenuOpen(false);
              setIsWishlistOpen(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlistCount > 0 ? '#e53935' : 'none'} stroke={wishlistCount > 0 ? '#e53935' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>My Wishlist ({wishlistCount})</span>
          </button>
          <button
            type="button"
            className="mobile-footer-link"
            onClick={() => {
              setMenuOpen(false);
              setIsCartOpen(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm11 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Shopping Cart ({cartCount})</span>
          </button>
        </div>
      </nav>
    )
  }
    </header >
  );
}
