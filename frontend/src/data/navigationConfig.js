/**
 * ─────────────────────────────────────────────────────────────
 * Aai Prints — Navigation Configuration & Active State Resolver
 * ─────────────────────────────────────────────────────────────
 * Provides:
 *  - navLinks: Top-level menu hierarchy and children
 *  - CATEGORY_TO_PARENT_NAV: Deterministic 1-to-1 canonical category
 *    to parent navigation mapping (strictly zero overlap)
 *  - getActiveNavLabel: Evaluates strictly at most one active label
 * ─────────────────────────────────────────────────────────────
 */

export const CATEGORY_TO_PARENT_NAV = {
  // Car Décor
  'car décor': 'CAR DÉCOR',
  'car decor': 'CAR DÉCOR',
  'dashboard idols': 'CAR DÉCOR',
  'car hangings': 'CAR DÉCOR',
  'combo sets': 'CAR DÉCOR',

  // Devotional
  'devotional': 'DEVOTIONAL',
  'devotional décor': 'DEVOTIONAL',
  'devotional decor': 'DEVOTIONAL',
  'wall hangings': 'DEVOTIONAL',
  'backlit led frames': 'DEVOTIONAL',
  'idols & tabletop': 'DEVOTIONAL',
  'idols and tabletop': 'DEVOTIONAL',
  'yantra & chakra': 'DEVOTIONAL',
  'yantra and chakra': 'DEVOTIONAL',

  // Wall Décor
  'wall décor': 'WALL DÉCOR',
  'wall decor': 'WALL DÉCOR',
  'metal wall art': 'WALL DÉCOR',
  'wall clocks': 'WALL DÉCOR',
  'framed art': 'WALL DÉCOR',
  'framed wall art': 'WALL DÉCOR',

  // Festive
  'festive': 'FESTIVE',
  'ganesh chaturthi': 'FESTIVE',
  'jhanki sets': 'FESTIVE',
  'diwali': 'FESTIVE',

  // Gifts
  'gifts': 'GIFTS',
  'desk standees': 'GIFTS',
  'gift combos': 'GIFTS',
  'return gifts': 'GIFTS',
};

/**
 * Computes the single canonical active top-level nav link.
 * Guarantees strictly at most 1 item has active status.
 */
export const getActiveNavLabel = (currentPage, selectedCategory) => {
  if (currentPage === 'home') {
    if (selectedCategory === 'reviews') {
      return 'REVIEWS';
    }
    return 'HOME';
  }
  if (currentPage === 'shop') {
    if (!selectedCategory || selectedCategory === 'All') {
      return 'SHOP';
    }
    const normalized = String(selectedCategory).trim().toLowerCase();
    return CATEGORY_TO_PARENT_NAV[normalized] || 'SHOP';
  }
  // Dedicated PDP, Cart, or Wishlist views do not underline category tabs
  return '';
};

export const navLinks = [
  { label: 'HOME', href: '#/', page: 'home', category: 'All', hasDropdown: false },
  { label: 'SHOP', href: '#/shop', page: 'shop', category: 'All', hasDropdown: false },
  { 
    label: 'DEVOTIONAL', 
    href: '#/shop?category=Devotional', 
    page: 'shop',
    category: 'Devotional',
    hasDropdown: true,
    children: [
      { label: 'Wall Hangings', href: '#/shop?category=Wall%20Hangings', category: 'Wall Hangings' },
      { label: 'Backlit LED Frames', href: '#/shop?category=Backlit%20LED%20Frames', category: 'Backlit LED Frames' },
      { label: 'Idols & Tabletop', href: '#/shop?category=Idols%20%26%20Tabletop', category: 'Idols & Tabletop' },
      { label: 'Yantra & Chakra', href: '#/shop?category=Yantra%20%26%20Chakra', category: 'Yantra & Chakra' },
    ]
  },
  { 
    label: 'CAR DÉCOR', 
    href: '#/shop?category=Car%20D%C3%A9cor', 
    page: 'shop',
    category: 'Car Décor',
    hasDropdown: true,
    children: [
      { label: 'Dashboard Idols', href: '#/shop?category=Dashboard%20Idols', category: 'Dashboard Idols' },
      { label: 'Car Hangings', href: '#/shop?category=Car%20Hangings', category: 'Car Hangings' },
      { label: 'Combo Sets', href: '#/shop?category=Combo%20Sets', category: 'Combo Sets' },
    ]
  },
  { 
    label: 'WALL DÉCOR', 
    href: '#/shop?category=Wall%20D%C3%A9cor', 
    page: 'shop',
    category: 'Wall Décor',
    hasDropdown: true,
    children: [
      { label: 'Metal Wall Art', href: '#/shop?category=Metal%20Wall%20Art', category: 'Metal Wall Art' },
      { label: 'Wall Clocks', href: '#/shop?category=Wall%20Clocks', category: 'Wall Clocks' },
      { label: 'Framed Art', href: '#/shop?category=Framed%20Art', category: 'Framed Art' },
    ]
  },
  { 
    label: 'FESTIVE', 
    href: '#/shop?category=Festive', 
    page: 'shop',
    category: 'Festive',
    hasDropdown: true,
    children: [
      { label: 'Ganesh Chaturthi', href: '#/shop?category=Ganesh%20Chaturthi', category: 'Ganesh Chaturthi' },
      { label: 'Jhanki Sets', href: '#/shop?category=Jhanki%20Sets', category: 'Jhanki Sets' },
      { label: 'Diwali', href: '#/shop?category=Diwali', category: 'Diwali' },
    ]
  },
  { 
    label: 'GIFTS', 
    href: '#/shop?category=Gifts', 
    page: 'shop',
    category: 'Gifts',
    hasDropdown: true,
    children: [
      { label: 'Desk Standees', href: '#/shop?category=Desk%20Standees', category: 'Desk Standees' },
      { label: 'Gift Combos', href: '#/shop?category=Gift%20Combos', category: 'Gift Combos' },
      { label: 'Return Gifts', href: '#/shop?category=Return%20Gifts', category: 'Return Gifts' },
    ]
  },
  { label: 'REVIEWS', href: '#/reviews', page: 'home', category: 'reviews', hasDropdown: false },
];

