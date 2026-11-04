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

console.log('--- TEST SUITE: Homepage Final Quality Audit (Step 8) ---');

// 1. HeroSlider checks
console.log('\n1. Checking HeroSlider component & controls:');
const heroCode = readFileSync(resolve('src/components/HeroSlider.jsx'), 'utf-8');
const heroCss = readFileSync(resolve('src/components/HeroSlider.css'), 'utf-8');
assert(heroCode.includes('Wall Hangings') && heroCode.includes('Dashboard Idols') && heroCode.includes('Metal Wall Art'), 'Hero slides mapped to legitimate Shop categories');
assert(heroCode.includes('onSelectCategory(s.category)'), 'Hero CTA buttons invoke onSelectCategory');
assert(heroCode.includes('hero-arrow hero-prev') && heroCode.includes('hero-arrow hero-next'), 'Previous and Next controls present');
assert(heroCode.includes('hero-dot'), 'Slide dot indicators present');
assert(heroCss.includes('min-width: 44px') && heroCss.includes('min-height: 44px'), 'Hero arrow controls enforce >= 44px touch targets');
assert(heroCss.includes('min-height: 44px'), 'Hero CTA button enforces >= 44px touch target');

// 2. Category Navigation checks
console.log('\n2. Checking CategoryScrollbar component:');
const catCode = readFileSync(resolve('src/components/CategoryScrollbar.jsx'), 'utf-8');
const catCss = readFileSync(resolve('src/components/CategoryScrollbar.css'), 'utf-8');
assert(catCode.includes('Wall Hangings') && catCode.includes('Backlit LED Frames') && catCode.includes('Dashboard Idols'), 'Category scrollbar contains authentic home decor categories');
assert(catCode.includes('onSelectCategory(category.label)'), 'Category clicks trigger onSelectCategory');
assert(catCss.includes('overflow-x: auto') || catCss.includes('-webkit-overflow-scrolling: touch'), 'Supports horizontal touch scrolling');

// 3. StyleCollection checks
console.log('\n3. Checking StyleCollection component:');
const styleCode = readFileSync(resolve('src/components/StyleCollection.jsx'), 'utf-8');
const styleCss = readFileSync(resolve('src/components/StyleCollection.css'), 'utf-8');
assert(styleCode.includes('style-card-img-empty'), 'Style cards feature clean image fallback');
assert(styleCode.includes('onSelectCategory(category)'), 'Collection cards navigate to correct category');
assert(styleCss.includes('.style-card-img-empty'), 'CSS styling provided for empty collection card container');

// 4. ProductSection checks (Featured Products)
console.log('\n4. Checking ProductSection component & cart/wishlist integration:');
const prodSecCode = readFileSync(resolve('src/components/ProductSection.jsx'), 'utf-8');
const prodSecCss = readFileSync(resolve('src/components/ProductSection.css'), 'utf-8');
assert(prodSecCode.includes('addToCart(product, 1)'), 'Add to Cart integrated with shared cart context');
assert(prodSecCode.includes('toggleWishlist(p)'), 'Wishlist heart action integrated with shared wishlist context');
assert(prodSecCode.includes('Added to Cart ✓'), 'Visual feedback state provided on Add to Cart');
assert(prodSecCode.includes('prod-img-empty'), 'Safe image container handles missing or failing images');
assert(prodSecCode.includes('btn-view-more'), 'VIEW MORE CTA button rendered for category expansion');
assert(prodSecCss.includes('min-height: 44px'), 'VIEW MORE button satisfies >= 44px touch target');
assert(prodSecCss.includes('.prod-cart-btn'), 'Product card cart button styled with brand teal');

// 5. Promotional Banners & Unverified Claims
console.log('\n5. Checking PromoBanner & Testimonials claims:');
const promoCode = readFileSync(resolve('src/components/PromoBanner.jsx'), 'utf-8');
const testCode = readFileSync(resolve('src/components/Testimonials.jsx'), 'utf-8');
assert(promoCode.includes('onNavigateShop'), 'PromoBanner supports click-to-shop navigation');
assert(!testCode.includes('10,000+ Happy Homes'), 'Unverified claim "10,000+ Happy Homes" removed');
assert(testCode.includes('Customer Appreciation'), 'Honest and authentic section title in Testimonials');

// 6. App.jsx Wiring checks
console.log('\n6. Checking App.jsx homepage section composition:');
const appCode = readFileSync(resolve('src/App.jsx'), 'utf-8');
assert(appCode.includes('<HeroSlider onSelectCategory='), 'App connects HeroSlider with navigateTo');
assert(appCode.includes('<ProductSection') && appCode.includes('onViewMore='), 'App passes onViewMore to ProductSections');
assert(appCode.includes('<PromoBanner onNavigateShop='), 'App passes onNavigateShop to PromoBanner');

// 7. Responsive CSS Breakpoint Coverage
console.log('\n7. Checking responsive breakpoints across homepage components:');
assert(prodSecCss.includes('@media (max-width: 992px)'), 'ProductSection handles tablet landscape');
assert(prodSecCss.includes('@media (max-width: 768px)'), 'ProductSection handles tablet portrait');
assert(prodSecCss.includes('@media (max-width: 420px)'), 'ProductSection handles mobile screens');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
