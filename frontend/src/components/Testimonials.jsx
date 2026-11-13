import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '../services/api';
import './Testimonials.css';

function Stars({ count = 5 }) {
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
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/reviews/featured')
      .then((res) => {
        if (isMounted && res?.data?.reviews && Array.isArray(res.data.reviews)) {
          setReviews(res.data.reviews);
        }
      })
      .catch(() => {
        if (isMounted) setReviews([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // When no featured reviews exist in the database, cleanly omit the section
  if (!reviews || reviews.length === 0) {
    return null;
  }

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
          <h2 className="sec-title">Customer Reviews &amp; Testimonials</h2>
          <p className="sec-subtitle">
            Authentic feedback from verified customers across India.
          </p>
        </motion.div>

        <div className="reviews-grid">
          {reviews.map((review, idx) => {
            const authorName = review.userName || review.user?.name || 'Customer';
            const location = review.city || '';
            const initial = authorName.charAt(0).toUpperCase();
            const artworkTitle = review.product?.name || review.title || '';

            return (
              <motion.div
                key={review._id || review.id || idx}
                className="review-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <div className="review-card-top">
                  <Stars count={review.rating || 5} />
                  {review.isVerifiedPurchase !== false && (
                    <span className="review-verified-pill">
                      <CheckCircle2 size={12} strokeWidth={2.5} />
                      Verified Customer
                    </span>
                  )}
                </div>

                {artworkTitle && (
                  <p className="review-artwork-tag">Artwork: {artworkTitle}</p>
                )}
                <p className="review-text">"{review.comment}"</p>

                <div className="review-author">
                  <div className="review-avatar">
                    {initial}
                  </div>
                  <div className="review-author-meta">
                    <p className="review-name">{authorName}</p>
                    {location && (
                      <p className="review-location" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} />
                        <span>{location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
