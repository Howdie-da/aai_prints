import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './AnnouncementBar.css';

const announcements = [
  {
    prefix: 'FREE SHIPPING',
    text: 'Free Express Shipping Across India on Orders Above ₹500',
    highlight: 'FREE SHIPPING',
  },
  {
    prefix: 'SPECIAL OFFER',
    text: 'Flat 5% Additional OFF on Orders Above ₹3,000 • Use Code',
    code: 'DIVINE5',
  },
  {
    prefix: 'ARTISAN CRAFT',
    text: 'Handcrafted Spiritual Art & Designer Frames • Trusted by Over 10,000 Homes',
  },
  {
    prefix: 'WELCOME OFFER',
    text: 'Instant ₹100 OFF on Your First Order • Use Code',
    code: 'AAI100',
  },
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prev = () => setCurrent((c) => (c - 1 + announcements.length) % announcements.length);
  const next = () => setCurrent((c) => (c + 1) % announcements.length);

  const item = announcements[current];

  return (
    <aside
      className="ann-bar"
      role="banner"
      aria-label="Promotions and Announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="ann-inner">
        <button
          type="button"
          className="ann-btn ann-btn-prev"
          onClick={prev}
          aria-label="Previous Announcement"
        >
          <ChevronLeft size={14} strokeWidth={2.4} />
        </button>

        <div className="ann-content">
          <span className="ann-diamond">✦</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {item.prefix && <span className="ann-tag">{item.prefix}</span>}
              <span className="ann-text">{item.text}</span>
              {item.code && <span className="ann-code-pill">{item.code}</span>}
            </motion.div>
          </AnimatePresence>
          <span className="ann-diamond">✦</span>
        </div>

        <button
          type="button"
          className="ann-btn ann-btn-next"
          onClick={next}
          aria-label="Next Announcement"
        >
          <ChevronRight size={14} strokeWidth={2.4} />
        </button>
      </div>
    </aside>
  );
}
