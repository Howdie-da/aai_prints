import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section" id="hero" aria-label="Hero banner">
      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-tag">✨ Premium Home Decor</span>
          <h1 className="hero-title">
            Bring Timeless Elegance<br />
            <span className="hero-title-accent">To Every Space</span>
          </h1>
          <p className="hero-subtitle">
            Thoughtfully crafted devotional wall hangings, backlit frames, car decor &amp; designer wall art.
          </p>
          <div className="hero-actions">
            <a href="#devotional" className="btn btn-primary">Shop Now</a>
            <a href="#wall-decor" className="btn btn-outline">Explore Art</a>
          </div>
          <div className="hero-badges">
            <div className="badge">✅ Premium Quality</div>
            <div className="badge">🚚 Free Shipping ₹500+</div>
            <div className="badge">🎁 Gift Ready</div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img
            src="/new-images/hero-devotional.jpg"
            alt="Collection of devotional and wall decor pieces"
            className="hero-image"
          />
          <div className="hero-image-badge">
            <span className="badge-number">10,000+</span>
            <span className="badge-label">Happy Homes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
