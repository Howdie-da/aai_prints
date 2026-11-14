import { motion } from 'framer-motion';
import './CategorySection.css';

const categories = [
  {
    id: 'cat-1',
    title: 'Wall Hangings',
    count: '120+ Designs',
    image: '/new-images/cat-wall-hangings.jpg',
    href: '#/shop?category=Wall%20Hangings',
    tag: 'Bestseller',
  },
  {
    id: 'cat-2',
    title: 'Backlit LED Frames',
    count: '80+ Frame Designs',
    image: '/new-images/cat-backlit-led-frames.jpg',
    href: '#/shop?category=Backlit%20LED%20Frames',
    tag: 'Illuminated',
  },
  {
    id: 'cat-3',
    title: 'Dashboard Idols',
    count: '60+ Idols',
    image: '/new-images/cat-dashboard-idols.jpg',
    href: '#/shop?category=Dashboard%20Idols',
    tag: 'Car Decor',
  },
  {
    id: 'cat-4',
    title: 'Car Hangings',
    count: '40+ Graceful Pieces',
    image: '/new-images/cat-car-hangings.jpg',
    href: '#/shop?category=Car%20Hangings',
    tag: 'Protection',
  },
  {
    id: 'cat-5',
    title: 'Framed Wall Art',
    count: '95+ Masterpieces',
    image: '/new-images/cat-framed-wall-art.jpg',
    href: '#/shop?category=Framed%20Wall%20Art',
    tag: '',
  },
  {
    id: 'cat-6',
    title: 'Metal Wall Art',
    count: '50+ Modern Craft',
    image: '/new-images/cat-metal-wall-art.jpg',
    href: '#/shop?category=Metal%20Wall%20Art',
    tag: 'Artisan',
  },
];

export default function CategorySection() {
  return (
    <section className="category-section" id="shop" aria-label="Shop by category">
      <div className="section-inner section-wrap">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="sec-header"
        >
          <span className="sec-eyebrow">FEATURED COLLECTIONS</span>
          <h2 className="sec-title">Shop by Category</h2>
          <p className="sec-subtitle">
            Explore  devotional artwork, illuminated LED frames, and artisan home decor designed for modern living.
          </p>
        </motion.div>

        <div className="category-grid">
          {categories.map((cat, idx) => (
            <motion.a
              key={cat.id}
              href={cat.href}
              className="category-card"
              id={cat.id}
              aria-label={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              whileHover={{ y: -6 }}
            >
              <div className="category-image-wrap">
                <img src={cat.image} alt={cat.title} className="category-image" loading="lazy" />
                {cat.tag && <span className="category-tag">{cat.tag}</span>}
                <div className="category-overlay">
                  <span className="category-shop-btn">
                    EXPLORE COLLECTION <span>→</span>
                  </span>
                </div>
              </div>
              <div className="category-info">
                <h3 className="category-name">{cat.title}</h3>
                <p className="category-count">{cat.count}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
