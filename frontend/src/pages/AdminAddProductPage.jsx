import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './AdminAddProductPage.css';

const PRESET_BADGES = ['Bestseller', 'New Launch', 'Devotional', 'Handcrafted', 'Sale', 'Trending'];

export default function AdminAddProductPage({ onNavigateHome, onProductCreated }) {
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [inStock, setInStock] = useState(true);
  const [dispatchTimeInfo, setDispatchTimeInfo] = useState('Ready to Dispatch within 24-48 Hours');
  const [badges, setBadges] = useState(['Devotional']);
  const [customBadge, setCustomBadge] = useState('');

  // Images state
  const [images, setImages] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
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
      stock: '10'
    }
  ]);

  // Categories list from API
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [createdProduct, setCreatedProduct] = useState(null);

  // Fetch real categories from database
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const res = await api.get('/categories');
        const list = res.data?.categories || [];
        if (isMounted) {
          // Flatten categories and subcategories for the dropdown
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

  // Handle Badge toggle
  const toggleBadge = (b) => {
    if (badges.includes(b)) {
      setBadges(badges.filter((item) => item !== b));
    } else {
      setBadges([...badges, b]);
    }
  };

  const addCustomBadge = () => {
    if (customBadge.trim() && !badges.includes(customBadge.trim())) {
      setBadges([...badges, customBadge.trim()]);
      setCustomBadge('');
    }
  };

  // Handle File Upload to Cloudinary
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      setErrorMessage(null);
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await api.post('/media/upload-multiple', formData);
      const newAssets = (res.data?.assets || []).map((a) => ({
        url: a.url,
        publicId: a.publicId
      }));
      setImages((prev) => [...prev, ...newAssets]);
    } catch (err) {
      setErrorMessage(
        err.data?.message || err.message || 'Image upload to Cloudinary failed. You can also paste an image URL directly.'
      );
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Manual Image URL
  const handleAddManualUrl = () => {
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

  // Remove and delete asset from Cloudinary
  const removeImage = async (index) => {
    const target = images[index];
    if (!target) return;

    const url = typeof target === 'string' ? target : target.url;
    const publicId = typeof target === 'string' ? null : target.publicId;

    // Remove immediately from UI state
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Destroy asset in Cloudinary if uploaded
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

  // Variant Rows Management
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

  const updateVariantRow = (index, field, value) => {
    const copy = [...variants];
    copy[index][field] = value;
    setVariants(copy);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }
    if (!category) {
      setErrorMessage('Please select a category.');
      return;
    }
    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      setErrorMessage('Please specify a valid base price.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Product description is required.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('At least one product photo is required. Please upload or paste an image URL.');
      return;
    }

    // Prepare payload matching Mongoose Product model contract
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
      dispatchTimeInfo: dispatchTimeInfo.trim(),
      badges,
      images: finalImageUrls,
      hasVariants: Boolean(hasVariants && formattedVariants.length > 0),
      variants: formattedVariants
    };

    try {
      setIsSubmitting(true);
      const res = await api.post('/products', payload);
      const newProduct = res.data?.product;
      setCreatedProduct(newProduct);
      if (onProductCreated && newProduct) {
        onProductCreated(newProduct);
      }
    } catch (err) {
      const detailed = err.data?.errors?.length
        ? err.data.errors.map((e) => e.message).join('. ')
        : (err.data?.message || err.message || 'Failed to create product.');
      setErrorMessage(detailed);
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
    setBadges(['Devotional']);
    setImages([]);
    setHasVariants(false);
    setVariants([]);
    setCreatedProduct(null);
    setErrorMessage(null);
  };

  return (
    <div className="admin-product-page">
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div className="admin-header-left">
          <h1>
            Add New Product
            <span className="admin-badge-label">ADMIN CONSOLE</span>
          </h1>
          <p className="admin-header-subtitle">
            Publish authentic artwork, frames, and decor items directly to the live catalog.
          </p>
        </div>
        <button type="button" className="admin-back-link" onClick={onNavigateHome}>
          ← Return to Storefront
        </button>
      </div>

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className="admin-alert-error" role="alert">
          ⚠️ <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* ── Success Banner ── */}
      {createdProduct ? (
        <div className="admin-alert-success">
          <h3>🎉 Product Published Successfully!</h3>
          <p>
            <strong>"{createdProduct.name}"</strong> has been saved to MongoDB Atlas and is now live on the storefront.
          </p>
          <div className="admin-success-actions">
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => {
                if (onProductCreated) onProductCreated(createdProduct);
              }}
            >
              👁️ View Product on Storefront
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleResetForm}
            >
              ➕ Add Another Product
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* ── Card 1: Core Product Information ── */}
          <div className="admin-card">
            <h2 className="admin-card-title">📦 General Information</h2>

            <div className="admin-form-grid">
              <div className="admin-form-group full-width">
                <label htmlFor="prod-name">
                  Product Title <span className="required">*</span>
                </label>
                <input
                  id="prod-name"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Lord Shiva Meditating Backlit LED Frame"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="prod-category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="prod-category"
                  className="admin-select"
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
                <span className="admin-field-hint">Defines catalog filtering and PDP breadcrumbs</span>
              </div>

              <div className="admin-form-group">
                <label htmlFor="prod-dispatch">Dispatch Timeline</label>
                <input
                  id="prod-dispatch"
                  type="text"
                  className="admin-input"
                  placeholder="Ready to Dispatch within 24-48 Hours"
                  value={dispatchTimeInfo}
                  onChange={(e) => setDispatchTimeInfo(e.target.value)}
                />
              </div>

              <div className="admin-form-group full-width">
                <label htmlFor="prod-desc">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="prod-desc"
                  className="admin-textarea"
                  placeholder="Detailed description of craftsmanship, materials, dimensions, and care instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group full-width">
                <label>Badges &amp; Tags</label>
                <div className="admin-badges-list">
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`admin-badge-chip ${badges.includes(b) ? 'selected' : ''}`}
                      onClick={() => toggleBadge(b)}
                    >
                      {badges.includes(b) ? '✓ ' : '+ '} {b}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="text"
                    className="admin-input"
                    style={{ maxWidth: '240px' }}
                    placeholder="Custom badge (e.g. Rare)"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomBadge();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={addCustomBadge}
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Pricing & Inventory ── */}
          <div className="admin-card">
            <h2 className="admin-card-title">💰 Pricing &amp; Inventory</h2>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="prod-price">
                  Selling Price (₹) <span className="required">*</span>
                </label>
                <input
                  id="prod-price"
                  type="number"
                  min="0"
                  step="1"
                  className="admin-input"
                  placeholder="1499"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="prod-mrp">Original MRP (₹)</label>
                <input
                  id="prod-mrp"
                  type="number"
                  min="0"
                  step="1"
                  className="admin-input"
                  placeholder="2499 (Displays strikethrough)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="prod-stock">Stock Quantity</label>
                <input
                  id="prod-stock"
                  type="number"
                  min="0"
                  className="admin-input"
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <div className="admin-form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                  <span>Mark as In Stock immediately</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Card 3: Media & Gallery (Cloudinary) ── */}
          <div className="admin-card">
            <h2 className="admin-card-title">🖼️ Product Media &amp; Gallery</h2>
            <p className="admin-field-hint" style={{ marginBottom: '14px' }}>
              Upload high-resolution images to Cloudinary, or enter direct image URLs. The first image serves as the main catalog cover.
            </p>

            {/* Drag & Drop Upload Zone */}
            <div
              className="admin-upload-zone"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <div className="admin-upload-icon">☁️</div>
              <div className="admin-upload-prompt">
                {isUploadingImages ? 'Uploading to Cloudinary...' : 'Click or drop files to upload'}
              </div>
              <div className="admin-upload-subtext">Supports PNG, JPG, WEBP up to 10MB each</div>
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

            {/* Manual URL input fallback */}
            <div className="admin-url-row">
              <input
                type="url"
                className="admin-input"
                placeholder="Or paste direct image URL (https://...)"
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

            {/* Thumbnails preview */}
            {images.length > 0 && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Gallery Images ({images.length})</label>
                <div className="admin-thumbnails-grid">
                  {images.map((item, idx) => {
                    const imgUrl = typeof item === 'string' ? item : item.url;
                    return (
                      <div key={idx} className="admin-thumbnail-card">
                        <img src={imgUrl} alt={`Product preview ${idx + 1}`} />
                        {idx === 0 && <span className="admin-thumb-cover-tag">COVER</span>}
                        <button
                          type="button"
                          className="admin-thumb-delete-btn"
                          onClick={() => removeImage(idx)}
                          title="Remove and delete image from Cloudinary"
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

          {/* ── Card 4: Variants Configuration (Optional) ── */}
          <div className="admin-card">
            <label className="admin-variant-toggle">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
              />
              <strong style={{ fontSize: '16px' }}>This product has multiple options or sizes (Variants)</strong>
            </label>

            {hasVariants && (
              <div>
                <p className="admin-field-hint">
                  Specify sizes, framing styles, and prices for customer selection on the Product Page.
                </p>

                <table className="admin-variants-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Variant Name / Label *</th>
                      <th style={{ width: '18%' }}>Size</th>
                      <th style={{ width: '18%' }}>Material</th>
                      <th style={{ width: '16%' }}>Price (₹) *</th>
                      <th style={{ width: '12%' }}>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            type="text"
                            className="admin-variant-input"
                            placeholder="e.g. 12x18 in / Wood Frame"
                            value={v.name}
                            onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="admin-variant-input"
                            placeholder="12x18 in"
                            value={v.size}
                            onChange={(e) => updateVariantRow(i, 'size', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="admin-variant-input"
                            placeholder="Canvas / Frame"
                            value={v.material}
                            onChange={(e) => updateVariantRow(i, 'material', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="admin-variant-input"
                            placeholder={basePrice || '1499'}
                            value={v.price}
                            onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="admin-variant-input"
                            placeholder="10"
                            value={v.stock}
                            onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="admin-variant-del-btn"
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

          {/* ── Form Actions ── */}
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onNavigateHome}
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
      )}
    </div>
  );
}
