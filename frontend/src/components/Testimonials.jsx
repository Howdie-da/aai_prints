import './Testimonials.css';

const testimonials = [
  {
    id: 'review-1',
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Ordered backlit LED frames for our home temple. The finish and divine illumination exceeded our expectations!',
    initial: 'P',
    color: '#4a7c20',
  },
  {
    id: 'review-2',
    name: 'Rahul Gupta',
    location: 'Delhi',
    rating: 5,
    text: 'The car dashboard idol and hanging look stunning and add a serene energy to every drive. Truly top-notch craftsmanship.',
    initial: 'R',
    color: '#2d5016',
  },
  {
    id: 'review-3',
    name: 'Anita Desai',
    location: 'Bangalore',
    rating: 5,
    text: 'Great quality metal wall art at very reasonable prices. Packed securely and arrived without a scratch. Highly recommended!',
    initial: 'A',
    color: '#6b8c3e',
  },
  {
    id: 'review-4',
    name: 'Vikram Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'Bought festive gift sets for corporate gifting. Everyone was delighted with the unique spiritual designs and packaging.',
    initial: 'V',
    color: '#3d6b1e',
  },
];

function Stars({ count }) {
  return (
    <div className="review-stars" aria-label={`${count} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="reviews" aria-label="Customer reviews">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">Patron Experiences</span>
          <h2 className="section-title">Customer Appreciation &amp; Feedback</h2>
          <p className="section-desc">Handcrafted with devotion, designed to elevate living spaces with spiritual elegance.</p>
        </div>
        <div className="reviews-grid">
          {testimonials.map((review) => (
            <div key={review.id} className="review-card" id={review.id}>
              <Stars count={review.rating} />
              <p className="review-text">"{review.text}"</p>
              <div className="review-author">
                <div className="review-avatar" style={{ background: review.color }}>
                  {review.initial}
                </div>
                <div>
                  <p className="review-name">{review.name}</p>
                  <p className="review-location">📍 {review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
