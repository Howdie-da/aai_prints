/**
 * ─────────────────────────────────────────────────────────────
 * Aai Prints — Product Catalogue Data Store
 * ─────────────────────────────────────────────────────────────
 * Reusable product schema supporting:
 *  - id, slug, name
 *  - category, subcategory
 *  - price, originalPrice
 *  - description, images, image
 *  - variants (size / finish)
 *  - availability (stock status)
 *  - rating, reviews, tag
 *  - specifications (dimensions, material, finish, etc.)
 *
 * NOTE: Images use verified paths from public/new-images/.
 * When real client product photography is provided, update
 * the image paths in this file or connect via productService.js.
 * ─────────────────────────────────────────────────────────────
 */

export const products = [
  {
    id: 1,
    slug: 'lord-ganesha-backlit-led-wooden-frame',
    name: 'Lord Ganesha Backlit LED Wooden Frame (9×12 Inch)',
    category: 'Backlit LED Frames',
    subcategory: 'Spiritual Lighting',
    price: '899',
    originalPrice: '1,299',
    image: '/new-images/cat-backlit-led-frames.jpg',
    images: [
      '/new-images/cat-backlit-led-frames.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 18,
    rating: 4.8,
    reviews: 14,
    tag: 'Best Seller',
    variants: [
      { id: 'v-1a', label: '9 × 12 Inch (Warm White)', inStock: true },
      { id: 'v-1b', label: '12 × 16 Inch (Warm White)', inStock: true },
    ],
    description:
      'Immerse your space in divine grace with our Lord Ganesha Backlit LED Wooden Frame. Precision laser-cut multi-layer wooden craftsmanship backlit with energy-efficient warm LEDs, creating a captivating spiritual aura for temples, living rooms, and office entrances.',
    specifications: {
      dimensions: '9 × 12 × 1.25 Inches',
      material: 'Engineered Pine Wood & Acrylic Diffuser',
      lighting: '12V Warm White LED Strip with 1.5m Power Adapter',
      mounting: 'Wall-mountable bracket pre-installed + Tabletop Kickstand',
      care: 'Wipe gently with a soft dry microfiber cloth.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 2,
    slug: 'shree-ram-mandir-ayodhya-3d-wooden-tabletop-model',
    name: 'Shree Ram Mandir Ayodhya 3D Wooden Tabletop Model',
    category: 'Desk Standees',
    subcategory: 'Wooden Models',
    price: '649',
    originalPrice: '999',
    image: '/new-images/cat-desk-standees.jpg',
    images: [
      '/new-images/cat-desk-standees.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 25,
    rating: 4.9,
    reviews: 28,
    tag: 'New Arrival',
    variants: [
      { id: 'v-2a', label: 'Standard (6 × 4 Inch)', inStock: true },
      { id: 'v-2b', label: 'Grand (8 × 6 Inch)', inStock: true },
    ],
    description:
      'Authentic 3D architectural miniature of the historic Shree Ram Janmabhoomi Mandir in Ayodhya. Finely detailed layered MDF woodwork with a natural wood finish. An inspiring addition to work desks, study tables, and pooja mandirs.',
    specifications: {
      dimensions: '6 × 4 × 5.5 Inches',
      material: 'Laser-Cut High-Density MDF Wood',
      finish: 'Natural Matte Teak Polish',
      mounting: 'Freestanding sturdy base',
      care: 'Keep away from direct moisture.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 3,
    slug: 'maha-mrityunjaya-sacred-brass-yantra-wall-plate',
    name: 'Maha Mrityunjaya Sacred Brass Yantra Wall Plate',
    category: 'Wall Hangings',
    subcategory: 'Sacred Yantras',
    price: '499',
    originalPrice: '799',
    image: '/new-images/cat-wall-hangings.jpg',
    images: [
      '/new-images/cat-wall-hangings.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 12,
    rating: 4.7,
    reviews: 9,
    tag: '',
    variants: [
      { id: 'v-3a', label: 'Antique Brass (6 Inch)', inStock: true },
      { id: 'v-3b', label: 'Gloss Gold (6 Inch)', inStock: true },
    ],
    description:
      'Ancient Maha Mrityunjaya Yantra engraved with precision on a sacred brass plate. Known for infusing positive vibrations, protection, and peaceful energies across the home.',
    specifications: {
      dimensions: '6 Inch Diameter',
      material: 'Pure Embossed Brass Plate',
      finish: 'Anti-tarnish Lacquered Gold Coating',
      mounting: 'Rear brass loop for easy nail hanging',
      care: 'Clean with dry cloth; do not scrub with harsh chemicals.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 4,
    slug: 'radha-krishna-spiritual-premium-acrylic-wall-hanging',
    name: 'Radha Krishna Spiritual Premium Acrylic Wall Hanging',
    category: 'Wall Hangings',
    subcategory: 'Divine Wall Hangings',
    price: '799',
    originalPrice: '1,199',
    image: '/new-images/cat-wall-hangings.jpg',
    images: [
      '/new-images/cat-wall-hangings.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 15,
    rating: 4.8,
    reviews: 21,
    tag: 'Best Seller',
    variants: [
      { id: 'v-4a', label: '12 × 12 Inch (Gloss Black & Gold)', inStock: true },
      { id: 'v-4b', label: '16 × 16 Inch (Gloss Black & Gold)', inStock: true },
    ],
    description:
      'Elegant Radha Krishna silhouette wall art crafted from high-grade imported cast acrylic. The glossy black finish accented with golden flute accents radiates serene devotional warmth.',
    specifications: {
      dimensions: '12 × 12 × 0.2 Inches',
      material: 'Cast Acrylic Glass (3mm thick)',
      finish: 'High-Gloss Dual Tone (Jet Black & Mirror Gold)',
      mounting: 'Heavy-duty pre-applied 3M mounting tape + wall screw hooks',
      care: 'Wipe with microfiber cloth to prevent micro-scratches.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 5,
    slug: 'shiv-trishul-damru-metal-wall-art',
    name: 'Shiv Trishul & Damru Metal Wall Art (Black & Gold)',
    category: 'Metal Wall Art',
    subcategory: 'Metal Cutouts',
    price: '1,199',
    originalPrice: '1,899',
    image: '/new-images/cat-metal-wall-art.jpg',
    images: [
      '/new-images/cat-metal-wall-art.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-wall-decor.jpg',
    ],
    availability: 'in_stock',
    stockCount: 10,
    rating: 4.9,
    reviews: 35,
    tag: 'Best Seller',
    variants: [
      { id: 'v-5a', label: '18 Inch (Matte Black & Gold)', inStock: true },
      { id: 'v-5b', label: '24 Inch (Matte Black & Gold)', inStock: true },
    ],
    description:
      'Powerful Lord Shiva Trishul & Damru metal wall sculpture. Crafted from heavy-gauge powder-coated wrought iron with subtle hand-painted gold highlights. Rust-resistant and designed for lifetime durability.',
    specifications: {
      dimensions: '18 × 9 Inches (1.5mm Heavy Mild Steel)',
      material: 'Rust-Proof Powder-Coated Mild Steel',
      finish: 'Matte Black Textured Finish with Hand-rubbed Antique Gold',
      mounting: 'Concealed standoff brackets for 3D shadow float effect',
      care: 'Dust with soft dry cloth.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 6,
    slug: 'hanuman-chalisa-backlit-warm-light-frame',
    name: 'Hanuman Chalisa Backlit Warm Light Frame',
    category: 'Backlit LED Frames',
    subcategory: 'Devotional Frames',
    price: '999',
    originalPrice: '1,499',
    image: '/new-images/cat-backlit-led-frames.jpg',
    images: [
      '/new-images/cat-backlit-led-frames.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 14,
    rating: 4.8,
    reviews: 18,
    tag: '',
    variants: [
      { id: 'v-6a', label: '10 × 14 Inch (Warm Glow)', inStock: true },
    ],
    description:
      'Complete Hanuman Chalisa verses inscribed with illuminated warm LED backlighting. Fills your home with courage, positive protection, and peaceful spiritual illumination.',
    specifications: {
      dimensions: '10 × 14 × 1.5 Inches',
      material: 'Solid Wood Composite Frame & UV Light Filter Sheet',
      lighting: 'Low-voltage 12V LED Strip with power cord & plug',
      mounting: 'Wall hook installed',
      care: 'Clean with dry feather duster.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 7,
    slug: 'gayatri-mantra-illuminated-acrylic-tabletop-standee',
    name: 'Gayatri Mantra Illuminated Acrylic Tabletop Standee',
    category: 'Desk Standees',
    subcategory: 'Illuminated Standees',
    price: '449',
    originalPrice: '699',
    image: '/new-images/cat-desk-standees.jpg',
    images: [
      '/new-images/cat-desk-standees.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 20,
    rating: 4.6,
    reviews: 12,
    tag: 'New Arrival',
    variants: [
      { id: 'v-7a', label: 'Warm White Glow', inStock: true },
      { id: 'v-7b', label: 'Amber Sun Glow', inStock: true },
    ],
    description:
      'Sacred Gayatri Mantra engraved on ultra-clear optical grade acrylic, slotted into a solid wooden LED base. Emits a calming radiance ideal for meditation rooms and study desks.',
    specifications: {
      dimensions: '6 × 7 × 1.8 Inches',
      material: 'Optical Acrylic Plate & Beechwood Base',
      lighting: 'USB-powered warm LED base with on/off switch cable',
      mounting: 'Tabletop / Desktop',
      care: 'Avoid alcohol wipes; clean using microfiber cloth.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 8,
    slug: 'om-swastik-sacred-wall-hanging-set-of-2',
    name: 'Om & Swastik Sacred Wall Hanging Set of 2',
    category: 'Wall Hangings',
    subcategory: 'Festive Hangings',
    price: '349',
    originalPrice: '549',
    image: '/new-images/cat-wall-hangings.jpg',
    images: [
      '/new-images/cat-wall-hangings.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-devotional.jpg',
    ],
    availability: 'in_stock',
    stockCount: 30,
    rating: 4.7,
    reviews: 16,
    tag: '',
    variants: [
      { id: 'v-8a', label: 'Set of 2 (5 Inch Each)', inStock: true },
    ],
    description:
      'Traditional auspicious Om and Swastik pair designed for entrance doors, pooja spaces, and festive gifting. Intricate filigree floral carving with polished brass finish.',
    specifications: {
      dimensions: '5 × 5 Inches each',
      material: 'Cast Zinc-Alloy with Brass Electroplating',
      finish: 'Golden Gloss Finish',
      mounting: 'Adhesive backing or nail hook',
      care: 'Keep in dry environment.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 9,
    slug: 'lord-ganesha-brass-dashboard-idol-with-wooden-base',
    name: 'Lord Ganesha Brass Dashboard Idol with Wooden Base',
    category: 'Dashboard Idols',
    subcategory: 'Brass Idols',
    price: '399',
    originalPrice: '599',
    image: '/new-images/cat-dashboard-idols.jpg',
    images: [
      '/new-images/cat-dashboard-idols.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-car-decor.jpg',
    ],
    availability: 'in_stock',
    stockCount: 35,
    rating: 4.9,
    reviews: 42,
    tag: 'Best Seller',
    variants: [
      { id: 'v-9a', label: 'Classic Brass with Teak Base', inStock: true },
      { id: 'v-9b', label: 'Antique Copper with Dark Base', inStock: true },
    ],
    description:
      'Compact Lord Ganesha idol cast in pure solid brass, firmly mounted on a polished natural wood base. Includes high-bond automotive grade peel-and-stick adhesive tape for dashboards.',
    specifications: {
      dimensions: '2.8 × 2 × 3 Inches',
      material: 'Solid Cast Brass & Natural Hardwood Base',
      weight: '160 grams',
      mounting: 'Pre-fitted automotive heat-resistant double-sided tape',
      care: 'Wipe with clean dry cloth.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 10,
    slug: 'handcrafted-macrame-brass-bell-car-hanging',
    name: 'Handcrafted Macrame & Brass Bell Car Hanging',
    category: 'Car Hangings',
    subcategory: 'Car Accessories',
    price: '249',
    originalPrice: '399',
    image: '/new-images/cat-car-hangings.jpg',
    images: [
      '/new-images/cat-car-hangings.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-car-decor.jpg',
    ],
    availability: 'in_stock',
    stockCount: 40,
    rating: 4.7,
    reviews: 19,
    tag: '',
    variants: [
      { id: 'v-10a', label: 'Beige & Antique Brass', inStock: true },
      { id: 'v-10b', label: 'Earthy Green & Gold', inStock: true },
    ],
    description:
      'Bohemian macrame rear-view mirror hanging with a handcrafted brass bell and natural wooden beads. Emits a gentle soothing chime with vehicle motion while driving.',
    specifications: {
      dimensions: '8.5 Inches total drop length',
      material: '100% Organic Cotton Cord, Wooden Beads & Cast Brass Bell',
      mounting: 'Adjustable loop for rear-view mirror hanging',
      care: 'Spot clean only.',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 11,
    slug: 'minimalist-silent-quartz-decorative-wall-clock',
    name: 'Minimalist Silent Quartz Decorative Wall Clock (12 Inch)',
    category: 'Wall Clocks',
    subcategory: 'Quartz Clocks',
    price: '849',
    originalPrice: '1,299',
    image: '/new-images/cat-wall-clocks.jpg',
    images: [
      '/new-images/cat-wall-clocks.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-wall-decor.jpg',
    ],
    availability: 'in_stock',
    stockCount: 16,
    rating: 4.8,
    reviews: 31,
    tag: 'Best Seller',
    variants: [
      { id: 'v-11a', label: '12 Inch (Natural Wood & Gold Hands)', inStock: true },
      { id: 'v-11b', label: '12 Inch (Matte White & Walnut Hands)', inStock: true },
    ],
    description:
      'Scandinavian-inspired silent sweep quartz wall clock. Non-ticking silent movement ensures zero noise in bedrooms and living rooms. Features clean numerical markings and elegant hands.',
    specifications: {
      dimensions: '12 Inch Diameter × 1.6 Inch Depth',
      material: 'Natural Pine Wood Frame & Glass Lens',
      movement: 'Silent Sweep Quartz (Non-Ticking)',
      power: 'Requires 1 × AA Battery (included)',
      mounting: 'Keyhole bracket on rear',
      origin: 'Proudly Handcrafted in India',
    },
  },
  {
    id: 12,
    slug: 'geometric-ginkgo-leaf-metal-wall-art',
    name: 'Geometric Ginkgo Leaf Metal Wall Art (Gold Finish)',
    category: 'Metal Wall Art',
    subcategory: 'Botanical Decor',
    price: '1,499',
    originalPrice: '2,299',
    image: '/new-images/cat-metal-wall-art.jpg',
    images: [
      '/new-images/cat-metal-wall-art.jpg',
      '/new-images/product-placeholder.jpg',
      '/new-images/hero-wall-decor.jpg',
    ],
    availability: 'in_stock',
    stockCount: 8,
    rating: 4.9,
    reviews: 23,
    tag: 'New Arrival',
    variants: [
      { id: 'v-12a', label: 'Set of 2 Panels (24 × 12 Inch)', inStock: true },
      { id: 'v-12b', label: 'Single Statement Panel (30 × 16 Inch)', inStock: true },
    ],
    description:
      'Luxurious Ginkgo Biloba leaf botanical metal sculpture with shimmering electroplated gold foil finish. Adds modern sophistication and nature-inspired elegance to living rooms and hallways.',
    specifications: {
      dimensions: '24 × 12 Inches per panel',
      material: 'Wrought Iron with Electrostatic Gold Powder Finish',
      finish: 'Satin Gold Foil Accent',
      mounting: 'Dual mounting rings on rear',
      care: 'Wipe with dry feather duster.',
      origin: 'Proudly Handcrafted in India',
    },
  },
];

// Helper category lists
export const categories = [
  'All',
  'Backlit LED Frames',
  'Desk Standees',
  'Wall Hangings',
  'Metal Wall Art',
  'Dashboard Idols',
  'Car Hangings',
  'Wall Clocks',
];

// Curated subsets for homepage sections
export const devotionalProducts = products.filter(
  (p) =>
    p.category === 'Backlit LED Frames' ||
    p.category === 'Desk Standees' ||
    p.category === 'Wall Hangings'
);

export const wallAndCarProducts = products.filter(
  (p) =>
    p.category === 'Metal Wall Art' ||
    p.category === 'Dashboard Idols' ||
    p.category === 'Car Hangings' ||
    p.category === 'Wall Clocks'
);
