import './PromoSection.css';

export default function PromoSection() {
  return (
    <section className="promo-section" id="custom" aria-label="Promotional sections">
      {/* Banner 1: Corporate & Festive Gifting */}
      <div className="promo-banner promo-dark">
        <div className="promo-banner-inner">
          <div className="promo-content">
            <span className="promo-eyebrow">For Corporate &amp; Celebrations</span>
            <h2 className="promo-title">Custom Gift Combos &amp; Corporate Décor</h2>
            <p className="promo-desc">
              Customized devotional and desk decor sets for corporate gifting, festivals, and special occasions.
              Carefully packed in premium gift boxes.
            </p>
            <ul className="promo-list">
              <li>✅ Custom branding &amp; personalized messaging</li>
              <li>✅ Premium gift-ready packaging</li>
              <li>✅ Express Pan-India doorstep delivery</li>
              <li>✅ Dedicated gifting specialist</li>
            </ul>
            <a href="#contact" className="promo-btn promo-btn-light">Get a Quote →</a>
          </div>
          <div className="promo-image-side">
            <img
              src="/new-images/cat-gift-combos.jpg"
              alt="Custom decor gift combo"
              className="promo-image"
            />
          </div>
        </div>
      </div>

      {/* Banner 2: Festive Specials */}
      <div className="promo-banner promo-light-green">
        <div className="promo-banner-inner">
          <div className="promo-image-side">
            <img
              src="/new-images/hero-devotional.jpg"
              alt="Festive decor collection"
              className="promo-image"
            />
          </div>
          <div className="promo-content">
            <span className="promo-eyebrow promo-eyebrow-dark">Special Festive Curation</span>
            <h2 className="promo-title promo-title-dark">Bless Your Home With Serenity</h2>
            <p className="promo-desc promo-desc-dark">
              Bring divine grace and auspicious energy into your temple, living room, and workplace
              with our handcrafted devotional collection.
            </p>
            <div className="promo-price-block">
              <span className="promo-sale-price">₹899</span>
              <span className="promo-original-price">₹1,499</span>
              <span className="promo-save-badge">Save 40%</span>
            </div>
            <a href="#devotional" className="promo-btn promo-btn-dark">Explore Devotional →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
