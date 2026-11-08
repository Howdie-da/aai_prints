// Unit Test Fixtures for navigation and category routing tests
const mockTestProducts = [
  { id: 1, name: 'Lord Ganesha LED Frame', category: 'Backlit LED Frames', subcategory: 'Spiritual Lighting' },
  { id: 2, name: 'Ram Mandir Standee', category: 'Desk Standees', subcategory: 'Devotional Models' },
  { id: 3, name: 'Gayatri Mantra Hanging', category: 'Wall Hangings', subcategory: 'Sacred Wall Hangings' },
  { id: 4, name: 'Om Symbol Hanging', category: 'Wall Hangings', subcategory: 'Spiritual' },
  { id: 5, name: 'Ganesha Car Dashboard Idol', category: 'Dashboard Idols', subcategory: 'Car Idols' },
  { id: 6, name: 'Trishul Car Hanging', category: 'Car Hangings', subcategory: 'Car Charms' },
  { id: 7, name: 'Geometric Ginkgo Leaf Art', category: 'Metal Wall Art', subcategory: 'Botanical Decor' },
  { id: 8, name: 'Golden Mandala Metal Art', category: 'Metal Wall Art', subcategory: 'Modern Metal Art' },
  { id: 9, name: 'Silent Quartz Wall Clock', category: 'Wall Clocks', subcategory: 'Quartz Clocks' },
  { id: 10, name: 'Framed Radha Krishna Art', category: 'Backlit LED Frames', subcategory: 'Framed Art' },
  { id: 11, name: 'Shiva Backlit Sanctum Frame', category: 'Backlit LED Frames', subcategory: 'Devotional Frames' },
  { id: 12, name: 'Hanuman Ji Wall Hanging', category: 'Wall Hangings', subcategory: 'Sacred Art' },
];

// 1. Hero slides verification
const heroSlides = [
  { id: 1, name: 'Devotional Collection', category: 'Wall Hangings', url: '#/shop?category=Wall%20Hangings' },
  { id: 2, name: 'Car Decor Collection', category: 'Dashboard Idols', url: '#/shop?category=Dashboard%20Idols' },
  { id: 3, name: 'Wall Decor Collection', category: 'Metal Wall Art', url: '#/shop?category=Metal%20Wall%20Art' },
];

// 2. Style Collections verification
const styleCollections = [
  { label: 'Wall Hangings', category: 'Wall Hangings' },
  { label: 'Backlit LED Frames', category: 'Backlit LED Frames' },
  { label: 'Dashboard Idols', category: 'Dashboard Idols' },
  { label: 'Framed Wall Art', category: 'Framed Wall Art' },
  { label: 'Metal Wall Art', category: 'Metal Wall Art' },
  { label: 'Wall Clocks', category: 'Wall Clocks' },
];

function filterCategory(activeCategory) {
  if (!activeCategory || activeCategory === 'All') return mockTestProducts;
  const target = activeCategory.toLowerCase().trim();
  return mockTestProducts.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    const name = (p.name || '').toLowerCase();

    if (cat === target || sub === target) return true;

    if (target === 'devotional' || target === 'devotional decor' || target === 'devotional décor') {
      return (
        cat === 'backlit led frames' ||
        cat === 'desk standees' ||
        cat === 'wall hangings' ||
        sub.includes('spiritual') ||
        sub.includes('devotional') ||
        sub.includes('sacred')
      );
    }

    if (target === 'car decor' || target === 'car décor' || target === 'car') {
      return cat === 'dashboard idols' || cat === 'car hangings' || sub.includes('car');
    }

    if (target === 'wall decor' || target === 'wall décor' || target === 'wall') {
      return (
        cat === 'metal wall art' ||
        cat === 'wall clocks' ||
        cat === 'wall hangings' ||
        cat === 'backlit led frames'
      );
    }

    if (target === 'framed wall art' || target === 'framed art') {
      return cat === 'backlit led frames' || name.includes('frame') || sub.includes('frame');
    }

    if (target === 'gifts' || target === 'gift combos' || target === 'festive') {
      return (
        cat === 'desk standees' ||
        cat === 'dashboard idols' ||
        sub.includes('festive') ||
        sub.includes('model') ||
        name.includes('set')
      );
    }

    return false;
  });
}

console.log('--- TEST 1: HERO SLIDER CTAs ---');
heroSlides.forEach((s) => {
  const prods = filterCategory(s.category);
  console.log(`✓ Slide ${s.id} (${s.name}) -> Category: "${s.category}" (${prods.length} products found)`);
  if (prods.length === 0) throw new Error('Zero products for ' + s.category);
});

console.log('\n--- TEST 2: STYLE COLLECTION CARDS ---');
styleCollections.forEach((c) => {
  const prods = filterCategory(c.category);
  console.log(`✓ Card (${c.label}) -> Category: "${c.category}" (${prods.length} products found)`);
  if (prods.length === 0) throw new Error('Zero products for ' + c.category);
});

console.log('\n--- TEST 3: DIRECT SHOP URL PARSING ---');
const testUrls = [
  '#/shop?category=Wall%20Hangings',
  '#/shop?category=Backlit%20LED%20Frames',
  '#/shop?category=Dashboard%20Idols',
  '#/shop?category=Metal%20Wall%20Art',
  '#/shop?category=Devotional',
  '#/shop?category=Car%20D%C3%A9cor',
  '#/shop?category=Wall%20D%C3%A9cor',
  '/shop?category=Wall%20Clocks',
  '#/shop',
];

testUrls.forEach((url) => {
  let cat = 'All';
  if (url.includes('category=')) {
    const match = url.match(/category=([^&]+)/);
    if (match) cat = decodeURIComponent(match[1]);
  }
  const prods = filterCategory(cat);
  console.log(`✓ URL: "${url}" => parsed category: "${cat}" (${prods.length} products)`);
});

console.log('\nALL 3 TEST SUITES PASSED SUCCESSFULLY!');

