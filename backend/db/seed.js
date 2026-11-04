require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const connectDB = require('./connect');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const Wishlist = require('../models/wishlist.model');
const Review = require('../models/review.model');
const Coupon = require('../models/coupon.model');
const Order = require('../models/order.model');
const RefreshToken = require('../models/refreshToken.model');

const seedData = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed]: Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Review.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      RefreshToken.deleteMany({})
    ]);

    // 1. Create Users
    console.log('[Seed]: Creating admin & customer accounts...');
    const adminUser = await User.create({
      name: 'Store Administrator',
      email: 'admin@aaiprints.com',
      password: 'Admin@12345',
      role: 'admin',
      phone: '+91 9876543210',
      addresses: [
        {
          fullName: 'aai PRINTS HQ',
          phone: '+91 9876543210',
          street: '123 Artisans Avenue, Craft District',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001',
          isDefault: true
        }
      ]
    });

    const customerUser = await User.create({
      name: 'Rohan Verma',
      email: 'customer@example.com',
      password: 'Customer@12345',
      role: 'customer',
      phone: '+91 9123456789',
      addresses: [
        {
          fullName: 'Rohan Verma',
          phone: '+91 9123456789',
          street: 'Flat 402, Lotus Greens, Sector 15',
          landmark: 'Near City Park',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201301',
          isDefault: true
        }
      ]
    });

    await Cart.create({ user: adminUser._id, items: [] });
    await Wishlist.create({ user: adminUser._id, products: [] });
    await Cart.create({ user: customerUser._id, items: [] });
    await Wishlist.create({ user: customerUser._id, products: [] });

    // 2. Create Top-Level Categories & Subcategories
    console.log('[Seed]: Creating category taxonomy...');
    const catDevotional = await Category.create({
      name: 'Devotional',
      slug: 'devotional',
      description: 'Sacred idols, frames, and spiritual decor designed for serene living',
      order: 1
    });

    const catCarDecor = await Category.create({
      name: 'Car Décor',
      slug: 'car-decor',
      description: 'Graceful dashboard idols and spiritual hangings for every drive',
      order: 2
    });

    const catWallDecor = await Category.create({
      name: 'Wall Décor',
      slug: 'wall-decor',
      description: 'Handcrafted wall art, laser-cut metal sculptures, and clocks',
      order: 3
    });

    const catFestive = await Category.create({
      name: 'Festive & Gifts',
      slug: 'festive-gifts',
      description: 'Gift combos, auspicious standees, and ceremonial gifts',
      order: 4
    });

    // Subcategories matching frontend categories
    const subBacklit = await Category.create({
      name: 'Backlit LED Frames',
      slug: 'backlit-led-frames',
      description: 'Warm devotional lighting and engraved spiritual backlit frames',
      parentCategory: catDevotional._id,
      order: 1
    });

    const subDeskStandees = await Category.create({
      name: 'Desk Standees',
      slug: 'desk-standees',
      description: 'Auspicious desktop standees and 3D architectural models',
      parentCategory: catDevotional._id,
      order: 2
    });

    const subWallHangings = await Category.create({
      name: 'Wall Hangings',
      slug: 'wall-hangings',
      description: 'Handcrafted wall hangings collection with authentic artisanal finishes',
      parentCategory: catDevotional._id,
      order: 3
    });

    const subMetalWallArt = await Category.create({
      name: 'Metal Wall Art',
      slug: 'metal-wall-art',
      description: 'Laser-cut heavy-gauge wrought iron wall sculptures',
      parentCategory: catWallDecor._id,
      order: 1
    });

    const subWallClocks = await Category.create({
      name: 'Wall Clocks',
      slug: 'wall-clocks',
      description: 'Silent quartz movement modern decorative clocks',
      parentCategory: catWallDecor._id,
      order: 2
    });

    const subDashboardIdols = await Category.create({
      name: 'Dashboard Idols',
      slug: 'dashboard-idols',
      description: 'Divine travel companions with sturdy non-slip adhesive mounts',
      parentCategory: catCarDecor._id,
      order: 1
    });

    const subCarHangings = await Category.create({
      name: 'Car Hangings',
      slug: 'car-hangings',
      description: 'Macrame and brass rear-view mirror hangings with protective charms',
      parentCategory: catCarDecor._id,
      order: 2
    });

    // Category lookup map
    const catMap = {
      'Backlit LED Frames': subBacklit._id,
      'Desk Standees': subDeskStandees._id,
      'Wall Hangings': subWallHangings._id,
      'Metal Wall Art': subMetalWallArt._id,
      'Wall Clocks': subWallClocks._id,
      'Dashboard Idols': subDashboardIdols._id,
      'Car Hangings': subCarHangings._id
    };

    // 3. Create all 12 Authentic Products from Frontend Data Store
    console.log('[Seed]: Seeding complete 12 products matching frontend contract...');
    const productsToSeed = [
      {
        name: 'Lord Ganesha Backlit LED Wooden Frame (9×12 Inch)',
        slug: 'lord-ganesha-backlit-led-wooden-frame',
        category: catMap['Backlit LED Frames'],
        subcategory: 'Spiritual Lighting',
        basePrice: 899,
        originalPrice: 1299,
        images: [
          '/new-images/cat-backlit-led-frames.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 18,
        inStock: true,
        ratingAverage: 4.8,
        reviewCount: 14,
        tag: 'Best Seller',
        badges: ['Best Seller'],
        hasVariants: true,
        variants: [
          { name: '9 × 12 Inch (Warm White)', label: '9 × 12 Inch (Warm White)', price: 899, originalPrice: 1299, stock: 10 },
          { name: '12 × 16 Inch (Warm White)', label: '12 × 16 Inch (Warm White)', price: 1299, originalPrice: 1699, stock: 8 }
        ],
        description:
          'Immerse your space in divine grace with our Lord Ganesha Backlit LED Wooden Frame. Precision laser-cut multi-layer wooden craftsmanship backlit with energy-efficient warm LEDs, creating a captivating spiritual aura for temples, living rooms, and office entrances.',
        specifications: {
          dimensions: '9 × 12 × 1.25 Inches',
          material: 'Engineered Pine Wood & Acrylic Diffuser',
          lighting: '12V Warm White LED Strip with 1.5m Power Adapter',
          mounting: 'Wall-mountable bracket pre-installed + Tabletop Kickstand',
          care: 'Wipe gently with a soft dry microfiber cloth.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Shree Ram Mandir Ayodhya 3D Wooden Tabletop Model',
        slug: 'shree-ram-mandir-ayodhya-3d-wooden-tabletop-model',
        category: catMap['Desk Standees'],
        subcategory: 'Wooden Models',
        basePrice: 649,
        originalPrice: 999,
        images: [
          '/new-images/cat-desk-standees.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 25,
        inStock: true,
        ratingAverage: 4.9,
        reviewCount: 28,
        tag: 'New Arrival',
        badges: ['New Arrival'],
        hasVariants: true,
        variants: [
          { name: 'Standard (6 × 4 Inch)', label: 'Standard (6 × 4 Inch)', price: 649, originalPrice: 999, stock: 15 },
          { name: 'Grand (8 × 6 Inch)', label: 'Grand (8 × 6 Inch)', price: 899, originalPrice: 1299, stock: 10 }
        ],
        description:
          'Authentic 3D architectural miniature of the historic Shree Ram Janmabhoomi Mandir in Ayodhya. Finely detailed layered MDF woodwork with a natural wood finish. An inspiring addition to work desks, study tables, and pooja mandirs.',
        specifications: {
          dimensions: '6 × 4 × 5.5 Inches',
          material: 'Laser-Cut High-Density MDF Wood',
          finish: 'Natural Matte Teak Polish',
          mounting: 'Freestanding sturdy base',
          care: 'Keep away from direct moisture.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Maha Mrityunjaya Sacred Brass Yantra Wall Plate',
        slug: 'maha-mrityunjaya-sacred-brass-yantra-wall-plate',
        category: catMap['Wall Hangings'],
        subcategory: 'Sacred Yantras',
        basePrice: 499,
        originalPrice: 799,
        images: [
          '/new-images/cat-wall-hangings.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 12,
        inStock: true,
        ratingAverage: 4.7,
        reviewCount: 9,
        tag: 'Best Seller',
        badges: ['Best Seller'],
        hasVariants: true,
        variants: [
          { name: 'Antique Brass (6 Inch)', label: 'Antique Brass (6 Inch)', price: 499, originalPrice: 799, stock: 7 },
          { name: 'Gloss Gold (6 Inch)', label: 'Gloss Gold (6 Inch)', price: 549, originalPrice: 849, stock: 5 }
        ],
        description:
          'Ancient Maha Mrityunjaya Yantra engraved with precision on a sacred brass plate. Known for infusing positive vibrations, protection, and peaceful energies across the home.',
        specifications: {
          dimensions: '6 Inch Diameter',
          material: 'Pure Embossed Brass Plate',
          finish: 'Anti-tarnish Lacquered Gold Coating',
          mounting: 'Rear brass loop for easy nail hanging',
          care: 'Clean with dry cloth; do not scrub with harsh chemicals.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Radha Krishna Spiritual Premium Acrylic Wall Hanging',
        slug: 'radha-krishna-spiritual-premium-acrylic-wall-hanging',
        category: catMap['Wall Hangings'],
        subcategory: 'Divine Wall Hangings',
        basePrice: 799,
        originalPrice: 1199,
        images: [
          '/new-images/cat-wall-hangings.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 15,
        inStock: true,
        ratingAverage: 4.8,
        reviewCount: 21,
        tag: 'Best Seller',
        badges: ['Best Seller'],
        hasVariants: true,
        variants: [
          { name: '12 × 12 Inch (Gloss Black & Gold)', label: '12 × 12 Inch (Gloss Black & Gold)', price: 799, originalPrice: 1199, stock: 8 },
          { name: '16 × 16 Inch (Gloss Black & Gold)', label: '16 × 16 Inch (Gloss Black & Gold)', price: 1099, originalPrice: 1499, stock: 7 }
        ],
        description:
          'Elegant Radha Krishna silhouette wall art crafted from high-grade imported cast acrylic. The glossy black finish accented with golden flute accents radiates serene devotional warmth.',
        specifications: {
          dimensions: '12 × 12 × 0.2 Inches',
          material: 'Cast Acrylic Glass (3mm thick)',
          finish: 'High-Gloss Dual Tone (Jet Black & Mirror Gold)',
          mounting: 'Heavy-duty pre-applied 3M mounting tape + wall screw hooks',
          care: 'Wipe with microfiber cloth to prevent micro-scratches.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Shiv Trishul & Damru Metal Wall Art (Black & Gold)',
        slug: 'shiv-trishul-damru-metal-wall-art',
        category: catMap['Metal Wall Art'],
        subcategory: 'Metal Cutouts',
        basePrice: 1199,
        originalPrice: 1899,
        images: [
          '/new-images/cat-metal-wall-art.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-wall-decor.jpg'
        ],
        stock: 10,
        inStock: true,
        ratingAverage: 4.9,
        reviewCount: 35,
        tag: 'Best Seller',
        badges: ['Best Seller'],
        hasVariants: true,
        variants: [
          { name: '18 Inch (Matte Black & Gold)', label: '18 Inch (Matte Black & Gold)', price: 1199, originalPrice: 1899, stock: 6 },
          { name: '24 Inch (Matte Black & Gold)', label: '24 Inch (Matte Black & Gold)', price: 1699, originalPrice: 2499, stock: 4 }
        ],
        description:
          'Powerful Lord Shiva Trishul & Damru metal wall sculpture. Crafted from heavy-gauge powder-coated wrought iron with subtle hand-painted gold highlights. Rust-resistant and designed for lifetime durability.',
        specifications: {
          dimensions: '18 × 9 Inches (1.5mm Heavy Mild Steel)',
          material: 'Rust-Proof Powder-Coated Mild Steel',
          finish: 'Matte Black Textured Finish with Hand-rubbed Antique Gold',
          mounting: 'Concealed standoff brackets for 3D shadow float effect',
          care: 'Dust with soft dry cloth.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Hanuman Chalisa Backlit Warm Light Frame',
        slug: 'hanuman-chalisa-backlit-warm-light-frame',
        category: catMap['Backlit LED Frames'],
        subcategory: 'Devotional Frames',
        basePrice: 999,
        originalPrice: 1499,
        images: [
          '/new-images/cat-backlit-led-frames.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 14,
        inStock: true,
        ratingAverage: 4.8,
        reviewCount: 18,
        tag: '',
        badges: [],
        hasVariants: true,
        variants: [
          { name: '10 × 14 Inch (Warm Glow)', label: '10 × 14 Inch (Warm Glow)', price: 999, originalPrice: 1499, stock: 14 }
        ],
        description:
          'Complete Hanuman Chalisa verses inscribed with illuminated warm LED backlighting. Fills your home with courage, positive protection, and peaceful spiritual illumination.',
        specifications: {
          dimensions: '10 × 14 × 1.5 Inches',
          material: 'Solid Wood Composite Frame & UV Light Filter Sheet',
          lighting: 'Low-voltage 12V LED Strip with power cord & plug',
          mounting: 'Wall hook installed',
          care: 'Clean with dry feather duster.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Gayatri Mantra Illuminated Acrylic Tabletop Standee',
        slug: 'gayatri-mantra-illuminated-acrylic-tabletop-standee',
        category: catMap['Desk Standees'],
        subcategory: 'Illuminated Standees',
        basePrice: 449,
        originalPrice: 699,
        images: [
          '/new-images/cat-desk-standees.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 20,
        inStock: true,
        ratingAverage: 4.6,
        reviewCount: 12,
        tag: 'New Arrival',
        badges: ['New Arrival'],
        hasVariants: true,
        variants: [
          { name: 'Warm White Glow', label: 'Warm White Glow', price: 449, originalPrice: 699, stock: 12 },
          { name: 'Amber Sun Glow', label: 'Amber Sun Glow', price: 449, originalPrice: 699, stock: 8 }
        ],
        description:
          'Sacred Gayatri Mantra engraved on ultra-clear optical grade acrylic, slotted into a solid wooden LED base. Emits a calming radiance ideal for meditation rooms and study desks.',
        specifications: {
          dimensions: '6 × 7 × 1.8 Inches',
          material: 'Optical Acrylic Plate & Beechwood Base',
          lighting: 'USB-powered warm LED base with on/off switch cable',
          mounting: 'Tabletop / Desktop',
          care: 'Avoid alcohol wipes; clean using microfiber cloth.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Om & Swastik Sacred Wall Hanging Set of 2',
        slug: 'om-swastik-sacred-wall-hanging-set-of-2',
        category: catMap['Wall Hangings'],
        subcategory: 'Festive Hangings',
        basePrice: 349,
        originalPrice: 549,
        images: [
          '/new-images/cat-wall-hangings.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-devotional.jpg'
        ],
        stock: 30,
        inStock: true,
        ratingAverage: 4.7,
        reviewCount: 16,
        tag: '',
        badges: [],
        hasVariants: true,
        variants: [
          { name: 'Set of 2 (5 Inch Each)', label: 'Set of 2 (5 Inch Each)', price: 349, originalPrice: 549, stock: 30 }
        ],
        description:
          'Traditional auspicious Om and Swastik pair designed for entrance doors, pooja spaces, and festive gifting. Intricate filigree floral carving with polished brass finish.',
        specifications: {
          dimensions: '5 × 5 Inches each',
          material: 'Cast Zinc-Alloy with Brass Electroplating',
          finish: 'Golden Gloss Finish',
          mounting: 'Adhesive backing or nail hook',
          care: 'Keep in dry environment.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Lord Ganesha Brass Dashboard Idol with Wooden Base',
        slug: 'lord-ganesha-brass-dashboard-idol-with-wooden-base',
        category: catMap['Dashboard Idols'],
        subcategory: 'Brass Idols',
        basePrice: 399,
        originalPrice: 599,
        images: [
          '/new-images/cat-dashboard-idols.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-car-decor.jpg'
        ],
        stock: 35,
        inStock: true,
        ratingAverage: 4.9,
        reviewCount: 42,
        tag: 'Best Seller',
        badges: ['Best Seller'],
        hasVariants: true,
        variants: [
          { name: 'Classic Brass with Teak Base', label: 'Classic Brass with Teak Base', price: 399, originalPrice: 599, stock: 20 },
          { name: 'Antique Copper with Dark Base', label: 'Antique Copper with Dark Base', price: 449, originalPrice: 649, stock: 15 }
        ],
        description:
          'Compact Lord Ganesha idol cast in pure solid brass, firmly mounted on a polished natural wood base. Includes high-bond automotive grade peel-and-stick adhesive tape for dashboards.',
        specifications: {
          dimensions: '2.8 × 2 × 3 Inches',
          material: 'Solid Cast Brass & Natural Hardwood Base',
          weight: '160 grams',
          mounting: 'Pre-fitted automotive heat-resistant double-sided tape',
          care: 'Wipe with clean dry cloth.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Handcrafted Macrame & Brass Bell Car Hanging',
        slug: 'handcrafted-macrame-brass-bell-car-hanging',
        category: catMap['Car Hangings'],
        subcategory: 'Car Accessories',
        basePrice: 249,
        originalPrice: 399,
        images: [
          '/new-images/cat-car-hangings.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-car-decor.jpg'
        ],
        stock: 40,
        inStock: true,
        ratingAverage: 4.7,
        reviewCount: 19,
        tag: '',
        badges: [],
        hasVariants: true,
        variants: [
          { name: 'Beige & Antique Brass', label: 'Beige & Antique Brass', price: 249, originalPrice: 399, stock: 25 },
          { name: 'Earthy Green & Gold', label: 'Earthy Green & Gold', price: 279, originalPrice: 429, stock: 15 }
        ],
        description:
          'Bohemian macrame rear-view mirror hanging with a handcrafted brass bell and natural wooden beads. Emits a gentle soothing chime with vehicle motion while driving.',
        specifications: {
          dimensions: '8.5 Inches total drop length',
          material: '100% Organic Cotton Cord, Wooden Beads & Cast Brass Bell',
          mounting: 'Adjustable loop for rear-view mirror hanging',
          care: 'Spot clean only.',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Minimalist Silent Quartz Decorative Wall Clock (12 Inch)',
        slug: 'minimalist-silent-quartz-decorative-wall-clock',
        category: catMap['Wall Clocks'],
        subcategory: 'Quartz Clocks',
        basePrice: 849,
        originalPrice: 1299,
        images: [
          '/new-images/cat-wall-clocks.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-wall-decor.jpg'
        ],
        stock: 16,
        inStock: true,
        ratingAverage: 4.8,
        reviewCount: 31,
        tag: 'Best Seller',
        badges: ['Best Seller'],
        hasVariants: true,
        variants: [
          { name: '12 Inch (Natural Wood & Gold Hands)', label: '12 Inch (Natural Wood & Gold Hands)', price: 849, originalPrice: 1299, stock: 10 },
          { name: '12 Inch (Matte White & Walnut Hands)', label: '12 Inch (Matte White & Walnut Hands)', price: 899, originalPrice: 1349, stock: 6 }
        ],
        description:
          'Scandinavian-inspired silent sweep quartz wall clock. Non-ticking silent movement ensures zero noise in bedrooms and living rooms. Features clean numerical markings and elegant hands.',
        specifications: {
          dimensions: '12 Inch Diameter × 1.6 Inch Depth',
          material: 'Natural Pine Wood Frame & Glass Lens',
          movement: 'Silent Sweep Quartz (Non-Ticking)',
          power: 'Requires 1 × AA Battery (included)',
          mounting: 'Keyhole bracket on rear',
          origin: 'Proudly Handcrafted in India'
        }
      },
      {
        name: 'Geometric Ginkgo Leaf Metal Wall Art (Gold Finish)',
        slug: 'geometric-ginkgo-leaf-metal-wall-art',
        category: catMap['Metal Wall Art'],
        subcategory: 'Botanical Decor',
        basePrice: 1499,
        originalPrice: 2299,
        images: [
          '/new-images/cat-metal-wall-art.jpg',
          '/new-images/product-placeholder.jpg',
          '/new-images/hero-wall-decor.jpg'
        ],
        stock: 8,
        inStock: true,
        ratingAverage: 4.9,
        reviewCount: 23,
        tag: 'New Arrival',
        badges: ['New Arrival'],
        hasVariants: true,
        variants: [
          { name: 'Set of 2 Panels (24 × 12 Inch)', label: 'Set of 2 Panels (24 × 12 Inch)', price: 1499, originalPrice: 2299, stock: 5 },
          { name: 'Single Statement Panel (30 × 16 Inch)', label: 'Single Statement Panel (30 × 16 Inch)', price: 1899, originalPrice: 2699, stock: 3 }
        ],
        description:
          'Luxurious Ginkgo Biloba leaf botanical metal sculpture with shimmering electroplated gold foil finish. Adds modern sophistication and nature-inspired elegance to living rooms and hallways.',
        specifications: {
          dimensions: '24 × 12 Inches per panel',
          material: 'Wrought Iron with Electrostatic Gold Powder Finish',
          finish: 'Satin Gold Foil Accent',
          mounting: 'Dual mounting rings on rear',
          care: 'Wipe with dry feather duster.',
          origin: 'Proudly Handcrafted in India'
        }
      }
    ];

    const createdProducts = await Product.create(productsToSeed);

    // 4. Create Reviews & Testimonials
    console.log('[Seed]: Creating customer reviews and testimonials...');
    const reviewsData = [
      {
        userName: 'Priya Sharma',
        city: 'Mumbai',
        rating: 5,
        comment:
          'Ordered backlit LED frames for our home temple. The finish and divine illumination exceeded our expectations!',
        isFeatured: true,
        product: createdProducts[0]._id
      },
      {
        userName: 'Rahul Gupta',
        city: 'Delhi',
        rating: 5,
        comment:
          'The car dashboard idol and hanging look stunning and add a serene energy to every drive. Truly top-notch craftsmanship.',
        isFeatured: true,
        product: createdProducts[8]._id
      },
      {
        userName: 'Anita Desai',
        city: 'Bangalore',
        rating: 5,
        comment:
          'Great quality metal wall art at very reasonable prices. Packed securely and arrived without a scratch. Highly recommended!',
        isFeatured: true,
        product: createdProducts[4]._id
      },
      {
        userName: 'Vikram Patel',
        city: 'Ahmedabad',
        rating: 5,
        comment:
          'Bought festive gift sets for corporate gifting. Everyone was delighted with the unique spiritual designs and packaging.',
        isFeatured: true,
        product: null
      }
    ];

    await Review.create(reviewsData);

    // 5. Create Promotional Coupons
    console.log('[Seed]: Creating promotional coupons...');
    await Coupon.create([
      {
        code: 'FIRST100',
        description: 'Get ₹100 OFF on your First Order',
        discountType: 'fixed',
        discountAmount: 100,
        minOrderValue: 500,
        isActive: true
      },
      {
        code: 'AAI10',
        description: '10% OFF on Orders above ₹1000',
        discountType: 'percentage',
        discountAmount: 10,
        minOrderValue: 1000,
        maxDiscountAmount: 300,
        isActive: true
      }
    ]);

    console.log('\n========================================');
    console.log('✅ DATABASE SEED COMPLETE (12 PRODUCTS)');
    console.log('========================================');
    console.log(`Admin Account:    admin@aaiprints.com / Admin@12345`);
    console.log(`Customer Account: customer@example.com / Customer@12345`);
    console.log(`Categories:       ${await Category.countDocuments()}`);
    console.log(`Products:         ${await Product.countDocuments()}`);
    console.log(`Reviews:          ${await Review.countDocuments()}`);
    console.log(`Coupons:          ${await Coupon.countDocuments()}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
