const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('../db/connect');
const Reel = require('../models/reel.model');

async function cleanDummyReels() {
  try {
    await connectDB();
    console.log('[Clean]: Connected to MongoDB');

    const totalBefore = await Reel.countDocuments();
    console.log(`[Clean]: Total reels currently in DB: ${totalBefore}`);

    // Delete all seeded dummy reels
    const result = await Reel.deleteMany({});
    console.log(`[Clean]: Deleted ${result.deletedCount} reels from database.`);

    const totalAfter = await Reel.countDocuments();
    console.log(`[Clean]: Total reels remaining in DB: ${totalAfter}`);

    process.exit(0);
  } catch (err) {
    console.error('[Clean]: Error clearing dummy reels:', err);
    process.exit(1);
  }
}

cleanDummyReels();
