import { Heart } from 'lucide-react';
import './ProductGrid.css';

const products = [
  {
    id: 'prod-1',
    name: 'Lord Ganesha Backlit LED Wooden Frame',
    price: '₹899',
    originalPrice: '₹1,299',
    discount: '30% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.8,
    reviews: 245,
    tag: 'Bestseller',
    tagColor: '#e8a020',
  },
  {
    id: 'prod-2',
    name: 'Geometric Ginkgo Metal Wall Art',
    price: '₹1,499',
    originalPrice: '₹2,199',
    discount: '32% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.7,
    reviews: 183,
    tag: 'New',
    tagColor: '#2d5016',
  },
  {
    id: 'prod-3',
    name: 'Shree Ram Mandir 3D Wooden Tabletop Model',
    price: '₹649',
    originalPrice: '₹999',
    discount: '35% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.9,
    reviews: 312,
    tag: 'Popular',
    tagColor: '#c04040',
  },
  {
    id: 'prod-4',
    name: 'Lord Ganesha Brass Dashboard Idol',
    price: '₹399',
    originalPrice: '₹599',
    discount: '33% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.6,
    reviews: 97,
    tag: '',
    tagColor: '',
  },
  {
    id: 'prod-5',
    name: 'Maha Mrityunjaya Brass Yantra Plate',
    price: '₹499',
    originalPrice: '₹799',
    discount: '37% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.7,
    reviews: 154,
    tag: 'Spiritual',
    tagColor: '#2d5016',
  },
  {
    id: 'prod-6',
    name: 'Minimalist Silent Quartz Wall Clock',
    price: '₹849',
    originalPrice: '₹1,299',
    discount: '35% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.8,
    reviews: 88,
    tag: 'New',
    tagColor: '#2d5016',
  },
  {
    id: 'prod-7',
    name: 'Festive Gift Combo Set (Idol + Standee)',
    price: '₹999',
    originalPrice: '₹1,599',
    discount: '38% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.9,
    reviews: 67,
    tag: 'Value Pack',
    tagColor: '#8b5e00',
  },
  {
    id: 'prod-8',
    name: 'Hanuman Chalisa Illuminated Acrylic Frame',
    price: '₹999',
    originalPrice: '₹1,499',
    discount: '33% OFF',
    image: '/new-images/product-placeholder.jpg',
    rating: 4.8,
    reviews: 201,
    tag: 'Trending',
    tagColor: '#c04040',
  },
];

function StarRating({ rating }) {
  return (
    <div className="star-rating" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${rating >= star ? 'filled' : rating >= star - 0.5 ? 'half' : ''}`}>
          ★
        </span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="product-card" id={product.id}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        {product.tag && (
          <span className="product-tag" style={{ background: product.tagColor }}>
            {product.tag}
          </span>
        )}
        {product.discount && <span className="product-discount">{product.discount}</span>}
        <button className="product-wishlist" aria-label="Add to wishlist">
          <Heart size={18} strokeWidth={2} />
        </button>
        <div className="product-quick-add">
          <button className="quick-add-btn" aria-label={`Add ${product.name} to cart`}>
            Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <StarRating rating={product.rating} />
        <p className="product-reviews">({product.reviews} reviews)</p>
        <div className="product-pricing">
          <span className="product-price">{product.price}</span>
          <span className="product-original-price">{product.originalPrice}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <section className="product-grid-section" id="featured-products" aria-label="Featured products">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">Our Collection</span>
          <h2 className="section-title">Featured Products</h2>
          <p className="section-desc">Handcrafted devotional and wall decor pieces loved by thousands of happy customers.</p>
        </div>
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="view-all-wrap">
          <a href="#shop" className="btn-view-all">View All Products →</a>
        </div>
      </div>
    </section>
  );
}
