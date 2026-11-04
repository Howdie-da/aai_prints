import { useState } from 'react';
import './Footer.css';

const policyContents = {
  'Contact Us': {
    title: 'Customer Assistance & Support',
    body: 'Our customer assistance team is dedicated to helping you with product inquiries, bulk orders, and custom sizes. Backend communication channels and email ticketing will be linked by our backend development team.',
  },
  'FAQs': {
    title: 'Frequently Asked Questions',
    body: '• Are backlit frames ready to plug in? Yes, each backlit frame comes with a certified power adapter.\n• How are wall arts mounted? All units include pre-fitted mounting hardware.\n• Are dashboard idols suitable for car vibration? Yes, each idol includes automotive-grade double-sided adhesive.',
  },
  'Shipping Policy': {
    title: 'Shipping & Delivery Policy',
    body: 'We deliver safely across all serviceable pin codes in India. Orders are packed in 5-ply reinforced protective packaging to ensure zero damage in transit. Standard shipping takes 3 to 7 business days, with free shipping on orders above ₹500.',
  },
  'Returns & Refunds': {
    title: 'Returns & Transit Guarantee',
    body: 'We stand behind the quality of our handcrafted pieces. In the rare event of transit damage, we provide a 7-day replacement guarantee upon sharing unboxing photos or video.',
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    body: 'We respect your privacy. Personal details such as your name, delivery address, and order history are securely handled and never shared or sold to external third parties.',
  },
  'Terms of Service': {
    title: 'Terms of Service',
    body: 'Welcome to Aai Prints. All catalog prices, specifications, and product descriptions represent authentic handcrafted goods. Orders are subject to standard verification and dispatch schedules.',
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
    { label: 'Devotional Wall Art', category: 'Wall Hangings' },
    { label: 'Backlit LED Frames', category: 'Backlit LED Frames' },
    { label: 'Car Dashboard Idols', category: 'Dashboard Idols' },
    { label: 'Metal Wall Art', category: 'Metal Wall Art' },
    { label: 'Designer Wall Clocks', category: 'Wall Clocks' },
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
      <div className="footer-inner">

        {/* 1. Brand column */}
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-text">aai Prints</span>
          </div>
          <p className="footer-desc">
            Thoughtfully handcrafted spiritual devotional frames, acrylic idols, and designer wall art.
            Designed to bring peace, beauty, and positivity into every home and vehicle.
          </p>
          <div className="footer-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Handcrafted in India • 100% Quality Assurance</span>
          </div>
          <div className="footer-socials" aria-label="Social media links">
            <a href="#" className="social-link" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Pinterest" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16c-.47 0-.93-.06-1.38-.16l1.03-4.21a2.28 2.28 0 0 1-.09-.63 2 2 0 0 1 2-2c.87 0 1.5.57 1.5 1.42 0 1.04-.79 2.52-1.15 3.75A1.33 1.33 0 0 0 15.25 18a3.42 3.42 0 0 0 3.33-3.77C18.58 11.28 15.7 9 12 9a5 5 0 0 0-5.21 5.12c0 1.3.5 2.5 1.4 3.06a.5.5 0 0 1 .22.5l-.3 1.22a.5.5 0 0 1-.73.33A6.74 6.74 0 0 1 5 12a7 7 0 0 1 7-7z"/></svg>
            </a>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div className="footer-col">
          <h3 className="footer-heading">Quick Links</h3>
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
          <h3 className="footer-heading">Shop Categories</h3>
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
          <div className="footer-trust-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Safe packaging &amp; reliable dispatch across India</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} aai Prints. All rights reserved.</p>
          <p className="footer-tagline">Devotional, Car &amp; Wall Décor | Handcrafted Home Décor Online</p>
        </div>
      </div>

      {/* ── Customer Care Policy Informational Modal ── */}
      {activePolicy && policyContents[activePolicy] && (
        <div
          className="footer-modal-backdrop"
          onClick={() => setActivePolicy(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="footer-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="footer-modal-header">
              <h3 className="footer-modal-title">
                {policyContents[activePolicy].title}
              </h3>
              <button
                type="button"
                className="footer-modal-close"
                onClick={() => setActivePolicy(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="footer-modal-body">
              {policyContents[activePolicy].body.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <div className="footer-modal-footer">
              <button
                type="button"
                className="footer-modal-ok-btn"
                onClick={() => setActivePolicy(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
