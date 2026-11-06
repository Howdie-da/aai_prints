import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './AdminEditProductModal.css';

const PRESET_BADGES = ['Bestseller', 'New Launch', 'Devotional', 'Handcrafted', 'Sale', 'Trending'];

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

  // Upload to Cloudinary
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
        err.data?.message || err.message || 'Image upload failed. You can also paste an image URL directly.'
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
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL');
      return;
    }
    const match = trimmed.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    const publicId = match ? match[1] : null;
    setImages((prev) => [...prev, { url: trimmed, publicId }]);
    setManualImageUrl('');
    setErrorMessage(null);
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

  // Variants
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

  // Save Updates
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product title is required.');
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

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-header-left">
            <h2 id="modal-edit-title" className="admin-modal-title">
              Edit Product
            </h2>
            <span className="admin-modal-badge">ADMIN MODE</span>
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          {errorMessage && (
            <div className="admin-alert-error" role="alert" style={{ marginBottom: '16px' }}>
              ⚠️ <strong>Error:</strong> {errorMessage}
            </div>
          )}

          <form id="admin-edit-form" onSubmit={handleSaveSubmit}>
            {/* General Info */}
            <div className="admin-modal-section">
              <h3 className="admin-modal-section-title">📦 General Information</h3>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label htmlFor="edit-name">
                    Product Title <span className="required">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    className="admin-input"
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
                    className="admin-select"
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
                  <label htmlFor="edit-dispatch">Dispatch Timeline</label>
                  <input
                    id="edit-dispatch"
                    type="text"
                    className="admin-input"
                    value={dispatchTimeInfo}
                    onChange={(e) => setDispatchTimeInfo(e.target.value)}
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label htmlFor="edit-desc">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="edit-desc"
                    className="admin-textarea"
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ maxWidth: '220px' }}
                      placeholder="Custom tag"
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

            {/* Pricing & Stock */}
            <div className="admin-modal-section">
              <h3 className="admin-modal-section-title">💰 Pricing &amp; Inventory</h3>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="edit-price">
                    Selling Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="1"
                    className="admin-input"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-mrp">Original MRP (₹)</label>
                  <input
                    id="edit-mrp"
                    type="number"
                    min="0"
                    step="1"
                    className="admin-input"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-stock">Stock Quantity</label>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    className="admin-input"
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

            {/* Media & Gallery */}
            <div className="admin-modal-section">
              <h3 className="admin-modal-section-title">🖼️ Photos &amp; Media</h3>
              <p className="admin-field-hint" style={{ marginBottom: '12px' }}>
                Upload photos to Cloudinary or paste URLs. Clicking ✕ removes the image and permanently deletes it from Cloudinary.
              </p>

              <div
                className="admin-upload-zone"
                style={{ padding: '18px' }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div className="admin-upload-icon" style={{ fontSize: '24px' }}>☁️</div>
                <div className="admin-upload-prompt">
                  {isUploadingImages ? 'Uploading to Cloudinary...' : 'Upload new photos'}
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

              <div className="admin-url-row">
                <input
                  type="url"
                  className="admin-input"
                  placeholder="Paste direct image URL"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleAddManualUrl}
                >
                  Add URL
                </button>
              </div>

              {images.length > 0 && (
                <div className="admin-thumbnails-grid">
                  {images.map((item, idx) => {
                    const imgUrl = typeof item === 'string' ? item : item.url;
                    return (
                      <div key={idx} className="admin-thumbnail-card">
                        <img src={imgUrl} alt={`Product ${idx + 1}`} />
                        {idx === 0 && <span className="admin-thumb-cover-tag">COVER</span>}
                        <button
                          type="button"
                          className="admin-thumb-delete-btn"
                          onClick={() => removeImage(idx)}
                          title="Delete photo from Cloudinary"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="admin-modal-section">
              <label className="admin-variant-toggle">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                />
                <strong>Configure Variants (Sizes / Materials / Framing)</strong>
              </label>

              {hasVariants && (
                <div>
                  <table className="admin-variants-table">
                    <thead>
                      <tr>
                        <th>Variant Name *</th>
                        <th>Size</th>
                        <th>Material</th>
                        <th>Price (₹) *</th>
                        <th>Stock</th>
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
                              value={v.name}
                              onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-variant-input"
                              value={v.size}
                              onChange={(e) => updateVariantRow(i, 'size', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-variant-input"
                              value={v.material}
                              onChange={(e) => updateVariantRow(i, 'material', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="admin-variant-input"
                              value={v.price}
                              onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="admin-variant-input"
                              value={v.stock}
                              onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-variant-del-btn"
                              onClick={() => removeVariantRow(i)}
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
                    style={{ marginTop: '12px' }}
                    onClick={addVariantRow}
                  >
                    + Add Variant Row
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn-danger"
            onClick={handleDeleteProduct}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? 'Deleting from Database...' : '🗑️ Delete Product from Database'}
          </button>

          <div className="admin-modal-footer-right">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="admin-edit-form"
              className="admin-btn-primary"
              disabled={isSubmitting || isDeleting || isUploadingImages}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Product Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
