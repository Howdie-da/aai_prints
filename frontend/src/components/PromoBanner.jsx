import { Gift } from 'lucide-react';
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
          <Gift size={42} strokeWidth={1.8} style={{ color: '#ffd54f' }} />
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
