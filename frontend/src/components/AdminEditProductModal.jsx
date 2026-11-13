import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  Plus,
  Flame,
  Tag,
  Layers,
  Sparkles,
  AlertCircle,
  Check,
  Star,
  ExternalLink,
  DollarSign,
  Package,
  Boxes
} from 'lucide-react';
import { api } from '../services/api';
import './AdminEditProductModal.css';

const PRESET_BADGES = ['Bestseller', 'New Launch', 'Devotional', 'Handcrafted', 'Sale', 'Trending'];

const DISPATCH_PRESETS = [
  'Ready to Dispatch within 24-48 Hours',
  'Ships in 2-4 Business Days',
  'Custom Made: Ships in 5-7 Days',
  'Made to Order: Ships in 7-10 Days'
];

export default function AdminEditProductModal({
  isOpen,
  onClose,
  product,
  onProductUpdated,
  onProductDeleted
}) {
  if (!isOpen || !product) return null;

  const productId = product._id || product.id;

  // Form State
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [category, setCategory] = useState(() => {
    if (typeof product.category === 'object' && product.category !== null) {
      return product.category._id || product.category.name || '';
    }
    return product.category || '';
  });
  const [basePrice, setBasePrice] = useState(
    product.basePrice != null ? String(product.basePrice) : String(product.price || '')
  );
  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice != null ? String(product.originalPrice) : ''
  );
  const [stock, setStock] = useState(
    product.stock != null ? String(product.stock) : String(product.stockCount || '10')
  );
  const [inStock, setInStock] = useState(
    product.inStock !== false && product.availability !== 'out_of_stock'
  );
  const [isTrending, setIsTrending] = useState(
    Boolean(product.isTrending ?? product.trending ?? false)
  );
  const [dispatchTimeInfo, setDispatchTimeInfo] = useState(
    product.dispatchTimeInfo || 'Ready to Dispatch within 24-48 Hours'
  );
  const [badges, setBadges] = useState(() => {
    if (Array.isArray(product.badges) && product.badges.length > 0) return product.badges;
    if (product.tag) return [product.tag];
    return ['Devotional'];
  });
  const [customBadge, setCustomBadge] = useState('');

  // Images state
  const [images, setImages] = useState(() => {
    const list = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
    return list.map((item) => {
      const url = typeof item === 'string' ? item : item.url;
      const match = url?.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      const publicId = item?.publicId || (match ? match[1] : null);
      return { url, publicId };
    });
  });

  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Variants state
  const [hasVariants, setHasVariants] = useState(
    Boolean(product.hasVariants || (product.variants && product.variants.length > 0))
  );
  const [variants, setVariants] = useState(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        name: v.name || v.label || '',
        size: v.attributes?.size || v.size || '',
        material: v.attributes?.material || v.material || '',
        price: v.price != null ? String(v.price) : '',
        originalPrice: v.originalPrice != null ? String(v.originalPrice) : '',
        stock: v.stock != null ? String(v.stock) : '10'
      }));
    }
    return [
      {
        name: '12x18 inches / Rolled Canvas',
        size: '12x18 in',
        material: 'Canvas',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stock: '10'
      }
    ];
  });

  // Categories list
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch categories
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
                  isParent: false
                });
              });
            }
          });
          setCategoriesList(flattened);
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

  // Keyboard Shortcuts (Esc to close, Ctrl/Cmd + S to save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.getElementById('admin-edit-form');
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Badge toggle
  const toggleBadge = (b) => {
    if (badges.includes(b)) {
      setBadges(badges.filter((item) => item !== b));
    } else {
      setBadges([...badges, b]);
    }
  };

  const addCustomBadge = (e) => {
    e?.preventDefault();
    const trimmed = customBadge.trim();
    if (trimmed && !badges.includes(trimmed)) {
      setBadges([...badges, trimmed]);
      setCustomBadge('');
    }
  };

  const removeBadge = (b) => {
    setBadges(badges.filter((item) => item !== b));
  };

  // Upload to Cloudinary
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImages(true);
      setErrorMessage(null);
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));

      const res = await api.post('/media/upload-multiple', formData);
      const newAssets = (res.data?.assets || []).map((a) => ({
        url: a.url,
        publicId: a.publicId
      }));
      setImages((prev) => [...prev, ...newAssets]);
    } catch (err) {
      setErrorMessage(
        err.data?.message || err.message || 'Image upload failed. You can also paste an image URL directly.'
      );
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e) => {
    uploadFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAddManualUrl = (e) => {
    e?.preventDefault();
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL');
      return;
    }
    const match = trimmed.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    const publicId = match ? match[1] : null;
    setImages((prev) => [...prev, { url: trimmed, publicId }]);
    setManualImageUrl('');
    setErrorMessage(null);
  };

  // Set image as cover
  const makeCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [target] = copy.splice(index, 1);
      return [target, ...copy];
    });
  };

  // Remove and delete image from Cloudinary
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

  // Variants helpers
  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        name: '',
        size: '',
        material: '',
        price: basePrice || '',
        originalPrice: originalPrice || '',
        stock: '10'
      }
    ]);
  };

  const addPresetVariant = (label, size, mat) => {
    setVariants([
      ...variants,
      {
        name: `${size} - ${mat}`,
        size: size,
        material: mat,
        price: basePrice || '',
        originalPrice: originalPrice || '',
        stock: '10'
      }
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

  // Discount calculation
  const getDiscountCalculation = () => {
    const bp = Number(basePrice);
    const op = Number(originalPrice);
    if (op > bp && bp > 0) {
      const diff = op - bp;
      const pct = Math.round((diff / op) * 100);
      return { diff, pct };
    }
    return null;
  };

  const discount = getDiscountCalculation();

  // Scroll to section helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Save Updates
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product title is required.');
      scrollToSection('sec-general');
      document.getElementById('edit-name')?.focus();
      return;
    }
    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      setErrorMessage('Please specify a valid selling price.');
      scrollToSection('sec-pricing');
      document.getElementById('edit-price')?.focus();
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Product description is required.');
      scrollToSection('sec-general');
      document.getElementById('edit-desc')?.focus();
      return;
    }
    if (images.length === 0) {
      setErrorMessage('At least one product photo is required. Please upload or paste an image URL.');
      scrollToSection('sec-media');
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
              material: v.material?.trim() || undefined
            },
            price: Number(v.price) || Number(basePrice),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
            stock: Number(v.stock) || 10,
            inStock: (Number(v.stock) || 10) > 0
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
      images: finalImageUrls,
      hasVariants: Boolean(hasVariants && formattedVariants.length > 0),
      variants: formattedVariants
    };

    try {
      setIsSubmitting(true);
      const res = await api.put(`/products/${productId}`, payload);
      const updatedProduct = res.data?.product;
      if (onProductUpdated && updatedProduct) {
        onProductUpdated(updatedProduct);
      }
      onClose();
    } catch (err) {
      const detailed = err.data?.errors?.length
        ? err.data.errors.map((e) => e.message).join('. ')
        : (err.data?.message || err.message || 'Failed to update product.');
      setErrorMessage(detailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}" from the database? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await api.delete(`/products/${productId}?hard=true`);
      if (onProductDeleted) {
        onProductDeleted(productId);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.data?.message || err.message || 'Failed to delete product.');
      setIsDeleting(false);
    }
  };

  // Primary cover image thumbnail
  const coverImage = images[0]?.url || (typeof images[0] === 'string' ? images[0] : null);
  const currentCategoryName = categoriesList.find((c) => c._id === category)?.name || 'Retail Product';

  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Luxury Header ── */}
        <div className="admin-modal-header">
          <div className="admin-modal-header-left">
            <div className="admin-modal-product-thumb">
              {coverImage ? (
                <img src={coverImage} alt={name || 'Product'} />
              ) : (
                <div className="thumb-placeholder">
                  <Package size={20} />
                </div>
              )}
            </div>
            <div className="admin-modal-header-titles">
              <div className="admin-modal-header-meta">
                <span className="admin-modal-tag">RETAIL MANAGER</span>
                {isTrending && (
                  <span className="admin-modal-trending-chip">
                    <Flame size={12} /> Trending
                  </span>
                )}
                <span className={`admin-modal-stock-chip ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {inStock ? '● In Stock' : '○ Out of Stock'}
                </span>
              </div>
              <h2 id="modal-edit-title" className="admin-modal-title">
                {name ? name : 'Edit Product'}
              </h2>
              <div className="admin-modal-subtitle">
                <span>{currentCategoryName}</span>
                {productId && (
                  <>
                    <span className="meta-sep">•</span>
                    <span className="modal-id-text">ID: {String(productId).slice(-6)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="admin-modal-header-right">
            <button
              type="button"
              className="admin-modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Quick Anchor Nav Bar (Sticky Single-Page Navigation) ── */}
        <div className="admin-modal-quicknav">
          <span className="quicknav-label">Jump to:</span>
          <div className="quicknav-links">
            <button
              type="button"
              className="quicknav-btn"
              onClick={() => scrollToSection('sec-general')}
            >
              <Package size={13} />
              <span>General Info</span>
            </button>

            <button
              type="button"
              className="quicknav-btn"
              onClick={() => scrollToSection('sec-pricing')}
            >
              <DollarSign size={13} />
              <span>Pricing &amp; Inventory</span>
              {isTrending && <span className="quicknav-pill-flame">🔥</span>}
            </button>

            <button
              type="button"
              className="quicknav-btn"
              onClick={() => scrollToSection('sec-media')}
            >
              <ImageIcon size={13} />
              <span>Photos &amp; Media ({images.length})</span>
            </button>

            <button
              type="button"
              className="quicknav-btn"
              onClick={() => scrollToSection('sec-variants')}
            >
              <Layers size={13} />
              <span>Variants {hasVariants && variants.length > 0 ? `(${variants.length})` : ''}</span>
            </button>
          </div>
        </div>

        {/* ── Modal Body Content (All sections rendered continuously on ONE page) ── */}
        <div className="admin-modal-body">
          {errorMessage && (
            <div className="admin-modal-alert-error" role="alert">
              <AlertCircle size={18} />
              <div className="alert-text">
                <strong>Attention Required:</strong> {errorMessage}
              </div>
              <button
                type="button"
                className="alert-dismiss"
                onClick={() => setErrorMessage(null)}
              >
                ✕
              </button>
            </div>
          )}

          <form id="admin-edit-form" onSubmit={handleSaveSubmit} className="admin-single-page-form">
            {/* ════════ SECTION 1: GENERAL INFO & BADGES ════════ */}
            <div id="sec-general" className="admin-pane-card">
              <div className="card-section-header">
                <div className="section-title-wrap">
                  <Sparkles size={16} className="text-gold" />
                  <h4>Product Identity &amp; Categorization</h4>
                </div>
                <span className="card-hint">Core details displayed on the storefront</span>
              </div>

              <div className="admin-modal-grid-2">
                <div className="admin-form-group full-width">
                  <label htmlFor="edit-name">
                    Product Title <span className="required">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    className="admin-modal-input"
                    placeholder="e.g. Divine Lord Shiva Handcrafted Wooden Wall Art"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="edit-category"
                    className="admin-modal-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoadingCategories}
                    required
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-dispatch">
                    Dispatch Timeline
                  </label>
                  <input
                    id="edit-dispatch"
                    type="text"
                    className="admin-modal-input"
                    placeholder="e.g. Ready to Dispatch within 24-48 Hours"
                    value={dispatchTimeInfo}
                    onChange={(e) => setDispatchTimeInfo(e.target.value)}
                  />
                </div>
              </div>

              {/* Dispatch Quick Presets */}
              <div className="admin-quick-presets">
                <span className="preset-label">Quick Presets:</span>
                <div className="preset-chips">
                  {DISPATCH_PRESETS.map((dp, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`preset-chip ${dispatchTimeInfo === dp ? 'selected' : ''}`}
                      onClick={() => setDispatchTimeInfo(dp)}
                    >
                      {dp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storefront Badges */}
              <div className="badges-sub-section">
                <div className="badges-editor">
                  <div className="preset-badges-group">
                    <span className="preset-label">Recommended Storefront Badges:</span>
                    <div className="badges-pills-row">
                      {PRESET_BADGES.map((badgeName) => {
                        const isSelected = badges.includes(badgeName);
                        return (
                          <button
                            key={badgeName}
                            type="button"
                            className={`badge-pill ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleBadge(badgeName)}
                          >
                            {isSelected ? <Check size={13} /> : <Plus size={13} />}
                            <span>{badgeName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-form-group full-width" style={{ marginTop: '16px' }}>
                <div className="label-with-counter">
                  <label htmlFor="edit-desc">
                    Product Description <span className="required">*</span>
                  </label>
                  <span className="char-counter">{description.length} chars</span>
                </div>
                <textarea
                  id="edit-desc"
                  rows={4}
                  className="admin-modal-textarea"
                  placeholder="Write an evocative, detailed description highlighting craftsmanship, materials, dimensions, and styling inspiration..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ════════ SECTION 2: PRICING, INVENTORY & TRENDING ════════ */}
            <div id="sec-pricing" className="admin-pane-card">
              <div className="card-section-header">
                <div className="section-title-wrap">
                  <DollarSign size={16} className="text-gold" />
                  <h4>Pricing, Inventory &amp; Trending Status</h4>
                </div>
                {discount && (
                  <span className="discount-calc-pill">
                    🎉 {discount.pct}% OFF (Customer saves ₹{discount.diff})
                  </span>
                )}
              </div>

              <div className="admin-modal-grid-2">
                <div className="admin-form-group">
                  <label htmlFor="edit-price">
                    Selling Price (₹) <span className="required">*</span>
                  </label>
                  <div className="input-currency-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="1"
                      className="admin-modal-input with-prefix"
                      placeholder="e.g. 899"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-mrp">
                    Original MRP (₹) <span className="optional-hint">(Shown strikethrough)</span>
                  </label>
                  <div className="input-currency-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      id="edit-mrp"
                      type="number"
                      min="0"
                      step="1"
                      className="admin-modal-input with-prefix"
                      placeholder="e.g. 1499"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-stock">
                    Available Stock Quantity
                  </label>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    className="admin-modal-input"
                    placeholder="e.g. 25"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Stock Availability Status</label>
                  <div
                    className={`stock-toggle-box ${inStock ? 'is-active' : ''}`}
                    onClick={() => setInStock(!inStock)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setInStock(!inStock)}
                  >
                    <div className="stock-toggle-content">
                      <strong>{inStock ? 'In Stock & Ready' : 'Marked Out of Stock'}</strong>
                      <span>{inStock ? 'Customers can add to cart immediately' : 'Cart button disabled on store'}</span>
                    </div>
                    <div className={`modal-switch ${inStock ? 'on' : ''}`}>
                      <div className="modal-switch-handle" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Spotlight Feature: Trending Product ── */}
              <div className={`trending-spotlight-card ${isTrending ? 'active-trending' : ''}`}>
                <div className="trending-card-inner">
                  <div className="trending-icon-bubble">
                    <Flame size={24} />
                  </div>
                  <div className="trending-card-content">
                    <div className="trending-header-title">
                      <h4>Feature in Homepage "Trending Now" Section</h4>
                      <span className="trending-badge-tag">{isTrending ? 'FEATURED' : 'STANDARD'}</span>
                    </div>
                    <p className="trending-desc">
                      Spotlight this product directly on the storefront homepage in the curated <strong>Trending Now</strong> showcase.
                      Turn this on for high-demand items, festive specials, and bestsellers.
                    </p>
                  </div>
                  <div
                    className={`modal-switch large ${isTrending ? 'on' : ''}`}
                    onClick={() => setIsTrending(!isTrending)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setIsTrending(!isTrending)}
                    aria-label="Toggle Trending"
                  >
                    <div className="modal-switch-handle" />
                  </div>
                </div>
              </div>
            </div>

            {/* ════════ SECTION 3: PHOTOS & MEDIA ════════ */}
            <div id="sec-media" className="admin-pane-card">
              <div className="card-section-header">
                <div className="section-title-wrap">
                  <ImageIcon size={16} className="text-gold" />
                  <h4>Photos &amp; Media Gallery ({images.length} images)</h4>
                </div>
                <span className="card-hint">First image is the primary cover photo shown on cards</span>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                className={`admin-modal-upload-zone ${isDragOver ? 'drag-over' : ''} ${isUploadingImages ? 'uploading' : ''}`}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="upload-zone-icon">
                  <UploadCloud size={30} />
                </div>
                <div className="upload-zone-text">
                  <h5>{isUploadingImages ? 'Uploading Assets to Cloudinary...' : 'Upload High-Resolution Photos'}</h5>
                  <p>Drag and drop product photos here, or click to browse files</p>
                  <span className="upload-formats">Supported: JPG, PNG, WEBP, SVG • Instant Cloudinary CDN hosting</span>
                </div>
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

              {/* Manual URL Input Row */}
              <div className="admin-modal-url-row">
                <div className="url-input-wrap">
                  <input
                    type="url"
                    className="admin-modal-input"
                    placeholder="Or paste direct image URL (e.g. https://res.cloudinary.com/...)"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddManualUrl();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleAddManualUrl}
                >
                  <Plus size={14} /> Add URL
                </button>
              </div>

              {/* Images Thumbnails Grid */}
              {images.length > 0 ? (
                <div className="modal-gallery-grid">
                  {images.map((item, idx) => {
                    const imgUrl = typeof item === 'string' ? item : item.url;
                    const isCover = idx === 0;

                    return (
                      <div key={idx} className={`modal-gallery-card ${isCover ? 'is-cover-card' : ''}`}>
                        <div className="gallery-img-container">
                          <img src={imgUrl} alt={`Product ${idx + 1}`} loading="lazy" />
                          {isCover && (
                            <div className="cover-badge">
                              <Star size={11} fill="#ffffff" /> COVER IMAGE
                            </div>
                          )}
                          <div className="gallery-overlay-actions">
                            {!isCover && (
                              <button
                                type="button"
                                className="gallery-action-btn cover-btn"
                                onClick={() => makeCoverImage(idx)}
                                title="Make this photo the primary storefront cover"
                              >
                                <Star size={13} /> Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              className="gallery-action-btn delete-btn"
                              onClick={() => removeImage(idx)}
                              title="Delete photo permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <div className="gallery-card-footer">
                          <span className="gallery-photo-num">Photo #{idx + 1}</span>
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="gallery-view-link"
                            title="View original full-size image"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-media-state">
                  <ImageIcon size={32} />
                  <p>No photos attached yet. Please upload at least 1 photo for this product.</p>
                </div>
              )}
            </div>

            {/* ════════ SECTION 4: VARIANTS & OPTIONS ════════ */}
            <div id="sec-variants" className="admin-pane-card">
              <div className="card-section-header">
                <div className="section-title-wrap">
                  <Layers size={16} className="text-gold" />
                  <h4>Product Variants Configuration</h4>
                </div>
                <span className="card-hint">Offer various dimensions, framing styles, and materials</span>
              </div>

              <div
                className={`variant-activation-banner ${hasVariants ? 'enabled' : ''}`}
                onClick={() => setHasVariants(!hasVariants)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setHasVariants(!hasVariants)}
              >
                <div className="banner-left">
                  <Boxes size={20} className="banner-icon" />
                  <div>
                    <strong>Enable Multi-Variant Purchasing</strong>
                    <p>Allows buyers to choose specific size dimensions, materials, or framing tiers with custom pricing</p>
                  </div>
                </div>
                <div className={`modal-switch ${hasVariants ? 'on' : ''}`}>
                  <div className="modal-switch-handle" />
                </div>
              </div>

              {hasVariants && (
                <div className="variants-editor-content">
                  {/* Presets Row */}
                  <div className="variant-presets-row">
                    <span className="preset-label">Quick Add Common Dimensions:</span>
                    <div className="preset-chips">
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => addPresetVariant('12x18 in / Matte Paper', '12x18 in', 'Matte Paper')}
                      >
                        + 12x18 in Paper
                      </button>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => addPresetVariant('18x24 in / Rolled Canvas', '18x24 in', 'Canvas')}
                      >
                        + 18x24 in Canvas
                      </button>
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => addPresetVariant('24x36 in / Teak Framed', '24x36 in', 'Teak Wood')}
                      >
                        + 24x36 in Framed
                      </button>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="variants-table-wrap">
                    <table className="admin-modal-variants-table">
                      <thead>
                        <tr>
                          <th style={{ width: '30%' }}>Variant Label *</th>
                          <th style={{ width: '18%' }}>Size / Dimension</th>
                          <th style={{ width: '18%' }}>Material / Frame</th>
                          <th style={{ width: '15%' }}>Price (₹) *</th>
                          <th style={{ width: '12%' }}>Stock</th>
                          <th style={{ width: '7%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, i) => (
                          <tr key={i}>
                            <td>
                              <input
                                type="text"
                                className="admin-modal-table-input"
                                placeholder="e.g. 18x24 in Framed"
                                value={v.name}
                                onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="admin-modal-table-input"
                                placeholder="18x24 in"
                                value={v.size}
                                onChange={(e) => updateVariantRow(i, 'size', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="admin-modal-table-input"
                                placeholder="Canvas"
                                value={v.material}
                                onChange={(e) => updateVariantRow(i, 'material', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="admin-modal-table-input"
                                placeholder={basePrice || '0'}
                                value={v.price}
                                onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="admin-modal-table-input"
                                placeholder="10"
                                value={v.stock}
                                onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="variant-row-delete-btn"
                                onClick={() => removeVariantRow(i)}
                                title="Delete this variant row"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="add-variant-action-row">
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={addVariantRow}
                    >
                      <Plus size={14} /> Add Custom Variant Row
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── Sticky Luxury Footer ── */}
        <div className="admin-modal-footer">
          <div className="admin-modal-footer-left">
            <button
              type="button"
              className="admin-modal-btn-danger"
              onClick={handleDeleteProduct}
              disabled={isDeleting || isSubmitting}
            >
              <Trash2 size={15} />
              <span>{isDeleting ? 'Deleting...' : 'Delete Product from Store'}</span>
            </button>
          </div>

          <div className="admin-modal-footer-right">
            <button
              type="button"
              className="admin-modal-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="admin-edit-form"
              className="admin-modal-btn-save"
              disabled={isSubmitting || isDeleting || isUploadingImages}
              title="Save Product Changes (Ctrl+S)"
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Product Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
