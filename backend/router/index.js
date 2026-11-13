const express = require('express');
const router = express.Router();

const authRouter = require('./auth.router');
const categoryRouter = require('./category.router');
const productRouter = require('./product.router');
const cartRouter = require('./cart.router');
const wishlistRouter = require('./wishlist.router');
const reviewRouter = require('./review.router');
const couponRouter = require('./coupon.router');
const orderRouter = require('./order.router');
const mediaRouter = require('./media.router');
const b2bRouter = require('./b2b.router');
const reelRouter = require('./reel.router');

router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/reviews', reviewRouter);
router.use('/coupons', couponRouter);
router.use('/orders', orderRouter);
router.use('/media', mediaRouter);
router.use('/b2b', b2bRouter);
router.use('/reels', reelRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
