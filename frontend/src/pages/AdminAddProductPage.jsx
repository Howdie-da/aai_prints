import { useState, useEffect, useMemo, useRef } from 'react';
import {
  PackagePlus,
  Layers,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Loader2,
  X,
  Sparkles,
  Tag,
  Box,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { fetchAllProducts } from '../services/productService';
import AdminEditProductModal from '../components/AdminEditProductModal';
import './AdminAddProductPage.css';

const PRESET_BADGES = ['Bestseller', 'New Launch', 'Devotional', '', 'Sale', 'Trending'];

export default function AdminAddProductPage({
  onNavigateHome,
  onNavigateShop,
  onNavigateB2B,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}) {
  // Navigation & Tabs State ('products' = catalog list, 'add' = add product form)
  const [activeTab, setActiveTab] = useState('products');

  // Products Catalog State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Feedback Banner State
  const [feedback, setFeedback] = useState(null);

  // Modal Editing State
  const [editingProduct, setEditingProduct] = useState(null);

  // ── Add Product Form State ──
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [inStock, setInStock] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [dispatchTimeInfo, setDispatchTimeInfo] = useState('Ready to Dispatch within 24-48 Hours');
  const [badges, setBadges] = useState(['Devotional']);
  const [customBadge, setCustomBadge] = useState('');

  // Images state
  const [images, setImages] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([
    {
      name: '12x18 inches / Rolled Canvas',
      size: '12x18 in',
      material: 'Canvas',
      price: '',
      originalPrice: '',
      stock: '10',
    },
  ]);

  // Categories list from API
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load Products Catalog ──
  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const list = await fetchAllProducts();
      setProducts(list || []);
    } catch (err) {
      console.warn('[AdminAddProductPage] Could not load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ── Load Categories ──
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const res = await api.get('/categories');
        const list = res.data?.categories || [];
        if (isMounted) {
          const flattened = [];
          list.forEach((parent) => {
            flattened.push({ _id: parent._id, name: parent.name, isParent: true });
            if (parent.subcategories && parent.subcategories.length > 0) {
              parent.subcategories.forEach((sub) => {
                flattened.push({
                  _id: sub._id,
                  name: `— ${sub.name} (${parent.name})`,
                  isParent: false,
                });
              });
            }
          });
          setCategoriesList(flattened);
          if (flattened.length > 0 && !category) {
            setCategory(flattened[0]._id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch categories from server:', err.message);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Filtered Products for Catalog Table ──
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchesCat =
        categoryFilter === 'All' ||
        p.category === categoryFilter ||
        p.categorySlug === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, categoryFilter]);

  // Unique category names for table filter
  const distinctCategoryNames = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Total inventory units
  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.stockCount ?? p.stock ?? 10) || 0), 0);
  }, [products]);

  // ── File Upload to Cloudinary ──
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      setUploadError(null);
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await api.post('/media/upload-multiple', formData);
      const newAssets = (res.data?.assets || []).map((a) => ({
        url: a.url,
        publicId: a.publicId,
      }));
      setImages((prev) => [...prev, ...newAssets]);
    } catch (err) {
      setUploadError(
        err.data?.message || err.message || 'Image upload failed. You can paste an image URL directly.'
      );
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      setUploadError('Please enter a valid HTTP/HTTPS or local image URL.');
      return;
    }
    const match = trimmed.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    const publicId = match ? match[1] : null;
    setImages((prev) => [...prev, { url: trimmed, publicId }]);
    setManualImageUrl('');
    setUploadError(null);
  };

  const removeImage = async (index) => {
    const target = images[index];
    if (!target) return;
    const url = typeof target === 'string' ? target : target.url;
    const publicId = typeof target === 'string' ? null : target.publicId;

    setImages((prev) => prev.filter((_, i) => i !== index));

    if (publicId || (url && url.includes('cloudinary.com'))) {
      try {
        const query = publicId
          ? `publicId=${encodeURIComponent(publicId)}`
          : `url=${encodeURIComponent(url)}`;
        await api.delete(`/media?${query}`);
      } catch (err) {
        console.warn('[Media] Cloudinary cleanup notice:', err.message);
      }
    }
  };

  // ── Variants Handlers ──
  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        name: '',
        size: '',
        material: '',
        price: basePrice || '',
        originalPrice: originalPrice || '',
        stock: '10',
      },
    ]);
  };

  const updateVariantRow = (index, field, value) => {
    const copy = [...variants];
    copy[index][field] = value;
    setVariants(copy);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // ── Badge Handlers ──
  const toggleBadge = (badgeName) => {
    if (badges.includes(badgeName)) {
      setBadges(badges.filter((b) => b !== badgeName));
    } else {
      setBadges([...badges, badgeName]);
    }
  };

  const addCustomBadge = () => {
    const trimmed = customBadge.trim();
    if (!trimmed) return;
    if (!badges.includes(trimmed)) {
      setBadges([...badges, trimmed]);
    }
    setCustomBadge('');
  };

  // ── Submit New Product ──
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Product title is required.' });
      return;
    }
    if (!category) {
      setFeedback({ type: 'error', message: 'Please select a category.' });
      return;
    }
    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      setFeedback({ type: 'error', message: 'Please specify a valid base price.' });
      return;
    }
    if (!description.trim()) {
      setFeedback({ type: 'error', message: 'Product description is required.' });
      return;
    }
    if (images.length === 0) {
      setFeedback({
        type: 'error',
        message: 'At least one product photo is required. Please upload or paste an image URL.',
      });
      return;
    }

    const formattedVariants = hasVariants
      ? variants
        .filter((v) => v.name && v.name.trim())
        .map((v) => ({
          name: v.name.trim(),
          label: v.name.trim(),
          attributes: {
            size: v.size?.trim() || undefined,
            material: v.material?.trim() || undefined,
          },
          price: Number(v.price) || Number(basePrice),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
          stock: Number(v.stock) || 10,
          inStock: (Number(v.stock) || 10) > 0,
        }))
      : [];

    const finalImageUrls = images.map((img) => (typeof img === 'string' ? img : img.url));

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      basePrice: Number(basePrice),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock) || 10,
      inStock,
      isTrending,
      trending: isTrending,
      dispatchTimeInfo: dispatchTimeInfo.trim(),
      badges,
      tag: badges[0] || '',
      images: finalImageUrls,
      hasVariants: Boolean(hasVariants && formattedVariants.length > 0),
      variants: formattedVariants,
    };

    try {
      setIsSubmitting(true);
      const res = await api.post('/products', payload);
      const newProduct = res.data?.product;

      setFeedback({
        type: 'success',
        message: `Product "${name}" was published successfully to the live storefront!`,
      });

      // Reset form
      handleResetForm();

      // Refresh list
      await loadProducts();

      if (onProductCreated && newProduct) {
        onProductCreated(newProduct);
      }

      // Switch to products catalog tab
      setActiveTab('products');
    } catch (err) {
      const detailed = err.data?.errors?.length
        ? err.data.errors.map((e) => e.message).join('. ')
        : err.data?.message || err.message || 'Failed to create product.';
      setFeedback({ type: 'error', message: detailed });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setDescription('');
    setBasePrice('');
    setOriginalPrice('');
    setStock('10');
    setInStock(true);
    setIsTrending(false);
    setBadges(['Devotional']);
    setImages([]);
    setManualImageUrl('');
    setHasVariants(false);
    setVariants([
      {
        name: '12x18 inches / Rolled Canvas',
        size: '12x18 in',
        material: 'Canvas',
        price: '',
        originalPrice: '',
        stock: '10',
      },
    ]);
  };

  // ── Delete Product from Catalog Table ──
  const handleDeleteProduct = async (id, prodName) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${prodName}" from the storefront catalog?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${id}?hard=true`);
      setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      setFeedback({
        type: 'success',
        message: `Product "${prodName}" deleted successfully from database.`,
      });
      if (onProductDeleted) onProductDeleted(id);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Delete failed: ${err.data?.message || err.message}`,
      });
    }
  };

  return (
    <div className="admin-product-page">
      {/* ── Top Header ── */}
      <header className="admin-product-header">
        <div className="admin-product-header-wrap">
          <div className="admin-product-breadcrumbs">
            <button
              type="button"
              onClick={onNavigateHome}
              className="admin-product-crumb-btn"
            >
              <ArrowLeft size={14} /> Main Store
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Retail Products Manager</span>
          </div>

          <div className="admin-product-header-main">
            <div>
              <span className="admin-product-tag">RETAIL CATALOG MANAGEMENT</span>
              <h1 className="admin-product-title">Retail Products Manager</h1>
              <p className="admin-product-sub">
                Manage all customer-facing products in the storefront catalog (`#/shop`). Add new creations, update pricing, upload photos, or remove items.
              </p>
            </div>

            <div className="admin-product-header-actions">
              <button
                type="button"
                className="admin-product-btn-b2b"
                onClick={onNavigateB2B || (() => (window.location.hash = '#/admin/b2b'))}
                title="Go to Wholesale Store Manager"
              >
                <Building2 size={14} /> Wholesale Manager →
              </button>
              <button
                type="button"
                className="admin-product-btn-secondary"
                onClick={onNavigateShop || (() => (window.location.hash = '#/shop'))}
                title="View Live Storefront"
              >
                <ExternalLink size={14} /> View Storefront
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="admin-product-container">
        {/* ── Stats Strip ── */}
        <div className="admin-product-stats-grid">
          <div className="admin-product-stat-card">
            <span className="admin-product-stat-label">Active Retail Products</span>
            <span className="admin-product-stat-value">{products.length}</span>
            <span className="admin-product-stat-sub">Live in storefront catalog</span>
          </div>

          <div className="admin-product-stat-card">
            <span className="admin-product-stat-label">Total Inventory Units</span>
            <span className="admin-product-stat-value">
              {totalStockUnits.toLocaleString('en-IN')}
            </span>
            <span className="admin-product-stat-sub">Units available across variants</span>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="admin-product-tabs">
          <button
            type="button"
            className={`admin-product-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={16} />
            Retail Catalog ({products.length})
          </button>
          <button
            type="button"
            className={`admin-product-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <PackagePlus size={16} />
            + Add New Product
          </button>
        </div>

        {/* ── Feedback Banner ── */}
        {feedback && (
          <div className={`admin-product-feedback ${feedback.type}`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="feedback-close"
              aria-label="Dismiss feedback"
            >
              ×
            </button>
          </div>
        )}

        {/* ════ TAB 1: RETAIL PRODUCTS CATALOG TABLE ════ */}
        {activeTab === 'products' && (
          <div className="admin-product-card">
            <div className="admin-product-card-header">
              <div className="admin-product-card-title-group">
                <h2>Active Storefront Catalog ({products.length})</h2>
                <p>
                  Browse all active retail products. Click Edit to modify photos, prices, badges, and variants, or Delete to remove an item.
                </p>
              </div>

              <button
                type="button"
                className="admin-product-refresh-btn"
                onClick={loadProducts}
                title="Refresh product list from server"
              >
                <RefreshCw size={14} className={isLoadingProducts ? 'spin-anim' : ''} />
                Refresh
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="admin-product-toolbar">
              <div className="admin-product-search-box">
                <Search size={16} style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search products by title, slug, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-product-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="admin-product-search-clear"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="admin-product-filter-group">
                <label>Filter Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="admin-product-filter-select"
                >
                  <option value="All">All Categories ({products.length})</option>
                  {distinctCategoryNames.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Content */}
            {isLoadingProducts ? (
              <div className="admin-product-loading">
                <Loader2 size={24} className="spin-anim" style={{ color: 'var(--gold, #C58B59)' }} />
                <span>Loading retail catalog from server...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="admin-product-empty">
                <Box size={40} strokeWidth={1.5} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                <strong>No products matched your criteria</strong>
                <p>
                  {searchQuery || categoryFilter !== 'All'
                    ? 'Try adjusting your search query or category filter.'
                    : 'Your catalog is empty. Click "+ Add New Product" above to publish your first artwork!'}
                </p>
                {(searchQuery || categoryFilter !== 'All') && (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-product-table-wrap">
                <table className="admin-product-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Product</th>
                      <th style={{ width: '18%' }}>Category</th>
                      <th style={{ width: '14%' }}>Price</th>
                      <th style={{ width: '12%' }}>Stock</th>
                      <th style={{ width: '10%' }}>Variants</th>
                      <th style={{ width: '8%', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const img =
                        (p.images && p.images[0]) ||
                        p.image ||
                        '/new-images/product-placeholder.jpg';
                      const currentPrice = Number(p.price || p.basePrice || 0);
                      const origPrice = p.originalPrice ? Number(p.originalPrice) : null;
                      const hasVar = Array.isArray(p.variants) && p.variants.length > 0;
                      const isOutOfStock = p.availability === 'out_of_stock' || p.inStock === false;

                      return (
                        <tr key={p.id || p._id}>
                          <td className="product-col">
                            <img
                              src={img}
                              alt={p.name}
                              className="table-thumb"
                              onError={(e) => {
                                e.currentTarget.src = '/new-images/product-placeholder.jpg';
                              }}
                            />
                            <div className="product-info-cell">
                              <strong className="product-cell-name">{p.name}</strong>
                              <div className="product-cell-sub">
                                <span className="product-cell-slug">{p.slug || p._id}</span>
                                {p.tag && <span className="table-tag-chip">{p.tag}</span>}
                                {(p.isTrending || p.trending) && (
                                  <span className="table-trending-chip">🔥 Trending</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="admin-cat-pill">{p.category || 'Artwork'}</span>
                          </td>

                          <td>
                            <div className="table-price-cell">
                              <strong>₹{currentPrice.toLocaleString('en-IN')}</strong>
                              {origPrice && origPrice > currentPrice && (
                                <span className="table-mrp">₹{origPrice.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </td>

                          <td>
                            {isOutOfStock ? (
                              <span className="stock-pill out-of-stock">● Out of Stock</span>
                            ) : (
                              <span className="stock-pill in-stock">
                                ● {p.stockCount ?? p.stock ?? 10} in stock
                              </span>
                            )}
                          </td>

                          <td>
                            {hasVar ? (
                              <span className="variant-chip multi">
                                {p.variants.length} Variants
                              </span>
                            ) : (
                              <span className="variant-chip single">Single</span>
                            )}
                          </td>

                          <td>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="admin-action-btn edit"
                                onClick={() => setEditingProduct(p)}
                                title={`Edit "${p.name}"`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn delete"
                                onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                                title={`Delete "${p.name}"`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════ TAB 2: ADD PRODUCT FORM ════ */}
        {activeTab === 'add' && (
          <div className="admin-product-card">
            <div className="admin-product-card-header">
              <div className="admin-product-card-title-group">
                <h2>Add New Product to Store</h2>
                <p>
                  Fill in product details, upload high-resolution images, and configure pricing and variants.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="admin-product-form">
              {/* ── Card Section 1: General Info ── */}
              <div className="form-section-box">
                <h3 className="form-section-title">📦 General Information</h3>

                <div className="form-grid-2">
                  <div className="form-field full-width">
                    <label>
                      Product Title <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lord Shiva Meditating Backlit LED Frame"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Category <span className="req">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isLoadingCategories}
                      required
                    >
                      {categoriesList.length === 0 ? (
                        <option value="">Loading categories...</option>
                      ) : (
                        categoriesList.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                    <small className="field-hint">Controls storefront navigation and filters</small>
                  </div>

                  <div className="form-field">
                    <label>Dispatch Timeline</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ready to Dispatch within 24-48 Hours"
                      value={dispatchTimeInfo}
                      onChange={(e) => setDispatchTimeInfo(e.target.value)}
                    />
                    <small className="field-hint">Displayed on the product detail page</small>
                  </div>

                  <div className="form-field full-width">
                    <label>
                      Description <span className="req">*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="Detailed description of craftsmanship, dimensions, LED adapter specifications, and wall mounting features..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ── Card Section 2: Pricing & Inventory ── */}
              <div className="form-section-box">
                <h3 className="form-section-title">💰 Pricing &amp; Stock</h3>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>
                      Selling Price (₹) <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      placeholder="1499"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Original MRP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      placeholder="2499 (Displays strikethrough)"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                    />
                    <span>Mark as In Stock immediately for customer orders</span>
                  </label>
                </div>

                <div className="form-field-checkbox" style={{ marginTop: '10px' }}>
                  <label
                    className="checkbox-label"
                    style={{
                      background: isTrending ? 'rgba(217, 119, 6, 0.08)' : '#f8fafc',
                      border: isTrending ? '1.5px solid #d97706' : '1px solid #cbd5e1',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#d97706', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600, color: isTrending ? '#b45309' : '#334155' }}>
                      🔥 Mark as Trending (will be featured in Homepage "Trending Now" section)
                    </span>
                  </label>
                </div>
              </div>

              {/* ── Card Section 3: Badges & Tags ── */}
              <div className="form-section-box">
                <h3 className="form-section-title">🏷️ Badges &amp; Highlights</h3>
                <p className="field-hint" style={{ marginBottom: '12px' }}>
                  Select badge tags to feature on the product card in catalog lists.
                </p>

                <div className="badges-chips-wrap">
                  {PRESET_BADGES.map((b) => {
                    const isSelected = badges.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        className={`badge-chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleBadge(b)}
                      >
                        {isSelected && <Sparkles size={13} />}
                        {b}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* ── Card Section 4: Media & Photos ── */}
              <div className="form-section-box">
                <h3 className="form-section-title">🖼️ Product Media &amp; Gallery</h3>
                <p className="field-hint" style={{ marginBottom: '14px' }}>
                  Upload high-resolution images to Cloudinary, or paste direct image URLs. The first image serves as the main catalog cover.
                </p>

                {/* Upload Drag & Drop Zone */}
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  {isUploadingImages ? (
                    <div className="upload-dropzone-content">
                      <Loader2 size={28} className="spin-anim" style={{ color: 'var(--gold, #C58B59)' }} />
                      <strong>Uploading photos to Cloudinary CDN...</strong>
                      <small>Generating optimized assets</small>
                    </div>
                  ) : (
                    <div className="upload-dropzone-content">
                      <div className="upload-icon-circle">
                        <UploadCloud size={24} style={{ color: 'var(--gold, #C58B59)' }} />
                      </div>
                      <strong>Click to upload product photos</strong>
                      <small>Supports PNG, JPG, WEBP up to 10MB each</small>
                      <span className="upload-btn-chip">Choose Files</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={isUploadingImages}
                  />
                </div>

                {uploadError && (
                  <div className="upload-error-banner">
                    <AlertCircle size={15} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Manual URL Input */}
                <div className="manual-url-row">
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Or paste direct image URL (https://... or /new-images/...)"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddManualUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleAddManualUrl}
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails Gallery */}
                {images.length > 0 && (
                  <div className="thumbnails-preview-wrap">
                    <label className="thumbnails-preview-label">
                      Product Gallery ({images.length} {images.length === 1 ? 'photo' : 'photos'})
                    </label>
                    <div className="thumbnails-grid">
                      {images.map((item, idx) => {
                        const imgUrl = typeof item === 'string' ? item : item.url;
                        return (
                          <div key={idx} className="thumbnail-card">
                            <img src={imgUrl} alt={`Product ${idx + 1}`} />
                            {idx === 0 && <span className="thumb-cover-tag">COVER</span>}
                            <button
                              type="button"
                              className="thumb-delete-btn"
                              onClick={() => removeImage(idx)}
                              title="Remove photo"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Card Section 5: Variants ── */}
              <div className="form-section-box">
                <div className="variant-toggle-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                    />
                    <strong style={{ fontSize: '15px' }}>
                      This product has multiple sizes, framing options, or finishes (Variants)
                    </strong>
                  </label>
                </div>

                {hasVariants && (
                  <div className="variants-editor-wrap">
                    <p className="field-hint" style={{ marginBottom: '14px' }}>
                      Configure dimensions, materials, and specific prices for customer selection.
                    </p>

                    <div className="variants-table-wrap">
                      <table className="variants-table">
                        <thead>
                          <tr>
                            <th style={{ width: '32%' }}>Variant Name *</th>
                            <th style={{ width: '18%' }}>Size</th>
                            <th style={{ width: '18%' }}>Material</th>
                            <th style={{ width: '16%' }}>Price (₹) *</th>
                            <th style={{ width: '12%' }}>Stock</th>
                            <th style={{ width: '4%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, i) => (
                            <tr key={i}>
                              <td>
                                <input
                                  type="text"
                                  className="form-input table-input"
                                  placeholder="e.g. 18x24 inches / Teak Frame"
                                  value={v.name}
                                  onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input table-input"
                                  placeholder="18x24 in"
                                  value={v.size}
                                  onChange={(e) => updateVariantRow(i, 'size', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-input table-input"
                                  placeholder="Teak Wood"
                                  value={v.material}
                                  onChange={(e) => updateVariantRow(i, 'material', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input table-input"
                                  placeholder={basePrice || '1499'}
                                  value={v.price}
                                  onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input table-input"
                                  placeholder="10"
                                  value={v.stock}
                                  onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="variant-del-btn"
                                  onClick={() => removeVariantRow(i)}
                                  title="Delete variant"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      className="admin-btn-secondary"
                      style={{ marginTop: '14px' }}
                      onClick={addVariantRow}
                    >
                      + Add Another Variant
                    </button>
                  </div>
                )}
              </div>

              {/* ── Form Submit Actions ── */}
              <div className="form-submit-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setActiveTab('products')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSubmitting || isUploadingImages}
                >
                  {isSubmitting ? 'Publishing Product...' : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ════ EDIT PRODUCT MODAL (Connected via AdminEditProductModal) ════ */}
      {editingProduct && (
        <AdminEditProductModal
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onProductUpdated={(updated) => {
            setFeedback({
              type: 'success',
              message: `Product "${updated.name}" was updated successfully!`,
            });
            setEditingProduct(null);
            loadProducts();
            if (onProductUpdated) onProductUpdated(updated);
          }}
          onProductDeleted={(deletedId) => {
            setFeedback({
              type: 'success',
              message: 'Product was deleted successfully.',
            });
            setEditingProduct(null);
            loadProducts();
            if (onProductDeleted) onProductDeleted(deletedId);
          }}
        />
      )}
    </div>
  );
}
