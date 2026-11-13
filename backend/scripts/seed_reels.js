const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('../db/connect');
const Product = require('../models/product.model');
const Reel = require('../models/reel.model');

async function seedReels() {
  try {
    await connectDB();
    console.log('[Seed]: Connected to MongoDB');

    const products = await Product.find({ isActive: true }).limit(10);
    console.log(`[Seed]: Found ${products.length} products`);

    if (products.length === 0) {
      console.warn('[Seed]: No products found in database! Creating standalone fallback reels.');
      process.exit(0);
    }

    // Clear existing reels or check
    const existingReelsCount = await Reel.countDocuments();
    console.log(`[Seed]: Existing reels count: ${existingReelsCount}`);

    // Let's create a curated list of reels matching available products
    const sampleReelDefs = [
      {
        title: 'Divine Sanctum • Ambient LED Light Frame',
        videoUrl: '/videos/reel-1.mp4',
        thumbnailUrl: products[0]?.image || 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&auto=format&fit=crop&q=80',
        caption: 'Handcrafted spiritual devotion with warm ambient glow. Perfect for your home mandir or living space.',
        duration: 25,
        aspectRatio: '9:16',
        order: 1,
        productIndex: 0
      },
      {
        title: 'Sacred Mandir Standee Setup',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-small-lit-candle-43407-large.mp4',
        thumbnailUrl: products[1]?.image || 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=800&auto=format&fit=crop&q=80',
        caption: 'Intricate gold-leaf laser detailing for sacred spaces. Elevate your everyday pooja altar.',
        duration: 22,
        aspectRatio: '9:16',
        order: 2,
        productIndex: Math.min(1, products.length - 1)
      },
      {
        title: 'Car Dashboard Companion • Safe Journeys',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-along-a-scenic-coastal-road-41551-large.mp4',
        thumbnailUrl: products[2]?.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
        caption: 'Blessings on every drive. Premium high-grade acrylic with non-slip dashboard base.',
        duration: 18,
        aspectRatio: '9:16',
        order: 3,
        productIndex: Math.min(2, products.length - 1)
      },
      {
        title: 'Ginkgo Botanical Precision Metal Art',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-golden-light-illuminating-abstract-decorations-43422-large.mp4',
        thumbnailUrl: products[3]?.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
        caption: 'Luxury metallic wall installation inspired by organic botanicals. Matte champagne gold finish.',
        duration: 20,
        aspectRatio: '9:16',
        order: 4,
        productIndex: Math.min(3, products.length - 1)
      },
      {
        title: 'Gayatri Mantra Hanging • Sacred Resonance',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sun-rays-filtering-through-an-indoor-plant-43419-large.mp4',
        thumbnailUrl: products[4]?.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
        caption: 'Vedic chants etched in acoustic brass. Brings peaceful positive vibrations into your entrance.',
        duration: 24,
        aspectRatio: '9:16',
        order: 5,
        productIndex: Math.min(4, products.length - 1)
      }
    ];

    // Remove existing test reels
    await Reel.deleteMany({});
    console.log('[Seed]: Cleared existing reels table.');

    for (const def of sampleReelDefs) {
      const targetProduct = products[def.productIndex] || products[0];
      await Reel.create({
        title: def.title,
        videoUrl: def.videoUrl,
        thumbnailUrl: def.thumbnailUrl || targetProduct.image,
        product: targetProduct._id,
        caption: def.caption,
        duration: def.duration,
        aspectRatio: def.aspectRatio,
        order: def.order,
        isActive: true,
        viewsCount: Math.floor(Math.random() * 800) + 120,
        likesCount: Math.floor(Math.random() * 300) + 45
      });
    }

    const created = await Reel.find().populate('product', 'name price');
    console.log(`[Seed]: Successfully created ${created.length} reels:`);
    created.forEach((r, i) => console.log(`  ${i + 1}. "${r.title}" -> Product: "${r.product?.name}"`));

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedReels();
