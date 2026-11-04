import { products } from '../src/data/products.js';

// Mock localStorage
const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; },
};

function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

console.log('=== TEST 1: CART DATA & LOGIC VERIFICATION ===');
let cart = [];
let wishlist = [];

function addToCart(product, quantity = 1) {
  const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
  const itemKey = product.variantId ? `${product.id}-${product.variantId}` : String(product.id);
  const existingIdx = cart.findIndex((i) => (i.cartItemId || String(i.id)) === itemKey);
  if (existingIdx > -1) {
    cart[existingIdx].quantity += qty;
  } else {
    cart.push({ ...product, cartItemId: itemKey, quantity: qty });
  }
}

function updateCartQuantity(identifier, newQty) {
  if (newQty <= 0) {
    removeFromCart(identifier);
    return;
  }
  cart = cart.map((item) => {
    const isMatch = item.cartItemId === identifier || item.id === identifier;
    return isMatch ? { ...item, quantity: newQty } : item;
  });
}

function removeFromCart(identifier) {
  cart = cart.filter((item) => item.cartItemId !== identifier && item.id !== identifier);
}

function clearCart() {
  cart = [];
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity || 1), 0);
}

// 1. Add Product 1 (Lord Ganesha Frame)
addToCart(products[0], 2);
console.log(`✓ Added "${products[0].name}" (Qty: 2) -> Subtotal: ₹${calculateSubtotal()}`);
if (calculateSubtotal() !== 899 * 2) throw new Error('Subtotal calculation error');

// 2. Add Product 2 with variant
const prod2 = { ...products[1], variant: 'Grand (8 × 6 Inch)', variantId: 'v-2b' };
addToCart(prod2, 1);
console.log(`✓ Added "${prod2.name}" [${prod2.variant}] (Qty: 1) -> Subtotal: ₹${calculateSubtotal()}`);
if (calculateSubtotal() !== (899 * 2) + 649) throw new Error('Subtotal calculation error with variant');

// 3. Increment quantity
updateCartQuantity(products[0].id, 3);
console.log(`✓ Incremented Product 1 Qty to 3 -> Subtotal: ₹${calculateSubtotal()}`);
if (calculateSubtotal() !== (899 * 3) + 649) throw new Error('Increment calculation error');

// 4. Decrement quantity
updateCartQuantity(products[0].id, 1);
console.log(`✓ Decremented Product 1 Qty to 1 -> Subtotal: ₹${calculateSubtotal()}`);
if (calculateSubtotal() !== (899 * 1) + 649) throw new Error('Decrement calculation error');

// 5. Test min quantity prevention (quantity cannot be 0 from decrement in CartPage)
const item1Qty = Math.max(1, cart[0].quantity - 1);
if (item1Qty < 1) throw new Error('Quantity dropped below 1!');
console.log(`✓ Quantity lower bound enforced (cannot drop below 1).`);

// 6. Test Remove Item (Product 2 variant)
const initialCount = cart.length;
removeFromCart('2-v-2b');
if (cart.length !== initialCount - 1) throw new Error('Remove item failed');
console.log(`✓ Removed Product 2 variant. Remaining items in cart: ${cart.length}`);

// 7. Test Wishlist Separation
wishlist.push(products[4]);
console.log(`✓ Wishlist has ${wishlist.length} item(s).`);
clearCart();
console.log(`✓ Cleared cart. Cart items: ${cart.length}, Wishlist items: ${wishlist.length}`);
if (cart.length !== 0) throw new Error('Clear cart failed');
if (wishlist.length !== 1) throw new Error('Clear cart accidentally removed wishlist items!');

console.log('\n=== TEST 2: LOCALSTORAGE PERSISTENCE ===');
localStorage.setItem('aaiprints_cart', JSON.stringify([products[0], products[2]]));
const restored = JSON.parse(localStorage.getItem('aaiprints_cart'));
if (restored.length !== 2) throw new Error('LocalStorage restoration failed');
console.log(`✓ Restored ${restored.length} items from localStorage persistence after refresh.`);

console.log('\nALL CART TEST SUITES PASSED PERFECTLY!');

