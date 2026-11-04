import './Newsletter.css';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="newsletter-section" id="newsletter" aria-label="Newsletter signup">
      <div className="newsletter-inner">
        <div className="newsletter-icon" aria-hidden="true">✨</div>
        <h2 className="newsletter-title">Elevate Your Living Spaces</h2>
        <p className="newsletter-desc">
          Subscribe for exclusive offers, new collection launches, and home styling inspirations.
          Get 10% off your first order!
        </p>
        {submitted ? (
          <div className="newsletter-success" role="alert">
            🎉 Thank you! Check your inbox for your 10% off coupon.
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              id="newsletter-email"
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="newsletter-btn" id="newsletter-submit">
              Subscribe & Save 10%
            </button>
          </form>
        )}
        <p className="newsletter-note">No spam. Unsubscribe anytime. 🔒 Privacy protected.</p>
      </div>
    </section>
  );
}
