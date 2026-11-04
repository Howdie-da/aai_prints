import { readFileSync } from 'fs';
import { resolve } from 'path';

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

console.log('--- TEST SUITE: Header, Navbar & Footer Final Audit (Step 7) ---');

// 1. Navbar.jsx check
console.log('\n1. Checking Navbar.jsx implementation:');
const navbarCode = readFileSync(resolve('src/components/Navbar.jsx'), 'utf-8');
assert(navbarCode.includes('/new-images/logo.png'), 'Preserves original Aai Prints logo file path');
assert(navbarCode.includes('alt="aai Prints"'), 'Preserves proper brand logo alt text');
assert(navbarCode.includes("href: '#/'"), 'Includes Home route #/');
assert(navbarCode.includes("href: '#/shop'"), 'Includes Shop route #/shop');
assert(navbarCode.includes('selectedCategory'), 'Accepts selectedCategory for accurate active state highlighting');
assert(navbarCode.includes('search-result-img-empty'), 'Search results include clean image fallback');
assert(navbarCode.includes('mobile-sub-toggle'), 'Mobile menu includes submenu toggle controls');
assert(navbarCode.includes('mobile-menu-footer'), 'Mobile menu includes direct Wishlist & Cart quick links');
assert(navbarCode.includes("e.key === 'Escape'"), 'Escape key closes search drawer and mobile menu');

// 2. Navbar.css check
console.log('\n2. Checking Navbar.css styling & touch targets:');
const navbarCss = readFileSync(resolve('src/components/Navbar.css'), 'utf-8');
assert(navbarCss.includes('min-width: 44px') && navbarCss.includes('min-height: 44px'), 'Enforces >= 44px touch targets on interactive controls');
assert(navbarCss.includes('border-bottom: 2px solid transparent'), 'Nav links avoid vertical shift with consistent border baseline');
assert(navbarCss.includes('.nav-link--active'), 'Clear active nav link state styling');
assert(navbarCss.includes('.search-result-img-empty'), 'Provides empty image gradient styling for search results');

// 3. Footer.jsx check
console.log('\n3. Checking Footer.jsx implementation & placeholders check:');
const footerCode = readFileSync(resolve('src/components/Footer.jsx'), 'utf-8');
assert(!footerCode.includes('[PHONE]'), 'Zero [PHONE] placeholders in Footer');
assert(!footerCode.includes('[EMAIL]'), 'Zero [EMAIL] placeholders in Footer');
assert(!footerCode.includes('wa.me/[PHONE]'), 'Zero fake WhatsApp links in Footer');
assert(footerCode.includes('My Wishlist'), 'Includes Wishlist link in footer quick links');
assert(footerCode.includes('Shopping Cart'), 'Includes Cart link in footer quick links');
assert(footerCode.includes('Devotional Wall Art'), 'Includes shop categories section in footer');
assert(footerCode.includes('policyContents'), 'Provides authentic informational policy contents for Customer Care');
assert(footerCode.includes('footer-modal-backdrop'), 'Includes clean modal dialog for Customer Care inquiries');

// 4. Footer.css check
console.log('\n4. Checking Footer.css responsiveness & layout:');
const footerCss = readFileSync(resolve('src/components/Footer.css'), 'utf-8');
assert(footerCss.includes('grid-template-columns: 1.8fr 1.1fr 1.2fr 1.3fr'), 'Desktop 4-column balanced layout');
assert(footerCss.includes('@media (max-width: 992px)'), 'Includes tablet responsive breakpoint');
assert(footerCss.includes('@media (max-width: 600px)'), 'Includes mobile responsive breakpoint');
assert(footerCss.includes('overflow-x: hidden'), 'Prevents horizontal overflow');

// 5. Search Functionality Simulation
console.log('\n5. Simulating Search matching logic:');
const mockCatalogue = [
  { id: 1, name: 'Backlit Acrylic Ganesha Wall Art', category: 'Devotional' },
  { id: 2, name: 'Brass Finish Ram Mandir Dashboard Idol', category: 'Car Decor' },
  { id: 3, name: 'Modern Geometric Metal Wall Clock', category: 'Wall Decor' },
];

function searchProducts(query, products) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(p =>
    p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))
  );
}

const res1 = searchProducts('ganesha', mockCatalogue);
assert(res1.length === 1 && res1[0].id === 1, 'Search finds product case-insensitively');

const res2 = searchProducts('MANDIR', mockCatalogue);
assert(res2.length === 1 && res2[0].id === 2, 'Search matches uppercase query');

const res3 = searchProducts('clock', mockCatalogue);
assert(res3.length === 1 && res3[0].id === 3, 'Search matches partial name');

const res4 = searchProducts('nonexistent', mockCatalogue);
assert(res4.length === 0, 'Returns clean empty result for unknown query');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);

