import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import './HeroSlider.css';

/* 
  Hero image slider with luxury spiritual home décor collection slides.
  Preserves existing image paths, categories, and navigation contracts.
*/
const slides = [
  {
    id: 1,
    image: '/new-images/hero-devotional.jpg',
    tag: 'SACRED HOME SANCTUARY',
    title: 'Devotional\nCollection',
    subtitle: 'Illuminated Backlit LED frames, handcrafted brass idols & sacred wall sanctums.',
    bullet1: 'Temple-Grade Sanctified Art',
    bullet2: 'Warm Ambient 12V LED Illumination',
    bullet3: 'Gift-Ready Wooden Protective Packaging',
    cta: 'EXPLORE COLLECTION',
    secondaryCta: 'VIEW BESTSELLERS',
    category: 'Wall Hangings',
    ctaHref: '#/shop?category=Wall%20Hangings',
  },
  {
    id: 2,
    image: '/new-images/hero-car-decor.jpg',
    tag: 'DIVINE SAFE TRAVEL',
    title: 'Car Décor\nCollection',
    subtitle: 'Graceful dashboard idols and sacred hangings for peaceful, blessed journeys.',
    bullet1: 'Precision Engineered Acrylic & Brass',
    bullet2: 'Anti-Slip Heat Resistant Dashboard Mount',
    bullet3: 'Sacred Mantra Engraved Accents',
    cta: 'EXPLORE COLLECTION',
    secondaryCta: 'VIEW DASHBOARD IDOLS',
    category: 'Dashboard Idols',
    ctaHref: '#/shop?category=Dashboard%20Idols',
  },
  {
    id: 3,
    image: '/new-images/hero-wall-decor.jpg',
    tag: 'TIMELESS INDIAN CRAFT',
    title: 'Wall Décor\nCollection',
    subtitle: 'Contemporary laser-cut metal craft, spiritual silhouettes & artisan clocks.',
    bullet1: 'Rust-Proof High-Grade Matte Metal',
    bullet2: 'Pre-Installed Precision Mounting Kit',
    bullet3: '100% Proudly Made in India',
    cta: 'EXPLORE COLLECTION',
    secondaryCta: 'EXPLORE WALL ART',
    category: 'Metal Wall Art',
    ctaHref: '#/shop?category=Metal%20Wall%20Art',
  },
];

export default function HeroSlider({ onSelectCategory }) {
  const [active, setActive] = useState(0);

  /* Auto-advance every 5.5 seconds */
  useEffect(() => {
    const t = setTimeout(() => setActive((a) => (a + 1) % slides.length), 5500);
    return () => clearTimeout(t);
  }, [active]);

  const prev = () => setActive((a) => (a - 1 + slides.length) % slides.length);
  const next = () => setActive((a) => (a + 1) % slides.length);
  const s = slides[active];

  return (
    <section className="hero-slider" aria-label="Featured Sacred Collections">
      {/* Background slide images with Ken Burns zoom */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`hero-bg ${idx === active ? 'hero-bg--active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={idx !== active}
        />
      ))}

      {/* Atmospheric gradient overlay for contrast */}
      <div className="hero-gradient-overlay" aria-hidden="true" />

      {/* Overlay content with snappy, lightweight transition */}
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="hero-text-block"
          >
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-icon">✦</span>
              <span>{s.tag}</span>
              <span className="hero-eyebrow-icon">✦</span>
            </div>

            <h1 className="hero-title">
              {s.title.split('\n').map((line, i) => (
                <span key={i} className="hero-title-line">
                  {line}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle">{s.subtitle}</p>

            <div className="hero-bullets">
              <div className="hero-bullet">
                <span className="bullet-diamond">✦</span>
                <span>{s.bullet1}</span>
              </div>
              <div className="hero-bullet">
                <span className="bullet-diamond">✦</span>
                <span>{s.bullet2}</span>
              </div>
              <div className="hero-bullet">
                <span className="bullet-diamond">✦</span>
                <span>{s.bullet3}</span>
              </div>
            </div>

            <div className="hero-actions">
              <a
                href={s.ctaHref}
                className="hero-cta btn-gold"
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory(s.category);
                  }
                }}
              >
                <span>{s.cta}</span>
                <ArrowRight size={15} strokeWidth={2.4} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </a>

              <a
                href="#/shop"
                className="hero-secondary-cta"
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('All');
                  }
                }}
              >
                <span>ALL PIECES</span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows with Lucide icons */}
      <button
        type="button"
        className="hero-arrow hero-prev"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>
      <button
        type="button"
        className="hero-arrow hero-next"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>

      {/* Modern elongated pill dot indicators */}
      <div className="hero-dots" role="tablist" aria-label="Slide indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === active}
            role="tab"
          />
        ))}
      </div>
    </section>
  );
}
