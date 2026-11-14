import { motion } from 'framer-motion';
import './CategoryScrollbar.css';

/* 
  Category circles matching the requested home decor categories.
  Images point to public/new-images/*.jpg for easy replacement.
*/
const categories = [
  { label: 'Wall Hangings', img: '/new-images/cat-wall-hangings.jpg', href: '#/shop?category=Wall%20Hangings' },
  { label: 'Backlit LED Frames', img: '/new-images/cat-backlit-led-frames.jpg', href: '#/shop?category=Backlit%20LED%20Frames' },
  { label: 'Dashboard Idols', img: '/new-images/cat-dashboard-idols.jpg', href: '#/shop?category=Dashboard%20Idols' },
  { label: 'Car Hangings', img: '/new-images/cat-car-hangings.jpg', href: '#/shop?category=Car%20Hangings' },
  { label: 'Framed Wall Art', img: '/new-images/cat-framed-wall-art.jpg', href: '#/shop?category=Framed%20Wall%20Art' },
  { label: 'Metal Wall Art', img: '/new-images/cat-metal-wall-art.jpg', href: '#/shop?category=Metal%20Wall%20Art' },
  { label: 'Wall Clocks', img: '/new-images/cat-wall-clocks.jpg', href: '#/shop?category=Wall%20Clocks' },
  { label: 'Desk Standees', img: '/new-images/cat-desk-standees.jpg', href: '#/shop?category=Desk%20Standees' },
  { label: 'Gift Combos', img: '/new-images/cat-gift-combos.jpg', href: '#/shop?category=Gifts' },
];

// Repeat categories to create two identical groups for seamless 100% infinite looping
const marqueeGroup = [...categories, ...categories];

export default function CategoryScrollbar({ onSelectCategory }) {
  const handleItemClick = (e, category) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(category.label);
    }
  };

  return (
    <div className="catbar-wrap" aria-label="Browse categories marquee">
      <div className="catbar-track">
        {/* Primary Marquee Group */}
        <div className="catbar-marquee-group">
          {marqueeGroup.map((category, index) => (
            <a
              key={`primary-${category.label}-${index}`}
              href={category.href}
              className="catbar-item"
              title={category.label}
              onClick={(e) => handleItemClick(e, category)}
            >
              <motion.div
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="catbar-circle"
              >
                <img
                  src={category.img}
                  alt={category.label}
                  className="catbar-img"
                  loading="lazy"
                  draggable="false"
                />
              </motion.div>
              <span className="catbar-label">{category.label}</span>
            </a>
          ))}
        </div>

        {/* Identical Cloned Group for Seamless 100% Infinite Looping */}
        <div className="catbar-marquee-group" aria-hidden="true">
          {marqueeGroup.map((category, index) => (
            <a
              key={`clone-${category.label}-${index}`}
              href={category.href}
              className="catbar-item"
              title={category.label}
              tabIndex={-1}
              onClick={(e) => handleItemClick(e, category)}
            >
              <motion.div
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="catbar-circle"
              >
                <img
                  src={category.img}
                  alt={category.label}
                  className="catbar-img"
                  loading="lazy"
                  draggable="false"
                />
              </motion.div>
              <span className="catbar-label">{category.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
