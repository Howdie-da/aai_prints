import { useState } from 'react';
import './AnnouncementBar.css';

/* Promotional offer messages */
const announcements = [
  '5% OFF On order above ₹3000/',
  'Free SHIPPING on order above ₹500',
  'Get ₹100 OFF on your First Order',
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c - 1 + announcements.length) % announcements.length);
  const next = () => setCurrent((c) => (c + 1) % announcements.length);

  return (
    <div className="ann-bar" role="banner" aria-label="Promotions">
      <button className="ann-btn" onClick={prev} aria-label="Previous">&#8249;</button>
      <p className="ann-text">{announcements[current]}</p>
      <button className="ann-btn" onClick={next} aria-label="Next">&#8250;</button>
    </div>
  );
}
