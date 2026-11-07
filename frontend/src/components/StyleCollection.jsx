import { motion } from 'framer-motion';
import './StyleCollection.css';

/* "Your Style, Your Collection" – horizontal scrollable home décor collections */
const collections = [
  {
    label: 'Wall Hangings',
    category: 'Wall Hangings',
    image: '/new-images/cat-wall-hangings.jpg',
  },
  {
    label: 'Backlit LED Frames',
    category: 'Backlit LED Frames',
    image: '/new-images/cat-backlit-led-frames.jpg',
  },
  {
    label: 'Dashboard Idols',
    category: 'Dashboard Idols',
    image: '/new-images/cat-dashboard-idols.jpg',
  },
  {
    label: 'Framed Wall Art',
    category: 'Framed Wall Art',
    image: '/new-images/cat-framed-wall-art.jpg',
  },
  {
    label: 'Metal Wall Art',
    category: 'Metal Wall Art',
    image: '/new-images/cat-metal-wall-art.jpg',
  },
  {
    label: 'Wall Clocks',
    category: 'Wall Clocks',
    image: '/new-images/cat-wall-clocks.jpg',
  },
];

export default function StyleCollection({ onSelectCategory }) {
  const handleCardClick = (e, category) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(category);
    }
  };

  return (
    <section className="style-section" id="collections" aria-label="Your Style, Your Collection">
      <div className="section-wrap">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="sec-title"
        >
          Your Style, Your Collection
        </motion.h2>

        <div className="style-scroll-wrap">
          <div className="style-scroll-inner">
            {collections.map((col, idx) => {
              const targetCategory = col.category || col.label;
              const href = `#/shop?category=${encodeURIComponent(targetCategory)}`;

              return (
                <motion.a
                  key={col.label}
                  href={href}
                  className="style-card"
                  aria-label={col.label}
                  onClick={(e) => handleCardClick(e, targetCategory)}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="style-card-img-wrap">
                    {col.image && !col.image.includes('placeholder') ? (
                      <img
                        src={col.image}
                        alt={col.label}
                        className="style-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="style-card-img-empty" />
                    )}
                  </div>
                  <span className="style-card-label">{col.label}</span>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
