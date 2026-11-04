import './CategorySection.css';

const categories = [
  {
    id: 'cat-1',
    title: 'Wall Hangings',
    count: '120+ Designs',
    image: '/new-images/cat-wall-hangings.jpg',
    href: '#devotional',
    tag: 'Bestseller',
  },
  {
    id: 'cat-2',
    title: 'Backlit LED Frames',
    count: '80+ Designs',
    image: '/new-images/cat-backlit-led-frames.jpg',
    href: '#devotional',
    tag: 'New Arrivals',
  },
  {
    id: 'cat-3',
    title: 'Dashboard Idols',
    count: '60+ Designs',
    image: '/new-images/cat-dashboard-idols.jpg',
    href: '#car-decor',
    tag: 'Popular',
  },
  {
    id: 'cat-4',
    title: 'Car Hangings',
    count: '40+ Designs',
    image: '/new-images/cat-car-hangings.jpg',
    href: '#car-decor',
    tag: '',
  },
  {
    id: 'cat-5',
    title: 'Framed Wall Art',
    count: '95+ Designs',
    image: '/new-images/cat-framed-wall-art.jpg',
    href: '#wall-decor',
    tag: '',
  },
  {
    id: 'cat-6',
    title: 'Metal Wall Art',
    count: '50+ Designs',
    image: '/new-images/cat-metal-wall-art.jpg',
    href: '#wall-decor',
    tag: 'New',
  },
];

export default function CategorySection() {
  return (
    <section className="category-section" id="shop" aria-label="Shop by category">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">Browse Collections</span>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-desc">Explore our curated collection of handcrafted decor pieces for home and car.</p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <a key={cat.id} href={cat.href} className="category-card" id={cat.id} aria-label={cat.title}>
              <div className="category-image-wrap">
                <img src={cat.image} alt={cat.title} className="category-image" loading="lazy" />
                {cat.tag && <span className="category-tag">{cat.tag}</span>}
                <div className="category-overlay">
                  <span className="category-shop-btn">Shop Now →</span>
                </div>
              </div>
              <div className="category-info">
                <h3 className="category-name">{cat.title}</h3>
                <p className="category-count">{cat.count}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
