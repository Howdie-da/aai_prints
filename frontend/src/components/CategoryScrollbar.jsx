import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './CategoryScrollbar.css';

/* 
  Category circles matching the requested home decor categories.
  Images point to public/new-images/*.jpg for easy replacement.
*/
const categories = [
  { label: 'Wall Hangings', img: '/new-images/cat-wall-hangings.jpg', href: '#devotional' },
  { label: 'Backlit LED Frames', img: '/new-images/cat-backlit-led-frames.jpg', href: '#devotional' },
  { label: 'Dashboard Idols', img: '/new-images/cat-dashboard-idols.jpg', href: '#car-decor' },
  { label: 'Car Hangings', img: '/new-images/cat-car-hangings.jpg', href: '#car-decor' },
  { label: 'Framed Wall Art', img: '/new-images/cat-framed-wall-art.jpg', href: '#wall-decor' },
  { label: 'Metal Wall Art', img: '/new-images/cat-metal-wall-art.jpg', href: '#wall-decor' },
  { label: 'Wall Clocks', img: '/new-images/cat-wall-clocks.jpg', href: '#wall-decor' },
  { label: 'Desk Standees', img: '/new-images/cat-desk-standees.jpg', href: '#gifts' },
  { label: 'Gift Combos', img: '/new-images/cat-gift-combos.jpg', href: '#gifts' },
];

export default function CategoryScrollbar({ onSelectCategory }) {
  const scrollerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let animationFrame;
    let lastTime = 0;
    let pausedUntil = 0;

    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const delta = Math.min(time - lastTime, 40);
      lastTime = time;

      if (
        !isDragging.current &&
        time > pausedUntil &&
        el.scrollWidth > el.clientWidth
      ) {
        el.scrollLeft += delta * 0.06;

        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const pauseAutoScroll = () => {
      pausedUntil = performance.now() + 2500;
    };

    el.addEventListener('pointerdown', pauseAutoScroll);
    el.addEventListener('wheel', pauseAutoScroll);
    el.addEventListener('touchstart', pauseAutoScroll, { passive: true });

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      el.removeEventListener('pointerdown', pauseAutoScroll);
      el.removeEventListener('wheel', pauseAutoScroll);
      el.removeEventListener('touchstart', pauseAutoScroll);
    };
  }, []);

  const handlePointerDown = (event) => {
    const el = scrollerRef.current;
    if (!el || event.button === 2) return;

    isDragging.current = true;
    moved.current = false;
    startX.current = event.clientX;
    startScrollLeft.current = el.scrollLeft;
    el.classList.add('is-dragging');
  };

  const handlePointerMove = (event) => {
    const el = scrollerRef.current;
    if (!el || !isDragging.current) return;

    const distance = event.clientX - startX.current;

    if (Math.abs(distance) > 4) moved.current = true;

    if (moved.current) {
      el.scrollLeft = startScrollLeft.current - distance;
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    scrollerRef.current?.classList.remove('is-dragging');
  };

  const handleClickCapture = (event) => {
    if (moved.current) {
      event.preventDefault();
      event.stopPropagation();
      moved.current = false;
    }
  };

  return (
    <div
      className="catbar-wrap"
      aria-label="Browse categories"
      ref={scrollerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={stopDragging}
      onClickCapture={handleClickCapture}
    >
      <div className="catbar-inner">
        {[...categories, ...categories].map((category, index) => (
          <a
            key={`${category.label}-${index}`}
            href={category.href}
            className="catbar-item"
            title={category.label}
            draggable="false"
            onDragStart={(event) => event.preventDefault()}
            onClick={(e) => {
              if (onSelectCategory && !moved.current) {
                e.preventDefault();
                onSelectCategory(category.label);
              }
            }}
          >
            <motion.div
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
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
  );
}
