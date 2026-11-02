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
const slugify = require('../utils/slugify.util');

const seedData = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed]: Clearing existing data...');
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

    // Initialize empty Cart and Wishlist for users
    await Cart.create({ user: adminUser._id, items: [] });
    await Wishlist.create({ user: adminUser._id, products: [] });

    await Cart.create({ user: customerUser._id, items: [] });
    await Wishlist.create({ user: customerUser._id, products: [] });

    // 2. Create Top Categories & Subcategories
    console.log('[Seed]: Creating category taxonomy...');
    const devotionalParent = await Category.create({
      name: 'Devotional',
      slug: 'devotional',
      description: 'Sacred idols, frames, and spiritual decor designed for serene living',
      order: 1
    });

    const carDecorParent = await Category.create({
      name: 'Car Décor',
      slug: 'car-decor',
      description: 'Graceful dashboard idols and spiritual hangings for every drive',
      order: 2
    });

    const wallDecorParent = await Category.create({
      name: 'Wall Décor',
      slug: 'wall-decor',
      description: 'Handcrafted wall art, laser-cut metal sculptures, and clocks',
      order: 3
    });

    const festiveParent = await Category.create({
      name: 'Festive & Gifts',
      slug: 'festive-gifts',
      description: 'Gift combos, auspicious standees, and ceremonial gifts',
      order: 4
    });

    // Subcategories
    const wallHangingsCat = await Category.create({
      name: 'Wall Hangings',
      slug: 'wall-hangings',
      description: 'Handcrafted wall hangings collection with authentic artisanal finishes',
      parentCategory: devotionalParent._id,
      order: 1
    });

    const backlitFramesCat = await Category.create({
      name: 'Backlit LED Frames',
      slug: 'backlit-led-frames',
      description: 'Warm devotional lighting and engraved spiritual backlit frames',
      parentCategory: devotionalParent._id,
      order: 2
    });

    const idolsTabletopCat = await Category.create({
      name: 'Idols & Tabletop',
      slug: 'idols-tabletop',
      description: 'Hand-carved brass and stone idols for pooja and tabletop altar',
      parentCategory: devotionalParent._id,
      order: 3
    });

    const yantraChakraCat = await Category.create({
      name: 'Yantra & Chakra',
      slug: 'yantra-chakra',
      description: 'Precision-engraved sacred geometric energy plates and yantras',
      parentCategory: devotionalParent._id,
      order: 4
    });

    const carHangingsCat = await Category.create({
      name: 'Car Hangings',
      slug: 'car-hangings',
      description: 'Macrame and brass rear-view mirror hangings with protective charms',
      parentCategory: carDecorParent._id,
      order: 1
    });

    const dashboardIdolsCat = await Category.create({
      name: 'Dashboard Idols',
      slug: 'dashboard-idols',
      description: 'Divine travel companions with sturdy non-slip adhesive mounts',
      parentCategory: carDecorParent._id,
      order: 2
    });

    const metalWallArtCat = await Category.create({
      name: 'Metal Wall Art',
      slug: 'metal-wall-art',
      description: 'Laser-cut heavy-gauge wrought iron wall sculptures',
      parentCategory: wallDecorParent._id,
      order: 1
    });

    const wallClocksCat = await Category.create({
      name: 'Wall Clocks',
      slug: 'wall-clocks',
      description: 'Silent quartz movement modern decorative clocks',
      parentCategory: wallDecorParent._id,
      order: 2
    });

    // 3. Create Products (with variants where applicable)
    console.log('[Seed]: Creating products & variants...');
    const productsData = [
      {
        name: 'Maha Mrityunjaya Sacred Brass Yantra Wall Plate',
        slug: 'maha-mrityunjaya-sacred-brass-yantra-wall-plate',
        description:
          'Ancient Maha Mrityunjaya Yantra engraved with precision on a sacred brass plate. Known for infusing positive vibrations, protection, and peaceful energies across the home.',
        category: wallHangingsCat._id,
        badges: ['BEST SELLER'],
        basePrice: 499,
        originalPrice: 799,
        stock: 45,
        inStock: true,
        images: ['/images/products/maha-mrityunjaya-1.jpg'],
        hasVariants: true,
        variants: [
          {
            name: 'Antique Brass (6 Inch)',
            sku: 'MM-AB-6',
            attributes: { size: '6 Inch', finish: 'Antique Brass' },
            price: 499,
            originalPrice: 799,
            stock: 25
          },
          {
            name: 'Gloss Gold (6 Inch)',
            sku: 'MM-GG-6',
            attributes: { size: '6 Inch', finish: 'Gloss Gold' },
            price: 549,
            originalPrice: 849,
            stock: 20
          }
        ],
        ratingAverage: 4.7,
        reviewCount: 9
      },
      {
        name: 'Shiv Trishul & Damru Metal Wall Art (Black & Gold)',
        slug: 'shiv-trishul-damru-metal-wall-art',
        description:
          'Powerful Lord Shiva Trishul & Damru metal wall sculpture. Crafted from heavy-gauge powder-coated wrought iron with subtle hand-painted gold highlights. Rust-resistant and designed for lifetime durability.',
        category: metalWallArtCat._id,
        badges: ['BEST SELLER'],
        basePrice: 1199,
        originalPrice: 1899,
        stock: 25,
        inStock: true,
        images: ['/images/products/shiv-trishul-1.jpg'],
        hasVariants: true,
        variants: [
          {
            name: '18 Inch (Matte Black & Gold)',
            sku: 'ST-18-BG',
            attributes: { size: '18 Inch', finish: 'Matte Black & Gold' },
            price: 1199,
            originalPrice: 1899,
            stock: 15
          },
          {
            name: '24 Inch (Matte Black & Gold)',
            sku: 'ST-24-BG',
            attributes: { size: '24 Inch', finish: 'Matte Black & Gold' },
            price: 1699,
            originalPrice: 2499,
            stock: 10
          }
        ],
        ratingAverage: 4.9,
        reviewCount: 35
      },
      {
        name: 'Geometric Ginkgo Leaf Metal Wall Art (Gold Finish)',
        slug: 'geometric-ginkgo-leaf-metal-wall-art-gold-finish',
        description:
          'Contemporary botanical elegance featuring handcrafted interlocking ginkgo leaves with an opulent electroplated warm gold finish.',
        category: metalWallArtCat._id,
        badges: ['NEW ARRIVAL'],
        basePrice: 1499,
        originalPrice: 2299,
        stock: 18,
        inStock: true,
        images: ['/images/products/ginkgo-1.jpg'],
        hasVariants: false,
        variants: [],
        ratingAverage: 4.8,
        reviewCount: 23
      },
      {
        name: 'Lord Ganesha Backlit LED Wooden Frame (9x12 Inch)',
        slug: 'lord-ganesha-backlit-led-wooden-frame-9x12-inch',
        description:
          'Warm illuminated devotional wooden frame featuring an intricate Ganpati silhouette. Includes energy-efficient warm-white LED backlighting with power adapter.',
        category: backlitFramesCat._id,
        badges: ['BEST SELLER'],
        basePrice: 899,
        originalPrice: 1399,
        stock: 30,
        inStock: true,
        images: ['/images/products/ganesha-led-1.jpg'],
        hasVariants: false,
        variants: [],
        ratingAverage: 4.9,
        reviewCount: 28
      },
      {
        name: 'Lord Ganesha Brass Dashboard Idol with Wooden Base',
        slug: 'lord-ganesha-brass-dashboard-idol-with-wooden-base',
        description:
          'Solid cast pure brass Lord Ganesha idol mounted on polished teakwood base with premium heavy-duty adhesive pad for vehicle dashboard.',
        category: dashboardIdolsCat._id,
        badges: ['BEST SELLER'],
        basePrice: 399,
        originalPrice: 599,
        stock: 50,
        inStock: true,
        images: ['/images/products/ganesha-dash-1.jpg'],
        hasVariants: false,
        variants: [],
        ratingAverage: 4.8,
        reviewCount: 42
      },
      {
        name: 'Handcrafted Macrame & Brass Bell Car Hanging',
        slug: 'handcrafted-macrame-brass-bell-car-hanging',
        description:
          'Artisanal bohemian car hanging made from natural cotton macrame cords, genuine brass ghungroo bells, and an evil eye protective talisman.',
        category: carHangingsCat._id,
        badges: [],
        basePrice: 249,
        originalPrice: 399,
        stock: 40,
        inStock: true,
        images: ['/images/products/macrame-bell-1.jpg'],
        hasVariants: false,
        variants: [],
        ratingAverage: 4.6,
        reviewCount: 19
      },
      {
        name: 'Minimalist Silent Quartz Decorative Wall Clock (12 Inch)',
        slug: 'minimalist-silent-quartz-decorative-wall-clock-12-inch',
        description:
          'Architectural Scandinavian style wall clock with sweep second hand and 100% silent quartz movement. No ticking sound.',
        category: wallClocksCat._id,
        badges: [],
        basePrice: 849,
        originalPrice: 1299,
        stock: 22,
        inStock: true,
        images: ['/images/products/clock-1.jpg'],
        hasVariants: false,
        variants: [],
        ratingAverage: 4.7,
        reviewCount: 31
      }
    ];

    const createdProducts = await Product.create(productsData);

    // 4. Create Reviews & Testimonials
    console.log('[Seed]: Creating customer reviews and homepage testimonials...');
    const reviewsData = [
      {
        userName: 'Priya Sharma',
        city: 'Mumbai',
        rating: 5,
        comment:
          'Ordered backlit LED frames for our home temple. The finish and divine illumination exceeded our expectations!',
        isFeatured: true,
        product: createdProducts[3]._id
      },
      {
        userName: 'Rahul Gupta',
        city: 'Delhi',
        rating: 5,
        comment:
          'The car dashboard idol and hanging look stunning and add a serene energy to every drive. Truly top-notch craftsmanship.',
        isFeatured: true,
        product: createdProducts[4]._id
      },
      {
        userName: 'Anita Desai',
        city: 'Bangalore',
        rating: 5,
        comment:
          'Great quality metal wall art at very reasonable prices. Packed securely and arrived without a scratch. Highly recommended!',
        isFeatured: true,
        product: createdProducts[1]._id
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

    // 5. Create Coupons
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
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Admin Account:    admin@aaiprints.com / Admin@12345`);
    console.log(`Customer Account: customer@example.com / Customer@12345`);
    console.log(`Categories:       ${await Category.countDocuments()} created`);
    console.log(`Products:         ${await Product.countDocuments()} created`);
    console.log(`Reviews:          ${await Review.countDocuments()} created`);
    console.log(`Coupons:          ${await Coupon.countDocuments()} created`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
