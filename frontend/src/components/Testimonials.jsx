import { motion } from 'framer-motion';
import { Star, CheckCircle2, MapPin } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    id: 'review-1',
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    artwork: 'Lord Ganesha Backlit LED Wooden Frame',
    text: 'Ordered the backlit LED frame for our home mandir. The warm golden illumination and sacred precision of the carving exceeded our expectations. It has transformed our living room.',
    initial: 'P',
  },
  {
    id: 'review-2',
    name: 'Rahul Gupta',
    location: 'New Delhi',
    rating: 5,
    artwork: 'Lord Ganesha Dashboard Idol',
    text: 'The car dashboard idol and hanging look stunning and add a serene energy to every drive. Sturdy anti-slip mount and genuine handcrafted brass finish. Top-notch quality!',
    initial: 'R',
  },
  {
    id: 'review-3',
    name: 'Anita Desai',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    artwork: 'Geometric Ginkgo Metal Wall Art',
    text: 'Impeccable metal craft with rust-resistant matte finish. Arrived in reinforced wooden packaging without a single scratch. Truly luxurious feel at an honest price.',
    initial: 'A',
  },
  {
    id: 'review-4',
    name: 'Vikram Patel',
    location: 'Ahmedabad, Gujarat',
    rating: 5,
    artwork: 'Shree Ram Mandir 3D Wooden Model',
    text: 'Bought festive gift sets for family and corporate gifting. Everyone was spellbound by the intricate architecture and sacred devotion in each piece. Highly recommended!',
    initial: 'V',
  },
];

function Stars({ count }) {
  return (
    <div className="review-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? 'star-filled' : 'star-empty'}
          fill={i < count ? '#eab308' : 'none'}
          stroke={i < count ? '#eab308' : '#d1d5db'}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="reviews" aria-label="Customer reviews">
      <div className="section-wrap">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="sec-header"
        >
          <span className="sec-eyebrow">PATRON EXPERIENCES</span>
          <h2 className="sec-title">Blessed Homes &amp; Testimonials</h2>
          <p className="sec-subtitle">
            Cherished by over 10,000+ patrons across India who have sanctified their living spaces with our art.
          </p>
        </motion.div>

        <div className="reviews-grid">
          {testimonials.map((review, idx) => (
            <motion.div
              key={review.id}
              className="review-card"
              id={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <div className="review-card-top">
                <Stars count={review.rating} />
                <span className="review-verified-pill">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  Verified Patron
                </span>
              </div>

              <p className="review-artwork-tag">Artwork: {review.artwork}</p>
              <p className="review-text">"{review.text}"</p>

              <div className="review-author">
                <div className="review-avatar">
                  {review.initial}
                </div>
                <div className="review-author-meta">
                  <p className="review-name">{review.name}</p>
                  <p className="review-location" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} />
                    <span>{review.location}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
