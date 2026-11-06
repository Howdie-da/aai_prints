import { useState, useEffect, useMemo } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import CategoryScrollbar from './components/CategoryScrollbar';
import HeroSlider from './components/HeroSlider';
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
import AdminGuard from './components/AdminGuard';
import AdminAddProductPage from './pages/AdminAddProductPage';
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
      if (isMounted && live && live.length > 0) {
        setAllProducts([...live]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const devotionalProducts = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.category === 'Backlit LED Frames' ||
          p.category === 'Desk Standees' ||
          p.category === 'Wall Hangings'
      ),
    [allProducts]
  );

  const wallAndCarProducts = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.category === 'Metal Wall Art' ||
          p.category === 'Dashboard Idols' ||
          p.category === 'Car Hangings' ||
          p.category === 'Wall Clocks'
      ),
    [allProducts]
  );

  // UI state for account drawer
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Routing state
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash.startsWith('#/admin/add-product') || path.startsWith('/admin/add-product')) {
        return 'admin-add-product';
      }
      if (hash.startsWith('#/product/') || path.startsWith('/product/')) {
        return 'product';
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
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const search = window.location.search;
      if (hash.startsWith('#/admin/add-product') || path.startsWith('/admin/add-product')) {
        setCurrentPage('admin-add-product');
      } else if (hash.startsWith('#/product/') || path.startsWith('/product/')) {
        const slug = hash.startsWith('#/product/')
          ? hash.replace('#/product/', '').split('?')[0]
          : path.replace('/product/', '').split('?')[0];
        setActiveProductSlug(decodeURIComponent(slug));
        setCurrentPage('product');
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
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

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
    } else if (page === 'cart') {
      window.history.pushState(null, '', '#/cart');
    } else if (page === 'wishlist') {
      window.history.pushState(null, '', '#/wishlist');
    } else if (page === 'admin-add-product') {
      window.history.pushState(null, '', '#/admin/add-product');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* ── 4. Main Page View ── */}
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
        ) : currentPage === 'cart' ? (
          <CartPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={() => navigateTo('shop', 'All')}
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
        ) : (
          <main>
            {/* Hero banner slider */}
            <HeroSlider onSelectCategory={(cat) => navigateTo('shop', cat)} />

            {/* Devotional Décor product section */}
            <ProductSection
              sectionId="devotional"
              title="Devotional Décor"
              subtitle="Wall Hangings, Backlit LED Frames, Divine Tabletop Idols, Sacred Yantra & Spiritual Décor"
              products={devotionalProducts}
              onSelectProduct={handleSelectProduct}
              onViewMore={() => navigateTo('shop', 'Wall Hangings')}
            />

            {/* Wall & Car Décor product section */}
            <ProductSection
              sectionId="wall-decor"
              title="Wall & Car Décor"
              subtitle="Framed Wall Art, Modern Metal Wall Décor, Designer Clocks, Car Dashboard Idols & Hangings"
              products={wallAndCarProducts}
              onSelectProduct={handleSelectProduct}
              onViewMore={() => navigateTo('shop', 'Metal Wall Art')}
            />

            {/* "Your Style, Your Collection" horizontal scroll */}
            <StyleCollection onSelectCategory={(cat) => navigateTo('shop', cat)} />

            {/* Customer reviews section (resolves REVIEWS navbar link) */}
            <Testimonials />

            {/* Full-width promo strip (Free Shipping + ₹100 OFF) */}
            <PromoBanner onNavigateShop={() => navigateTo('shop', 'All')} />
          </main>
        )}

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
