import { useState } from 'react';
import { MessageCircle, Globe, Mail, Share2, Sparkles, X } from 'lucide-react';
import './Footer.css';

const policyContents = {
  'Contact Us': {
    title: 'Customer Care & Support',
    body: 'Our customer care team is dedicated to helping you with product inquiries, bulk orders, and custom dimensions.\n\n• Email: care@aaiprints.com\n• Helpline: +91 98765 43210 (Mon-Sat, 10 AM - 7 PM IST)\n• Artisan Studio: Ananta Art International, India',
  },
  'FAQs': {
    title: 'Frequently Asked Questions',
    body: '• Are backlit frames ready to plug in? Yes, each backlit frame comes with a certified Indian 12V power adapter and warm white ambient LEDs.\n• How are wall arts mounted? All units include pre-fitted heavy-duty wall brackets and tabletop kickstands.\n• Are dashboard idols heat & vibration resistant? Yes, each idol includes automotive-grade heat-resistant 3M tape for bump-free adhesion.',
  },
  'Shipping Policy': {
    title: 'Shipping & Delivery Policy',
    body: 'We deliver safely across all serviceable pin codes in India. Every order is encased in 5-ply reinforced protective packaging with inner bubble foam shielding to ensure zero transit shock.\n\n• Free Express Shipping on all orders above ₹500.\n• Standard dispatch within 24-48 business hours.\n• Delivery turnaround: 3-5 business days across metro cities.',
  },
  'Returns & Refunds': {
    title: 'Transit Guarantee & Replacements',
    body: 'We stand 100% behind the craftsmanship of every art piece. In the rare event of transit damage, we provide an immediate 7-day hassle-free replacement upon sharing unboxing photos or video to care@aaiprints.com.',
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    body: 'Your privacy is treated with the highest degree of care and confidentiality. Personal information including delivery address, phone number, and transaction history is encrypted via 256-bit SSL protocols and is never shared, rented, or sold to third parties.',
  },
  'Terms of Service': {
    title: 'Terms of Service',
    body: 'Welcome to Aai Prints (Ananta Art International). All catalog prices, specifications, and product descriptions represent authentic handcrafted goods. Orders are subject to standard verification and dispatch schedules.',
  },
};

export default function Footer({ onNavigate }) {
  const [activePolicy, setActivePolicy] = useState(null);

  const quickLinks = [
    { label: 'Home', href: '#/', page: 'home' },
    { label: 'Shop All Products', href: '#/shop', page: 'shop', category: 'All' },
    { label: 'My Wishlist', href: '#/wishlist', page: 'wishlist' },
    { label: 'Shopping Cart', href: '#/cart', page: 'cart' },
    { label: 'Customer Reviews', href: '#reviews', page: 'home' },
  ];

  const shopCategories = [
    { label: 'Devotional Wall Hangings', category: 'Wall Hangings' },
    { label: 'Illuminated Backlit LED Frames', category: 'Backlit LED Frames' },
    { label: 'Car Dashboard Idols', category: 'Dashboard Idols' },
    { label: 'Car Hangings', category: 'Car Hangings' },
    { label: 'Metal Wall Art Craft', category: 'Metal Wall Art' },
    { label: 'Artisan Wall Clocks', category: 'Wall Clocks' },
    { label: 'Desk Standees & Gifts', category: 'Desk Standees' },
  ];

  const customerCareLinks = [
    'Contact Us',
    'FAQs',
    'Shipping Policy',
    'Returns & Refunds',
    'Privacy Policy',
    'Terms of Service',
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="section-wrap">
        <div className="footer-inner">
          {/* 1. Brand Heritage Column */}
          <div className="footer-col footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-text">Aai Prints</span>
              <span className="footer-brand-sub">ANANTA ART INTERNATIONAL</span>
            </div>
            <p className="footer-desc">
              Handcrafted devotional frames, illuminated backlit LED frames, and contemporary wall art designed to bring elegance, serenity, and premium aesthetics into every home and vehicle.
            </p>
            <div className="footer-badge">
              <Sparkles size={13} style={{ color: 'var(--gold, #d4af37)' }} />
              <span>Artisan Craftsmanship • 100% Handcrafted in India</span>
            </div>
            <div className="footer-socials" aria-label="Connect with us">
              <a href="#" className="social-link" aria-label="Chat with Customer Support" onClick={(e) => e.preventDefault()} title="Customer Support">
                <MessageCircle size={17} />
              </a>
              <a href="#" className="social-link" aria-label="Official Website" onClick={(e) => e.preventDefault()} title="Artisan Community">
                <Globe size={17} />
              </a>
              <a href="mailto:care@aaiprints.com" className="social-link" aria-label="Email Customer Care" title="care@aaiprints.com">
                <Mail size={17} />
              </a>
              <a href="#" className="social-link" aria-label="Share Collection" onClick={(e) => e.preventDefault()} title="Share Collection">
                <Share2 size={17} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="footer-col">
            <h3 className="footer-heading">Navigation</h3>
            <ul className="footer-links">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      if (onNavigate && l.page) {
                        e.preventDefault();
                        onNavigate(l.page, l.category || 'All');
                      }
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Shop Categories */}
          <div className="footer-col">
            <h3 className="footer-heading">Product Categories</h3>
            <ul className="footer-links">
              {shopCategories.map((c) => (
                <li key={c.label}>
                  <a
                    href={`#/shop?category=${encodeURIComponent(c.category)}`}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate('shop', c.category);
                      }
                    }}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Customer Care & Policies */}
          <div className="footer-col">
            <h3 className="footer-heading">Customer Care</h3>
            <ul className="footer-links">
              {customerCareLinks.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className="footer-policy-btn"
                    onClick={() => setActivePolicy(label)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Payment Badges & Copyright Bottom Bar ── */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} <strong>Aai Prints</strong> (Ananta Art International). Handcrafted in India. All Rights Reserved.
          </p>

          <div className="footer-payment-strip">
            <span className="payment-pill">UPI</span>
            <span className="payment-pill">Visa</span>
            <span className="payment-pill">Mastercard</span>
            <span className="payment-pill">RuPay</span>
            <span className="payment-pill">NetBanking</span>
            <span className="payment-pill">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* ── Policy Modal ── */}
      {activePolicy && (
        <div
          className="policy-modal-overlay"
          onClick={() => setActivePolicy(null)}
          role="presentation"
        >
          <div
            className="policy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="policy-modal-header">
              <h2 id="policy-modal-title" className="policy-modal-title">
                {policyContents[activePolicy]?.title || activePolicy}
              </h2>
              <button
                type="button"
                className="policy-modal-close"
                onClick={() => setActivePolicy(null)}
                aria-label="Close dialog"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="policy-modal-body">
              {policyContents[activePolicy]?.body
                .split('\n')
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
