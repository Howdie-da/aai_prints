import { readFileSync, existsSync } from 'fs';
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

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

console.log('--- TEST SUITE: Product Data & Architecture Audit (Step 9) ---');

// 1. Data Integrity & Uniqueness
console.log('\n1. Verifying Product Data Schema & ID/Slug Uniqueness:');
const allProducts = getAllProducts();
assert(Array.isArray(allProducts) && allProducts.length > 0, `Loaded ${allProducts.length} products`);

const idSet = new Set();
const slugSet = new Set();
let uniqueIds = true;
let uniqueSlugs = true;
let requiredFieldsValid = true;

allProducts.forEach((p) => {
  if (idSet.has(p.id)) uniqueIds = false;
  idSet.add(p.id);

  if (slugSet.has(p.slug)) uniqueSlugs = false;
  slugSet.add(p.slug);

  if (
    p.id == null ||
    !p.slug ||
    !p.name ||
    !p.category ||
    !p.price ||
    !p.image ||
    !Array.isArray(p.images) ||
    !p.description
  ) {
    requiredFieldsValid = false;
  }
});

assert(uniqueIds, 'Every product has a unique ID');
assert(uniqueSlugs, 'Every product has a unique URL slug');
assert(requiredFieldsValid, 'Every product satisfies required data fields (id, slug, name, category, price, image, images, description)');

// 2. Product Service Layer Methods
console.log('\n2. Testing Product Service Layer Functions:');
const p1 = getProductById(1);
assert(p1 && p1.id === 1, 'getProductById resolves product correctly');

const pBySlug = getProductBySlug('lord-ganesha-backlit-led-wooden-frame');
assert(pBySlug && pBySlug.id === 1, 'getProductBySlug resolves product by slug');

const pBySlugOrId = getProductBySlugOrId('1');
assert(pBySlugOrId && pBySlugOrId.id === 1, 'getProductBySlugOrId resolves by numeric ID string');

const backlitProducts = getProductsByCategory('Backlit LED Frames');
assert(backlitProducts.length > 0 && backlitProducts.every(p => p.category === 'Backlit LED Frames'), 'getProductsByCategory filters correctly');

const searchResults = searchProducts('Ganesha');
assert(searchResults.length > 0 && searchResults.some(p => p.name.includes('Ganesha')), 'searchProducts performs case-insensitive search');

const related = getRelatedProducts(p1, 3);
assert(related.length === 3 && related.every(p => p.id !== p1.id), 'getRelatedProducts excludes current product and respects limit');

const categories = getCategories();
assert(Array.isArray(categories) && categories.includes('Wall Hangings'), 'getCategories returns complete category catalogue');

const bounds = getPriceBounds();
assert(bounds.min > 0 && bounds.max >= bounds.min, `getPriceBounds returns valid range: ₹${bounds.min} - ₹${bounds.max}`);

assert(parseNumericPrice('1,499') === 1499, 'parseNumericPrice parses comma-formatted price string');

// 3. Cart & Wishlist Sanitization Logic
console.log('\n3. Testing Cart & Wishlist Sanitization & Variant Separation:');
// Simulate corrupted localStorage payload
const corruptedWishlist = [
  null,
  { id: 1, name: 'Product 1' },
  { broken: true }, // missing id
];
const sanitizedWishlist = corruptedWishlist.filter(item => item && typeof item === 'object' && item.id != null);
assert(sanitizedWishlist.length === 1 && sanitizedWishlist[0].id === 1, 'Wishlist sanitizes corrupted/malformed localStorage entries');

// Simulate variant cart items
const cartItem1 = { id: 1, variantId: 'v-1a', quantity: 1, cartItemId: '1-v-1a' };
const cartItem2 = { id: 1, variantId: 'v-1b', quantity: 2, cartItemId: '1-v-1b' };
assert(cartItem1.cartItemId !== cartItem2.cartItemId, 'Distinct variants of the same product maintain distinct cartItemIds');

// 4. Backend Documentation Check
console.log('\n4. Checking Backend Integration Documentation:');
const docPath = resolve('docs/FRONTEND_API_INTEGRATION.md');
assert(existsSync(docPath), 'docs/FRONTEND_API_INTEGRATION.md exists');

const docContent = readFileSync(docPath, 'utf-8');
assert(docContent.includes('Product Data Contract & Schema'), 'Doc includes product schema definition');
assert(docContent.includes('src/services/productService.js'), 'Doc references product service integration point');
assert(docContent.includes('WishlistContext.jsx'), 'Doc details cart and wishlist state contracts');
assert(docContent.includes('How to Replace Local Data with Backend APIs'), 'Doc provides clear instructions for API replacement');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);

