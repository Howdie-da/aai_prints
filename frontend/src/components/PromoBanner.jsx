import './PromoBanner.css';

/* 
  Full-width bottom promo strip:
  "Free SHIPPING on order above ₹500  [badge]  Get ₹100 OFF on your First Order"
*/
export default function PromoBanner({ onNavigateShop }) {
  return (
    <section
      className="promo-banner"
      aria-label="Promotions"
      onClick={onNavigateShop}
      role={onNavigateShop ? 'button' : undefined}
      tabIndex={onNavigateShop ? 0 : undefined}
      style={onNavigateShop ? { cursor: 'pointer' } : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onNavigateShop) {
          e.preventDefault();
          onNavigateShop();
        }
      }}
    >
      <div className="promo-banner-inner">
        {/* Left text */}
        <div className="promo-left">
          <p className="promo-text">
            Free <strong className="promo-highlight">SHIPPING</strong><br />
            on order above <strong className="promo-highlight">₹500</strong>
          </p>
        </div>

        {/* Centre: gift & promo badge */}
        <div className="promo-center-badge" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffd54f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>

        {/* Right text */}
        <div className="promo-right">
          <p className="promo-text">
            Get <strong className="promo-highlight">₹100 OFF</strong><br />
            on your <strong className="promo-highlight">First Order</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
