import { useState, useEffect } from 'react';
import './HeroSlider.css';

/* 
  Hero image slider with 3 home décor collection slides.
  Each slide has a background image + semi-transparent overlay card on the left.
  Images can be replaced in public/new-images/hero-*.jpg
*/
const slides = [
  {
    id: 1,
    image: '/new-images/hero-devotional.jpg',
    title: 'Devotional\nCollection',
    subtitle: 'Sacred wall hangings, illuminated frames & divine tabletop idols.',
    bullet1: 'Premium Quality',
    bullet2: 'Ready to Hang / Easy to Place',
    bullet3: 'Gift-Ready Packaging',
    cta: 'EXPLORE COLLECTION',
    category: 'Wall Hangings',
    ctaHref: '#/shop?category=Wall%20Hangings',
  },
  {
    id: 2,
    image: '/new-images/hero-car-decor.jpg',
    title: 'Car Décor\nCollection',
    subtitle: 'Graceful dashboard idols and spiritual hangings for every drive.',
    bullet1: 'Premium Quality',
    bullet2: 'Ready to Hang / Easy to Place',
    bullet3: 'Gift-Ready Packaging',
    cta: 'EXPLORE COLLECTION',
    category: 'Dashboard Idols',
    ctaHref: '#/shop?category=Dashboard%20Idols',
  },
  {
    id: 3,
    image: '/new-images/hero-wall-decor.jpg',
    title: 'Wall Décor\nCollection',
    subtitle: 'Artistic framed wall art, modern metal craft & designer clocks.',
    bullet1: 'Premium Quality',
    bullet2: 'Ready to Hang / Easy to Place',
    bullet3: 'Gift-Ready Packaging',
    cta: 'EXPLORE COLLECTION',
    category: 'Metal Wall Art',
    ctaHref: '#/shop?category=Metal%20Wall%20Art',
  },
];

export default function HeroSlider({ onSelectCategory }) {
  const [active, setActive] = useState(0);

  /* Auto-advance every 5 seconds */
  useEffect(() => {
    const t = setTimeout(() => setActive((a) => (a + 1) % slides.length), 5000);
    return () => clearTimeout(t);
  }, [active]);

  const prev = () => setActive((a) => (a - 1 + slides.length) % slides.length);
  const next = () => setActive((a) => (a + 1) % slides.length);
  const s = slides[active];

  return (
    <section className="hero-slider" aria-label="Featured collections">
      {/* Background image */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${s.image})` }}
        aria-hidden="true"
      />

      {/* Overlay content */}
      <div className="hero-content">
        <div className="hero-text-block">
          <h1 className="hero-title">
            {s.title.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className="hero-subtitle">
            {s.subtitle}
          </p>
          {/* Feature bullets: Premium Quality, Ready to Hang / Easy to Place, Gift-Ready Packaging */}
          <div className="hero-bullets">
            <span className="hero-bullet">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {s.bullet1}
            </span>
            <span className="hero-bullet">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              {s.bullet2}
            </span>
            <span className="hero-bullet">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              {s.bullet3}
            </span>
          </div>
          <a
            href={s.ctaHref}
            className="hero-cta"
            onClick={(e) => {
              if (onSelectCategory) {
                e.preventDefault();
                onSelectCategory(s.category);
              }
            }}
          >
            {s.cta}
          </a>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button className="hero-arrow hero-prev" onClick={prev} aria-label="Previous slide">&#8249;</button>
      <button className="hero-arrow hero-next" onClick={next} aria-label="Next slide">&#8250;</button>

      {/* Dot indicators */}
      <div className="hero-dots" role="tablist" aria-label="Slide indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === active ? ' active' : ''}`}
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
