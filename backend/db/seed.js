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
const B2BProduct = require('../models/b2bProduct.model');
const B2BInquiry = require('../models/b2bInquiry.model');

const seedData = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed]: Purging collections of dummy and stale data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Review.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      RefreshToken.deleteMany({}),
      B2BProduct.deleteMany({}),
      B2BInquiry.deleteMany({})
    ]);

    // 1. Create Foundational Accounts
    console.log('[Seed]: Creating clean administrator & customer accounts...');
    const adminUser = await User.create({
      name: 'Store Administrator',
      email: 'admin@aaiprints.com',
      password: 'Admin@12345',
      role: 'admin',
      phone: '+91 9876543210',
      addresses: [
        {
          fullName: 'Aai Prints HQ',
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
      name: 'Verified Customer',
      email: 'customer@example.com',
      password: 'Customer@12345',
      role: 'customer',
      phone: '+91 9123456789',
      addresses: [
        {
          fullName: 'Verified Customer',
          phone: '+91 9123456789',
          street: 'Flat 402, Lotus Greens, Sector 15',
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

    // 2. Create Authentic Category Taxonomy (Ready for Admin Product Entry)
    console.log('[Seed]: Creating category taxonomy & subcategories...');
    const catDevotional = await Category.create({
      name: 'Devotional',
      slug: 'devotional',
      description: 'Devotional idols, frames, and spiritual decor designed for elegant living',
      order: 1
    });

    const catCarDecor = await Category.create({
      name: 'Car Decor',
      slug: 'car-decor',
      description: 'Graceful dashboard idols and spiritual hangings for every drive',
      order: 2
    });

    const catWallDecor = await Category.create({
      name: 'Wall Decor',
      slug: 'wall-decor',
      description: ' wall art, laser-cut metal sculptures, and clocks',
      order: 3
    });

    const catFestive = await Category.create({
      name: 'Festive & Gifts',
      slug: 'festive-gifts',
      description: 'Gift combos, auspicious standees, and ceremonial gifts',
      order: 4
    });

    // Subcategories matching store navigation and filter taxonomy
    await Category.create([
      {
        name: 'Backlit LED Frames',
        slug: 'backlit-led-frames',
        description: 'Warm devotional lighting and engraved spiritual backlit frames',
        parentCategory: catDevotional._id,
        order: 1
      },
      {
        name: 'Desk Standees',
        slug: 'desk-standees',
        description: 'Auspicious desktop standees and 3D architectural models',
        parentCategory: catDevotional._id,
        order: 2
      },
      {
        name: 'Wall Hangings',
        slug: 'wall-hangings',
        description: ' wall hangings collection with authentic artisanal finishes',
        parentCategory: catDevotional._id,
        order: 3
      },
      {
        name: 'Metal Wall Art',
        slug: 'metal-wall-art',
        description: 'Laser-cut heavy-gauge wrought iron wall sculptures',
        parentCategory: catWallDecor._id,
        order: 1
      },
      {
        name: 'Wall Clocks',
        slug: 'wall-clocks',
        description: 'Silent quartz movement modern decorative clocks',
        parentCategory: catWallDecor._id,
        order: 2
      },
      {
        name: 'Dashboard Idols',
        slug: 'dashboard-idols',
        description: 'Divine travel companions with sturdy non-slip adhesive mounts',
        parentCategory: catCarDecor._id,
        order: 1
      },
      {
        name: 'Car Hangings',
        slug: 'car-hangings',
        description: 'Macrame and brass rear-view mirror hangings with protective charms',
        parentCategory: catCarDecor._id,
        order: 2
      }
    ]);

    // 3. Create Store Promotional Coupons (Matching Announcement Bar & Promo Ribbons)
    console.log('[Seed]: Creating authentic store coupons...');
    await Coupon.create([
      {
        code: 'AAI100',
        description: 'Instant ₹100 OFF on Orders above ₹500',
        discountType: 'fixed',
        discountAmount: 100,
        minOrderValue: 500,
        isActive: true
      },
      {
        code: 'DIVINE5',
        description: 'Flat 5% Additional OFF on Orders above ₹3,000',
        discountType: 'percentage',
        discountAmount: 5,
        minOrderValue: 3000,
        isActive: true
      },
      {
        code: 'FIRST100',
        description: 'Get ₹100 OFF on your First Order',
        discountType: 'fixed',
        discountAmount: 100,
        minOrderValue: 500,
        isActive: true
      }
    ]);

    console.log('\n======================================================');
    console.log('✅ CLEAN DATABASE SEED COMPLETE (0 DUMMY PRODUCTS/REVIEWS)');
    console.log('======================================================');
    console.log(`Admin Account:    admin@aaiprints.com / Admin@12345`);
    console.log(`Customer Account: customer@example.com / Customer@12345`);
    console.log(`Categories:       ${await Category.countDocuments()}`);
    console.log(`Products:         ${await Product.countDocuments()} (Clean slate — ready for live catalog entry)`);
    console.log(`Reviews:          ${await Review.countDocuments()} (Clean slate — genuine reviews only)`);
    console.log(`Coupons:          ${await Coupon.countDocuments()} (AAI100, DIVINE5, FIRST100)`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
