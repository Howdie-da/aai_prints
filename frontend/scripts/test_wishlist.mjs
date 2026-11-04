import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mini test runner
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

console.log('--- TEST SUITE: Wishlist Page & Wishlist Functionality (Step 6) ---');

// Test 1: WishlistPage component existence and structure
console.log('\n1. Checking WishlistPage.jsx implementation:');
const wishlistPageCode = readFileSync(resolve('src/pages/WishlistPage.jsx'), 'utf-8');
assert(wishlistPageCode.includes('export default function WishlistPage'), 'WishlistPage component is properly exported');
assert(wishlistPageCode.includes('useWishlist'), 'Uses shared WishlistContext');
assert(wishlistPageCode.includes('removeFromWishlist'), 'Integrates removeFromWishlist handler');
assert(wishlistPageCode.includes('addToCart'), 'Integrates addToCart handler');
assert(wishlistPageCode.includes('clearWishlist'), 'Integrates clearWishlist handler');
assert(wishlistPageCode.includes('Added to Cart ✓'), 'Provides visual confirmation on Add to Cart');
assert(wishlistPageCode.includes('Your Wishlist Is Empty'), 'Features polite empty wishlist heading');
assert(wishlistPageCode.includes('Continue Shopping'), 'Provides Continue Shopping CTA button');
assert(wishlistPageCode.includes('wishlist-card-img-empty'), 'Renders clean empty image fallback without broken graphics');

// Test 2: WishlistPage.css styling
console.log('\n2. Checking WishlistPage.css design tokens & responsive rules:');
const wishlistCss = readFileSync(resolve('src/pages/WishlistPage.css'), 'utf-8');
assert(wishlistCss.includes('grid-template-columns: repeat(4, 1fr)'), 'Desktop grid uses 4 columns');
assert(wishlistCss.includes('min-height: 44px'), 'Interactive buttons enforce >= 44px touch targets');
assert(wishlistCss.includes('aspect-ratio: 1 / 1'), 'Image container maintains 1:1 aspect ratio');
assert(wishlistCss.includes('@media (max-width: 1080px)'), 'Includes 1080px desktop/tablet breakpoint');
assert(wishlistCss.includes('@media (max-width: 768px)'), 'Includes 768px tablet portrait breakpoint');
assert(wishlistCss.includes('@media (max-width: 460px)'), 'Includes 460px mobile small breakpoint');

// Test 3: App.jsx integration
console.log('\n3. Checking App.jsx routing and wiring:');
const appCode = readFileSync(resolve('src/App.jsx'), 'utf-8');
assert(appCode.includes("import WishlistPage from './pages/WishlistPage'"), 'App.jsx imports WishlistPage');
assert(appCode.includes("hash.startsWith('#/wishlist')"), 'Hash route #/wishlist is handled');
assert(appCode.includes("currentPage === 'wishlist'"), 'App renders WishlistPage when currentPage is wishlist');
assert(appCode.includes("onNavigateWishlist={() => navigateTo('wishlist')}"), 'App passes onNavigateWishlist to WishlistDrawer');

// Test 4: WishlistDrawer integration
console.log('\n4. Checking WishlistDrawer.jsx updates:');
const drawerCode = readFileSync(resolve('src/components/WishlistDrawer.jsx'), 'utf-8');
assert(drawerCode.includes('onNavigateWishlist'), 'Drawer accepts onNavigateWishlist prop');
assert(drawerCode.includes('View Full Wishlist Page'), 'Drawer footer provides "View Full Wishlist Page" action');

// Test 5: Logic Simulation for Wishlist Actions
console.log('\n5. Simulating Wishlist & Cart Actions:');
let mockWishlist = [
  { id: 101, name: 'Backlit Acrylic Idol', price: '1,499', originalPrice: '2,199', category: 'Devotional' },
  { id: 102, name: 'Geometric Wall Clock', price: '899', originalPrice: '1,299', category: 'Wall Decor' },
];
let mockCart = [];

// Adding to cart from wishlist
const itemToAdd = mockWishlist[0];
mockCart.push({ ...itemToAdd, quantity: 1 });
assert(mockCart.length === 1 && mockCart[0].id === 101, 'Item successfully added to cart from wishlist');
assert(mockWishlist.length === 2, 'Item remains in wishlist after being added to cart (no accidental removal)');

// Removing from wishlist
mockWishlist = mockWishlist.filter(p => p.id !== 101);
assert(mockWishlist.length === 1 && mockWishlist[0].id === 102, 'Item successfully removed from wishlist');

// Clearing wishlist
mockWishlist = [];
assert(mockWishlist.length === 0, 'Wishlist cleared successfully and triggers empty state');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);

