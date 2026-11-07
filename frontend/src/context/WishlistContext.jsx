import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { normalizeProduct } from '../services/productService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'aaiprints_wishlist';
const CART_STORAGE_KEY = 'aaiprints_cart';

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const isSyncingRef = useRef(false);

  // ── Wishlist State (persisted in localStorage with sanitization) ──
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && typeof item === 'object' && item.id != null);
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
      return parsed
        .filter((item) => item && typeof item === 'object' && item.id != null)
        .map((item) => ({
          ...item,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          cartItemId:
            item.cartItemId || (item.variantId ? `${item.id}-${item.variantId}` : String(item.id)),
        }));
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  });

  // Drawers
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cart]);

  // Synchronize cart & wishlist from backend when authenticated (with guest merge)
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;

  const formatBackendCart = (cartData) => {
    if (!cartData?.items) return [];
    return cartData.items.map((item) => {
      const product = item.product || {};
      const itemKey = item.variantId
        ? `${product._id}-${item.variantId}`
        : String(item._id);

      return {
        id: product._id,
        _id: product._id,
        name: item.variantName ? `${product.name} - ${item.variantName}` : product.name,
        productName: product.name,
        slug: product.slug,
        price: String(item.unitPrice),
        originalPrice: item.originalPrice ? String(item.originalPrice) : null,
        image: product.image || (product.images && product.images[0]) || '/new-images/product-placeholder.jpg',
        cartItemId: itemKey,
        backendItemId: item._id,
        variantId: item.variantId,
        selectedVariant: item.variantName
          ? { id: item.variantId, label: item.variantName }
          : null,
        quantity: item.quantity,
      };
    });
  };

  const fetchBackendCartAndWishlist = useCallback(async () => {
    if (!isAuthenticated || isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      const guestCart = cartRef.current || [];
      const guestWishlist = wishlistRef.current || [];

      // 1. If guest has items in local cart, push them to backend before fetching
      if (guestCart.length > 0) {
        for (const localItem of guestCart) {
          await api.post('/cart/items', {
            productId: localItem._id || localItem.id,
            variantId: localItem.variantId || localItem.selectedVariant?.id || null,
            quantity: localItem.quantity || 1,
          }).catch(() => null);
        }
      }

      // Fetch live consolidated cart from backend
      const cartRes = await api.get('/cart');
      if (cartRes?.data?.cart) {
        const liveItems = formatBackendCart(cartRes.data.cart);
        setCart(liveItems);
      }

      // 2. Fetch live wishlist and merge guest wishlist
      const wishRes = await api.get('/wishlist');
      if (wishRes?.data?.products && Array.isArray(wishRes.data.products)) {
        const liveWishlist = wishRes.data.products.map(normalizeProduct);
        if (guestWishlist.length > 0) {
          const liveIds = new Set(liveWishlist.map((p) => String(p._id || p.id)));
          for (const item of guestWishlist) {
            const itemId = String(item._id || item.id);
            if (!liveIds.has(itemId)) {
              await api.post('/wishlist/toggle', { productId: itemId }).catch(() => null);
            }
          }
          // Fetch final merged wishlist
          const mergedWishRes = await api.get('/wishlist');
          if (mergedWishRes?.data?.products && Array.isArray(mergedWishRes.data.products)) {
            setWishlist(mergedWishRes.data.products.map(normalizeProduct));
          } else {
            setWishlist(liveWishlist);
          }
        } else {
          setWishlist(liveWishlist);
        }
      }
    } catch (err) {
      console.warn('[WishlistContext] Live sync error:', err.message);
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCartAndWishlist();
    }
  }, [isAuthenticated, fetchBackendCartAndWishlist]);

  // ── Wishlist Actions ──
  const isInWishlist = (productId) => {
    return wishlist.some((item) => String(item.id) === String(productId) || String(item._id) === String(productId));
  };

  const toggleWishlist = async (product) => {
    const targetId = product._id || product.id;

    // Optimistic local update
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === String(targetId) || String(item._id) === String(targetId));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(targetId) && String(item._id) !== String(targetId));
      } else {
        return [...prev, normalizeProduct(product)];
      }
    });

    // Remote sync
    if (isAuthenticated) {
      try {
        await api.post('/wishlist/toggle', { productId: targetId });
      } catch (err) {
        console.warn('[WishlistContext] Backend wishlist toggle failed:', err.message);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) =>
      prev.filter((item) => String(item.id) !== String(productId) && String(item._id) !== String(productId))
    );

    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (err) {
        console.warn('[WishlistContext] Backend wishlist removal failed:', err.message);
      }
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    if (isAuthenticated) {
      try {
        await api.delete('/wishlist');
      } catch (err) {
        console.warn('[WishlistContext] Backend wishlist clear failed:', err.message);
      }
    }
  };

  // ── Cart Actions ──
  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    const variantId = selectedVariant?.id || product.variantId || null;
    const itemKey = variantId
      ? `${product.id || product._id}-${variantId}`
      : String(product.id || product._id);

    const cartItem = {
      ...product,
      cartItemId: itemKey,
      variantId,
      selectedVariant: selectedVariant || product.selectedVariant || null,
      quantity: qty,
    };

    // Optimistic local state update
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const k = item.cartItemId || (item.variantId ? `${item.id}-${item.variantId}` : String(item.id));
        return k === itemKey;
      });

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: (item.quantity || 1) + qty } : item
        );
      }
      return [...prev, cartItem];
    });

    // Remote sync
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/items', {
          productId: product._id || product.id,
          variantId,
          quantity: qty,
        });

        // Attach backendItemId from response if available
        if (res?.data?.cart?.items) {
          const matched = res.data.cart.items.find(
            (i) => String(i.product._id) === String(product._id || product.id)
          );
          if (matched) {
            setCart((prev) =>
              prev.map((item) =>
                item.cartItemId === itemKey ? { ...item, backendItemId: matched._id } : item
              )
            );
          }
        }
      } catch (err) {
        console.warn('[WishlistContext] Backend add-to-cart failed:', err.message);
      }
    }
  };

  const updateCartQuantity = async (identifier, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(identifier);
      return;
    }

    const targetItem = cart.find(
      (item) =>
        item.cartItemId === identifier ||
        item.id === identifier ||
        String(item.id) === String(identifier)
    );

    setCart((prev) =>
      prev.map((item) => {
        const isMatch =
          item.cartItemId === identifier ||
          item.id === identifier ||
          String(item.id) === String(identifier);
        return isMatch ? { ...item, quantity: newQuantity } : item;
      })
    );

    if (isAuthenticated && targetItem?.backendItemId) {
      try {
        await api.put(`/cart/items/${targetItem.backendItemId}`, { quantity: newQuantity });
      } catch (err) {
        console.warn('[WishlistContext] Backend update quantity failed:', err.message);
      }
    }
  };

  const removeFromCart = async (identifier) => {
    const targetItem = cart.find(
      (item) =>
        item.cartItemId === identifier ||
        item.id === identifier ||
        String(item.id) === String(identifier)
    );

    setCart((prev) =>
      prev.filter((item) => {
        const isMatch =
          item.cartItemId === identifier ||
          item.id === identifier ||
          String(item.id) === String(identifier);
        return !isMatch;
      })
    );

    if (isAuthenticated && targetItem?.backendItemId) {
      try {
        await api.delete(`/cart/items/${targetItem.backendItemId}`);
      } catch (err) {
        console.warn('[WishlistContext] Backend remove cart item failed:', err.message);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('[WishlistContext] Backend clear cart failed:', err.message);
      }
    }
  };

  const wishlistCount = wishlist.length;
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,

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

export const useCart = useWishlist;
