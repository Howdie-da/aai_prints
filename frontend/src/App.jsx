import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import CategoryScrollbar from './components/CategoryScrollbar';
import HeroSlider from './components/HeroSlider';
import ReelsSection from './components/ReelsSection';
import ProductSection from './components/ProductSection';
import StyleCollection from './components/StyleCollection';
import Testimonials from './components/Testimonials';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';
import WishlistDrawer from './components/WishlistDrawer';
import CartDrawer from './components/CartDrawer';
import AccountDrawer from './components/AccountDrawer';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminGuard from './components/AdminGuard';
import AdminAddProductPage from './pages/AdminAddProductPage';
import B2BPortalPage from './pages/B2BPortalPage';
import AdminB2BPage from './pages/AdminB2BPage';
import AdminReelsPage from './pages/AdminReelsPage';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import {
  getAllProducts,
  fetchAllProducts,
  getProductBySlugOrId,
} from './services/productService';
import './App.css';

function App() {
  // Live product catalogue state with immediate local fallback
  const [allProducts, setAllProducts] = useState(() => getAllProducts());

  useEffect(() => {
    let isMounted = true;
    fetchAllProducts().then((live) => {
      if (isMounted && Array.isArray(live)) {
        setAllProducts([...live]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const devotionalProducts = useMemo(
    () =>
      allProducts.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const slug = (p.categorySlug || '').toLowerCase();
        return (
          cat === 'devotional' ||
          slug.includes('devotional') ||
          sub === 'backlit led frames' ||
          sub === 'desk standees' ||
          sub === 'wall hangings' ||
          cat === 'backlit led frames' ||
          cat === 'desk standees' ||
          cat === 'wall hangings'
        );
      }),
    [allProducts]
  );

  const wallAndCarProducts = useMemo(
    () =>
      allProducts.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const slug = (p.categorySlug || '').toLowerCase();
        return (
          cat.includes('wall') ||
          cat.includes('car') ||
          slug.includes('wall') ||
          slug.includes('car') ||
          sub === 'metal wall art' ||
          sub === 'dashboard idols' ||
          sub === 'car hangings' ||
          sub === 'wall clocks' ||
          cat === 'metal wall art' ||
          cat === 'dashboard idols' ||
          cat === 'car hangings' ||
          cat === 'wall clocks'
        );
      }),
    [allProducts]
  );

  // UI state for account drawer
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Routing state
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash.startsWith('#/admin/reels') || path.startsWith('/admin/reels')) {
        return 'admin-reels';
      }
      if (hash.startsWith('#/admin/b2b') || path.startsWith('/admin/b2b')) {
        return 'admin-b2b';
      }
      if (hash.startsWith('#/admin/add-product') || path.startsWith('/admin/add-product')) {
        return 'admin-add-product';
      }
      if (hash.startsWith('#/b2b') || path.startsWith('/b2b') || hash === '#b2b') {
        return 'b2b';
      }
      if (hash.startsWith('#/product/') || path.startsWith('/product/')) {
        return 'product';
      }
      if (hash.startsWith('#/checkout') || hash === '#checkout' || path.startsWith('/checkout')) {
        return 'checkout';
      }
      if (hash.startsWith('#/cart') || hash === '#cart' || path.startsWith('/cart')) {
        return 'cart';
      }
      if (hash.startsWith('#/wishlist') || hash === '#wishlist' || path.startsWith('/wishlist')) {
        return 'wishlist';
      }
      if (hash.startsWith('#/shop') || hash === '#shop' || path === '/shop') {
        return 'shop';
      }
    }
    return 'home';
  });

  const [activeProductSlug, setActiveProductSlug] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash.startsWith('#/product/')) {
        return hash.replace('#/product/', '').split('?')[0];
      }
      if (path.startsWith('/product/')) {
        return path.replace('/product/', '').split('?')[0];
      }
    }
    return '';
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#reviews' || hash === '#/reviews') {
        return 'reviews';
      }
      if (hash.includes('category=')) {
        const match = hash.match(/category=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
      if (search.includes('category=')) {
        const match = search.match(/category=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
    }
    return 'All';
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    // Disable automatic browser scroll restoration for seamless SPA view changes
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleUrlChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const search = window.location.search;
      if (hash.startsWith('#/admin/reels') || path.startsWith('/admin/reels')) {
        return 'admin-reels';
      }
      if (hash.startsWith('#/admin/b2b') || path.startsWith('/admin/b2b')) {
        setCurrentPage('admin-b2b');
      } else if (hash.startsWith('#/admin/add-product') || path.startsWith('/admin/add-product')) {
        setCurrentPage('admin-add-product');
      } else if (hash.startsWith('#/b2b') || path.startsWith('/b2b') || hash === '#b2b') {
        setCurrentPage('b2b');
      } else if (hash.startsWith('#/product/') || path.startsWith('/product/')) {
        const slug = hash.startsWith('#/product/')
          ? hash.replace('#/product/', '').split('?')[0]
          : path.replace('/product/', '').split('?')[0];
        setActiveProductSlug(decodeURIComponent(slug));
        setCurrentPage('product');
      } else if (hash.startsWith('#/checkout') || hash === '#checkout' || path.startsWith('/checkout')) {
        setCurrentPage('checkout');
      } else if (hash.startsWith('#/cart') || hash === '#cart' || path.startsWith('/cart')) {
        setCurrentPage('cart');
      } else if (hash.startsWith('#/wishlist') || hash === '#wishlist' || path.startsWith('/wishlist')) {
        setCurrentPage('wishlist');
      } else if (hash.startsWith('#/shop') || hash === '#shop' || path.startsWith('/shop')) {
        setCurrentPage('shop');
        let cat = 'All';
        if (hash.includes('category=')) {
          const match = hash.match(/category=([^&]+)/);
          if (match) cat = decodeURIComponent(match[1]);
        } else if (search.includes('category=')) {
          const match = search.match(/category=([^&]+)/);
          if (match) cat = decodeURIComponent(match[1]);
        }
        setSelectedCategory(cat);
      } else if (hash === '#reviews' || hash === '#/reviews') {
        setCurrentPage('home');
        setSelectedCategory('reviews');
        setTimeout(() => {
          const el = document.getElementById('reviews');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setCurrentPage('home');
        setSelectedCategory('All');
      }

      if (hash !== '#reviews' && hash !== '#/reviews') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Reset scroll to top on every page and product navigation
  useEffect(() => {
    if (window.location.hash === '#reviews' || window.location.hash === '#/reviews') {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage, activeProductSlug]);

  // Programmatic navigation
  const navigateTo = (page, param = 'All') => {
    setCurrentPage(page);
    if (page === 'shop') {
      setSelectedCategory(param);
      const hashUrl = param !== 'All'
        ? `#/shop?category=${encodeURIComponent(param)}`
        : `#/shop`;
      window.history.pushState(null, '', hashUrl);
    } else if (page === 'product') {
      setActiveProductSlug(param);
      window.history.pushState(null, '', `#/product/${param}`);
    } else if (page === 'checkout') {
      window.history.pushState(null, '', '#/checkout');
    } else if (page === 'cart') {
      window.history.pushState(null, '', '#/cart');
    } else if (page === 'wishlist') {
      window.history.pushState(null, '', '#/wishlist');
    } else if (page === 'admin-add-product') {
      window.history.pushState(null, '', '#/admin/add-product');
    } else if (page === 'b2b') {
      window.history.pushState(null, '', '#/b2b');
    } else if (page === 'admin-b2b') {
      window.history.pushState(null, '', '#/admin/b2b');
    } else if (page === 'admin-reels') {
      window.history.pushState(null, '', '#/admin/reels');
    } else if (page === 'home' && (param === 'reviews' || param === '#reviews')) {
      setSelectedCategory('reviews');
      window.history.pushState(null, '', '#/reviews');
      setTimeout(() => {
        const el = document.getElementById('reviews');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    } else {
      setSelectedCategory('All');
      window.history.pushState(null, '', '#/');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleSelectProduct = (prod) => {
    if (!prod) return;
    const slug = prod.slug || String(prod.id);
    navigateTo('product', slug);
  };

  // Find active product for PDP via product service layer
  const currentProduct =
    getProductBySlugOrId(activeProductSlug) || allProducts[0];

  return (
    <AuthProvider>
      <WishlistProvider>
        <div className="app">
          {/* ── 1. Announcement bar ── */}
          <AnnouncementBar />

          {/* ── 2. Navbar ── */}
          <Navbar
            products={allProducts}
            currentPage={currentPage}
            selectedCategory={selectedCategory}
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
            onOpenAccount={() => setIsAccountOpen(true)}
          />

          {/* ── 3. Horizontal category circle icons (Restricted to Home page /#/) ── */}
          {currentPage === 'home' && (
            <CategoryScrollbar
              onSelectCategory={(cat) => navigateTo('shop', cat)}
            />
          )}

          {/* ── 4. Main Page View (Instant Snappy 60fps) ── */}
          <div
            key={currentPage === 'product' ? `product-${activeProductSlug}` : currentPage}
            className="page-view-fade"
            style={{ width: '100%' }}
          >
            {currentPage === 'product' ? (
              <ProductDetailPage
                product={currentProduct}
                allProducts={allProducts}
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={(cat) => navigateTo('shop', cat || 'All')}
                onSelectProduct={handleSelectProduct}
                onProductUpdated={(updatedProd) => {
                  fetchAllProducts().then((live) => {
                    if (live && live.length > 0) setAllProducts([...live]);
                  });
                  handleSelectProduct(updatedProd);
                }}
                onProductDeleted={(deletedId) => {
                  fetchAllProducts().then((live) => {
                    if (live && live.length > 0) setAllProducts([...live]);
                  });
                  navigateTo('shop', 'All');
                }}
              />
            ) : currentPage === 'shop' ? (
              <ShopPage
                products={allProducts}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => navigateTo('shop', cat)}
                onNavigateHome={() => navigateTo('home')}
                onSelectProduct={handleSelectProduct}
              />
            ) : currentPage === 'checkout' ? (
              <CheckoutPage
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={() => navigateTo('shop', 'All')}
                onNavigateCart={() => navigateTo('cart')}
                onSelectProduct={handleSelectProduct}
              />
            ) : currentPage === 'cart' ? (
              <CartPage
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={() => navigateTo('shop', 'All')}
                onNavigateCheckout={() => navigateTo('checkout')}
                onSelectProduct={handleSelectProduct}
              />
            ) : currentPage === 'wishlist' ? (
              <WishlistPage
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={() => navigateTo('shop', 'All')}
                onSelectProduct={handleSelectProduct}
              />
            ) : currentPage === 'admin-add-product' ? (
              <AdminGuard onNavigateHome={() => navigateTo('home')}>
                <AdminAddProductPage
                  onNavigateHome={() => navigateTo('home')}
                  onProductCreated={(createdProd) => {
                    fetchAllProducts().then((live) => {
                      if (live && live.length > 0) {
                        setAllProducts([...live]);
                      }
                    });
                    handleSelectProduct(createdProd);
                  }}
                />
              </AdminGuard>
            ) : currentPage === 'admin-b2b' ? (
              <AdminGuard onNavigateHome={() => navigateTo('home')}>
                <AdminB2BPage
                  onNavigateHome={() => navigateTo('home')}
                  onNavigateB2BPortal={() => navigateTo('b2b')}
                />
              </AdminGuard>
            ) : currentPage === 'admin-reels' ? (
              <AdminGuard onNavigateHome={() => navigateTo('home')}>
                <AdminReelsPage
                  onNavigateHome={() => navigateTo('home')}
                  onSelectProduct={handleSelectProduct}
                />
              </AdminGuard>
            ) : currentPage === 'b2b' ? (
              <B2BPortalPage
                onNavigateHome={() => navigateTo('home')}
                onNavigateAdminB2B={() => navigateTo('admin-b2b')}
                onNavigateCart={() => navigateTo('cart')}
              />
            ) : (
              <main>
                {/* Hero banner slider */}
                <HeroSlider onSelectCategory={(cat) => navigateTo('shop', cat)} />

                {/* Devotional Decor product section */}
                <ProductSection
                  sectionId="devotional"
                  title="Devotional Decor"
                  subtitle="Wall Hangings, Backlit LED Frames, Tabletop Idols & Spiritual Decor"
                  products={devotionalProducts}
                  onSelectProduct={handleSelectProduct}
                  onViewMore={() => navigateTo('shop', 'Wall Hangings')}
                />

                {/* Wall & Car Decor product section */}
                <ProductSection
                  sectionId="wall-decor"
                  title="Wall & Car Decor"
                  subtitle="Framed Wall Art, Modern Metal Wall Decor, Designer Clocks, Car Dashboard Idols & Hangings"
                  products={wallAndCarProducts}
                  onSelectProduct={handleSelectProduct}
                  onViewMore={() => navigateTo('shop', 'Metal Wall Art')}
                />

                {/* Clean notice when catalogue is empty / being populated */}
                {allProducts.length === 0 && (
                  <section className="catalog-status-banner" style={{ padding: '24px 20px' }}>
                    <div style={{ maxWidth: '720px', margin: '20px auto', textAlign: 'center', padding: '36px 24px', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(197, 155, 39, 0.28)', boxShadow: '0 4px 20px rgba(35, 95, 100, 0.05)' }}>
                      <span style={{ display: 'inline-block', color: 'var(--gold-dark, #9e7916)', letterSpacing: '2px', fontSize: '10.5px', fontWeight: '700', fontFamily: 'var(--font-serif, "Cinzel", serif)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        STORE CATALOGUE
                      </span>
                      <h2 style={{ fontFamily: 'var(--font-display, "Cormorant", serif)', color: 'var(--teal-deep)', fontSize: '28px', margin: '0 0 10px', fontWeight: '600', fontStyle: 'italic' }}>
                        Collection In Preparation
                      </h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.65', maxWidth: '520px', margin: '0 auto 20px' }}>
                        Our handcrafted devotional artworks, illuminated frames, and decor pieces are currently being updated.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigateTo('shop', 'All')}
                        style={{ background: 'var(--teal)', color: 'var(--text-inverse)', border: 'none', padding: '12px 28px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body, "Montserrat", sans-serif)', fontSize: '12px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 14px rgba(30, 82, 87, 0.25)' }}
                      >
                        Browse Collection Categories
                      </button>
                    </div>
                  </section>
                )}

                {/* Whatmore-style Short Videos / Reels Showcase (Homepage only) */}
                <ReelsSection onSelectProduct={handleSelectProduct} />

                {/* "Your Style, Your Collection" horizontal scroll */}
                <StyleCollection onSelectCategory={(cat) => navigateTo('shop', cat)} />

                {/* Customer reviews section (resolves REVIEWS navbar link) */}
                <Testimonials />

                {/* Full-width promo strip (Free Shipping + ₹100 OFF) */}
                <PromoBanner onNavigateShop={() => navigateTo('shop', 'All')} />
              </main>
            )}
          </div>

          {/* ── 5. Footer ── */}
          <Footer onNavigate={navigateTo} />

          {/* ── 6. Wishlist Slide-in Drawer ── */}
          <WishlistDrawer
            onSelectProduct={handleSelectProduct}
            onNavigateShop={() => navigateTo('shop', 'All')}
            onNavigateWishlist={() => navigateTo('wishlist')}
          />

          {/* ── 7. Cart Slide-in Drawer ── */}
          <CartDrawer
            onSelectProduct={handleSelectProduct}
            onNavigateShop={() => navigateTo('shop', 'All')}
            onNavigateCart={() => navigateTo('cart')}
            onNavigateCheckout={() => navigateTo('checkout')}
          />

          {/* ── 8. Account Slide-in Drawer ── */}
          <AccountDrawer
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
            onNavigate={navigateTo}
          />
        </div>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
