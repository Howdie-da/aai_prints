import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'aaiprints_wishlist';
const CART_STORAGE_KEY = 'aaiprints_cart';

export function WishlistProvider({ children }) {
  // ── Wishlist State (persisted in localStorage with sanitization) ──
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Sanitize: ensure each entry is a valid object with an ID
      return parsed.filter(item => item && typeof item === 'object' && item.id != null);
    } catch (e) {
      console.error('Error reading wishlist from localStorage', e);
      return [];
    }
  });

  // ── Cart State (persisted in localStorage with sanitization) ──
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Sanitize: ensure valid objects with positive quantity and unique cartItemId
      return parsed
        .filter(item => item && typeof item === 'object' && item.id != null)
        .map(item => ({
          ...item,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          cartItemId: item.cartItemId || (item.variantId ? `${item.id}-${item.variantId}` : String(item.id))
        }));
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  });

  // Separate Open/Close States for Drawers
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cart]);

  // ── Wishlist Actions ──
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  // ── Cart Actions ──
  const addToCart = (product, quantity = 1) => {
    const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    const itemKey = product.variantId
      ? `${product.id}-${product.variantId}`
      : String(product.id);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const k = item.cartItemId || (item.variantId ? `${item.id}-${item.variantId}` : String(item.id));
        return k === itemKey;
      });

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + qty }
            : item
        );
      }
      return [...prev, { ...product, cartItemId: itemKey, quantity: qty }];
    });
  };

  const updateCartQuantity = (identifier, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(identifier);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const isMatch =
          item.cartItemId === identifier ||
          item.id === identifier ||
          String(item.id) === String(identifier);
        return isMatch ? { ...item, quantity: newQuantity } : item;
      })
    );
  };

  const removeFromCart = (identifier) => {
    setCart((prev) =>
      prev.filter((item) => {
        const isMatch =
          item.cartItemId === identifier ||
          item.id === identifier ||
          String(item.id) === String(identifier);
        return !isMatch;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Derived counts
  const wishlistCount = wishlist.length;
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <WishlistContext.Provider
      value={{
        // Wishlist
        wishlist,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,

        // Cart
        cart,
        cartCount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

// Alias for semantic clarity in cart-focused components
export const useCart = useWishlist;
