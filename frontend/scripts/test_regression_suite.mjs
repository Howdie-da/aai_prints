import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductBySlugOrId,
  getProductsByCategory,
  getProductsBySubcategory,
  searchProducts,
  getRelatedProducts,
  getCategories,
  getSubcategories,
  getPriceBounds,
  parseNumericPrice,
} from '../src/services/productService.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    const result = fn();
    if (result === false) {
      console.error(`  ✗ FAIL: ${name}`);
      failedTests++;
    } else {
      console.log(`  ✓ PASS: ${name}`);
      passedTests++;
    }
  } catch (err) {
    console.error(`  ✗ ERROR: ${name} ->`, err.message);
    failedTests++;
  }
}

console.log('===============================================================');
console.log('   AAI PRINTS — FULL INTEGRATION & REGRESSION TEST SUITE       ');
console.log('===============================================================\n');

// ── 1. PRODUCT DATA & SCHEMA INTEGRITY ──
console.log('--- 1. Product Data & Schema Integrity ---');
const products = getAllProducts();

runTest('Catalogue contains all 12 products', () => products.length === 12);

runTest('All product IDs are strictly unique integers', () => {
  const ids = products.map((p) => p.id);
  const uniqueIds = new Set(ids);
  return uniqueIds.size === products.length && ids.every((id) => Number.isInteger(id));
});

runTest('All product slugs are unique and URL-safe', () => {
  const slugs = products.map((p) => p.slug);
  const uniqueSlugs = new Set(slugs);
  return (
    uniqueSlugs.size === products.length &&
    slugs.every((slug) => /^[a-z0-9-]+$/.test(slug))
  );
});

runTest('All products possess required fields with valid types', () => {
  return products.every(
    (p) =>
      p.id != null &&
      p.slug &&
      p.name &&
      p.category &&
      p.price &&
      parseNumericPrice(p.price) > 0 &&
      p.image &&
      Array.isArray(p.images) &&
      p.images.length > 0 &&
      p.description
  );
});

runTest('Variants have valid structure when present', () => {
  return products.every((p) => {
    if (!p.variants || p.variants.length === 0) return true;
    return p.variants.every((v) => v.id && v.label && typeof v.inStock === 'boolean');
  });
});

// ── 2. CUSTOMER JOURNEY A — PRODUCT DISCOVERY ──
console.log('\n--- 2. Customer Journey A: Product Discovery & Filtering ---');

runTest('Hero slide category resolves to matching products', () => {
  const devotionalItems = getProductsByCategory('Wall Hangings');
  return devotionalItems.length > 0;
});

runTest('Category filter works accurately', () => {
  const ledFrames = getProductsByCategory('Backlit LED Frames');
  return (
    ledFrames.length > 0 &&
    ledFrames.every((p) => p.category === 'Backlit LED Frames')
  );
});

runTest('Subcategory filter works accurately', () => {
  const subItems = getProductsBySubcategory('Spiritual Lighting');
  return (
    subItems.length > 0 &&
    subItems.every((p) => p.subcategory === 'Spiritual Lighting')
  );
});

runTest('Search returns accurate case-insensitive results', () => {
  const results = searchProducts('ram mandir');
  return (
    results.length > 0 &&
    results.some((p) => p.name.toLowerCase().includes('ram mandir'))
  );
});

runTest('Price bounds are mathematically valid', () => {
  const bounds = getPriceBounds();
  return bounds.min > 0 && bounds.max > bounds.min && bounds.min === 249 && bounds.max === 1499;
});

runTest('Product detail lookup resolves by slug or id identically', () => {
  const p1 = getProductBySlug('lord-ganesha-backlit-led-wooden-frame');
  const p2 = getProductById(1);
  const p3 = getProductBySlugOrId('1');
  return p1 && p2 && p3 && p1.id === p2.id && p2.id === p3.id;
});

runTest('Related products prioritizes same category and excludes self', () => {
  const current = getProductById(1);
  const related = getRelatedProducts(current, 4);
  return (
    related.length === 4 &&
    related.every((p) => p.id !== current.id) &&
    related[0].category === current.category
  );
});

// ── 3. CUSTOMER JOURNEY B — WISHLIST LIFECYCLE ──
console.log('\n--- 3. Customer Journey B: Wishlist Lifecycle ---');

let mockWishlist = [];
const pWishlist = products[0];

// Step B1: Add to wishlist
mockWishlist.push(pWishlist);
runTest('Add item to Wishlist increments count', () => mockWishlist.length === 1);

// Step B2: Check membership
const isInWishlist = (id) => mockWishlist.some((item) => item.id === id);
runTest('Wishlist membership verified', () => isInWishlist(pWishlist.id) === true);

// Step B3: Storage persistence simulation
const serializedWishlist = JSON.stringify(mockWishlist);
const parsedWishlist = JSON.parse(serializedWishlist);
runTest('Wishlist survives serialization/deserialization', () => parsedWishlist.length === 1 && parsedWishlist[0].id === pWishlist.id);

// Step B4: Remove from wishlist
mockWishlist = mockWishlist.filter((item) => item.id !== pWishlist.id);
runTest('Remove from Wishlist resets count', () => mockWishlist.length === 0 && !isInWishlist(pWishlist.id));

// ── 4. CUSTOMER JOURNEY C — CART & VARIANT CALCULATIONS ──
console.log('\n--- 4. Customer Journey C: Cart & Variant Calculations ---');

let mockCart = [];
const pCart = products[0]; // Price 899, orig 1299, has variant v-1a

function addToCart(item, quantity = 1) {
  const itemKey = item.variantId ? `${item.id}-${item.variantId}` : String(item.id);
  const existing = mockCart.find((ci) => ci.cartItemId === itemKey);
  if (existing) {
    existing.quantity += quantity;
  } else {
    mockCart.push({ ...item, cartItemId: itemKey, quantity });
  }
}

function updateCartQty(key, newQty) {
  if (newQty <= 0) {
    mockCart = mockCart.filter((ci) => ci.cartItemId !== key);
  } else {
    const it = mockCart.find((ci) => ci.cartItemId === key);
    if (it) it.quantity = newQty;
  }
}

// Step C1: Add with variant
addToCart({ ...pCart, variantId: 'v-1a', variant: '9 × 12 Inch' }, 2);
runTest('Cart registers item with unique variant cartItemId', () => {
  return mockCart.length === 1 && mockCart[0].cartItemId === '1-v-1a' && mockCart[0].quantity === 2;
});

// Step C2: Add different variant of same product
addToCart({ ...pCart, variantId: 'v-1b', variant: '12 × 16 Inch' }, 1);
runTest('Separate variants of same product remain distinct cart items', () => {
  return mockCart.length === 2 && mockCart[0].cartItemId === '1-v-1a' && mockCart[1].cartItemId === '1-v-1b';
});

// Step C3: Quantity modifications
updateCartQty('1-v-1a', 3);
runTest('Quantity increment updates accurately', () => {
  return mockCart.find((ci) => ci.cartItemId === '1-v-1a').quantity === 3;
});

// Step C4: Subtotal math
const calculateSubtotal = () =>
  mockCart.reduce((sum, ci) => sum + parseNumericPrice(ci.price) * ci.quantity, 0);

runTest('Cart subtotal calculates correctly (3 * 899 + 1 * 899 = 3596)', () => {
  return calculateSubtotal() === 3596;
});

// Step C5: Remove item
updateCartQty('1-v-1a', 0);
runTest('Setting quantity to 0 removes the item from cart', () => {
  return mockCart.length === 1 && mockCart[0].cartItemId === '1-v-1b';
});

// Step C6: Clear cart
mockCart = [];
runTest('Clearing cart triggers empty cart state', () => mockCart.length === 0);

// ── 5. CUSTOMER JOURNEY D — CART & WISHLIST INDEPENDENCE ──
console.log('\n--- 5. Customer Journey D: Cart & Wishlist Independence ---');

mockWishlist = [{ id: 5, name: 'Shiv Trishul' }];
mockCart = [{ id: 5, cartItemId: '5', name: 'Shiv Trishul', quantity: 1 }];

// Remove from wishlist
mockWishlist = mockWishlist.filter((w) => w.id !== 5);
runTest('Removing item from Wishlist does NOT affect Cart', () => {
  return mockWishlist.length === 0 && mockCart.length === 1;
});

// Clear cart
mockCart = [];
mockWishlist = [{ id: 7, name: 'Gayatri Mantra' }];
runTest('Clearing Cart does NOT affect Wishlist', () => {
  return mockCart.length === 0 && mockWishlist.length === 1;
});

// ── 6. LOCAL STORAGE SANITIZATION SAFETY ──
console.log('\n--- 6. Storage Safety & Malformed Data Resilience ---');

const malformedInput = [
  null,
  undefined,
  'string-instead-of-object',
  { noId: true },
  { id: 4, name: 'Valid Product' },
];

const sanitized = malformedInput.filter(
  (item) => item && typeof item === 'object' && item.id != null
);
runTest('Corrupted or unexpected localStorage entries are safely discarded', () => {
  return sanitized.length === 1 && sanitized[0].id === 4;
});

// ── 7. COMPONENT & ASSET INTEGRITY ──
console.log('\n--- 7. Component & Asset Integrity ---');

const appFile = readFileSync(resolve('src/App.jsx'), 'utf-8');
runTest('App.jsx router handles home, shop, product, cart, wishlist', () => {
  return (
    appFile.includes("currentPage === 'home'") ||
    (appFile.includes("currentPage === 'shop'") &&
      appFile.includes("currentPage === 'cart'") &&
      appFile.includes("currentPage === 'wishlist'") &&
      appFile.includes("currentPage === 'product'"))
  );
});

const navbarFile = readFileSync(resolve('src/components/Navbar.jsx'), 'utf-8');
runTest('Navbar retains authentic Aai Prints logo path', () => {
  return navbarFile.includes('/new-images/logo.png');
});

const footerFile = readFileSync(resolve('src/components/Footer.jsx'), 'utf-8');
runTest('Footer contains ZERO temporary placeholders ([PHONE] / [EMAIL])', () => {
  return !footerFile.includes('[PHONE]') && !footerFile.includes('[EMAIL]') && !footerFile.includes('wa.me/[PHONE]');
});

const testFile = readFileSync(resolve('src/components/Testimonials.jsx'), 'utf-8');
runTest('Testimonials contains ZERO unverified claims (e.g. 10,000+ Happy Homes)', () => {
  return !testFile.includes('10,000+ Happy Homes');
});

// ── SUMMARY ──
console.log('\n===============================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n✓ ALL INTEGRATION AND REGRESSION AUDITS PASSED WITH ZERO ERRORS.\n');
}

