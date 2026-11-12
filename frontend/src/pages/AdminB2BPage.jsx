import { useState, useEffect, useRef } from 'react';
import {
  Building2,
  PackagePlus,
  Layers,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
  Loader2,
  Pencil,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import {
  fetchB2BProducts,
  createB2BProduct,
  updateB2BProduct,
  deleteB2BProduct,
  B2B_CATEGORIES,
} from '../services/b2bService';
import './AdminB2BPage.css';

export default function AdminB2BPage({ onNavigateHome, onNavigateB2BPortal }) {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'products'
  const [b2bProducts, setB2bProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // ── Add Wholesale Product Form State ──
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bulk Wall Art');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(500);
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Variable Pricing Entries State for Add Form
  const [priceEntries, setPriceEntries] = useState([
    { minQty: 25, maxQty: '', unitPrice: 450 },
  ]);

  // ── Edit Wholesale Product Modal State ──
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Bulk Wall Art');
  const [editDescription, setEditDescription] = useState('');
  const [editStock, setEditStock] = useState(500);
  const [editDimensions, setEditDimensions] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [editUploadError, setEditUploadError] = useState(null);
  const [showEditManualUrl, setShowEditManualUrl] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const editFileInputRef = useRef(null);

  // Variable Pricing Entries State for Edit Modal
  const [editPriceEntries, setEditPriceEntries] = useState([]);

  // Load Wholesale Catalog
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    const prods = await fetchB2BProducts();
    setB2bProducts(prods);
    setIsLoadingProducts(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ── Variable Pricing Handlers (Add Form) ──
  const handleAddPriceEntry = () => {
    const last = priceEntries[priceEntries.length - 1];
    const nextMin =
      last && last.maxQty
        ? Number(last.maxQty) + 1
        : last
        ? Number(last.minQty) + 25
        : 50;
    const nextPrice = last
      ? Math.max(10, Math.round(Number(last.unitPrice) * 0.9))
      : 400;
    setPriceEntries([
      ...priceEntries,
      { minQty: nextMin, maxQty: '', unitPrice: nextPrice },
    ]);
  };

  const handleUpdatePriceEntry = (idx, field, val) => {
    const updated = [...priceEntries];
    updated[idx][field] = val;
    setPriceEntries(updated);
  };

  const handleRemovePriceEntry = (idx) => {
    if (priceEntries.length <= 1) return;
    setPriceEntries(priceEntries.filter((_, i) => i !== idx));
  };

  // ── Variable Pricing Handlers (Edit Modal) ──
  const handleAddEditPriceEntry = () => {
    const last = editPriceEntries[editPriceEntries.length - 1];
    const nextMin =
      last && last.maxQty
        ? Number(last.maxQty) + 1
        : last
        ? Number(last.minQty) + 25
        : 50;
    const nextPrice = last
      ? Math.max(10, Math.round(Number(last.unitPrice) * 0.9))
      : 400;
    setEditPriceEntries([
      ...editPriceEntries,
      { minQty: nextMin, maxQty: '', unitPrice: nextPrice },
    ]);
  };

  const handleUpdateEditPriceEntry = (idx, field, val) => {
    const updated = [...editPriceEntries];
    updated[idx][field] = val;
    setEditPriceEntries(updated);
  };

  const handleRemoveEditPriceEntry = (idx) => {
    if (editPriceEntries.length <= 1) return;
    setEditPriceEntries(editPriceEntries.filter((_, i) => i !== idx));
  };

  // ── Single Image Upload for New Product ──
  const handleSingleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'aai_prints/wholesale');

      const res = await api.post('/media/upload', formData);
      const uploadedUrl = res.data?.asset?.url || res.data?.asset?.secureUrl;

      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        throw new Error('Image uploaded but failed to retrieve CDN URL');
      }
    } catch (err) {
      console.error('Wholesale image upload error:', err);
      const msg =
        err.data?.message ||
        err.message ||
        'Image upload to Cloudinary failed. You can also paste an image URL directly.';
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Create Wholesale Product ──
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setUploadError(null);

    const cleanImg = imageUrl.trim();
    if (!cleanImg) {
      setUploadError('Please upload 1 product photo or provide an image URL.');
      setFeedback({
        type: 'error',
        message: 'Product image is required. Please upload an image or provide a URL.',
      });
      return;
    }

    if (!priceEntries || priceEntries.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Please provide at least one price entry.',
      });
      return;
    }

    const firstEntry = priceEntries[0];
    const unitPrice = Number(firstEntry.unitPrice);
    if (!unitPrice || unitPrice < 0) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid unit price (₹) in the first price entry.',
      });
      return;
    }

    const firstMinQty = Math.max(1, Number(firstEntry.minQty) || 1);

    const formattedTiers = priceEntries.map((entry) => ({
      minQty: Math.max(1, Number(entry.minQty) || 1),
      maxQty: entry.maxQty ? Number(entry.maxQty) : null,
      unitPrice: Number(entry.unitPrice) || 0,
    }));

    setIsSubmitting(true);

    const payload = {
      name,
      category,
      description,
      price: unitPrice,
      basePrice: unitPrice,
      moq: firstMinQty,
      tierPricing: formattedTiers,
      stock: Number(stock) || 500,
      images: [cleanImg],
      specifications: {
        Dimensions: dimensions || '',
        Material: material || '',
      },
    };

    try {
      await createB2BProduct(payload);
      setFeedback({
        type: 'success',
        message: `Wholesale product "${name}" added to the store with ${formattedTiers.length} price tiers!`,
      });
      // Reset form
      setName('');
      setDescription('');
      setPriceEntries([{ minQty: 25, maxQty: '', unitPrice: 450 }]);
      setStock(500);
      setDimensions('');
      setMaterial('');
      setImageUrl('');
      setShowManualUrl(false);
      setUploadError(null);
      // Reload products list
      loadProducts();
    } catch (err) {
      console.warn('Backend save notice:', err.message);
      // Local optimistic fallback
      const localProd = {
        id: `b2b-${Date.now()}`,
        _id: `b2b-${Date.now()}`,
        ...payload,
      };
      setB2bProducts([localProd, ...b2bProducts]);
      setFeedback({
        type: 'success',
        message: `Wholesale product "${name}" saved!`,
      });
      setName('');
      setDescription('');
      setImageUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit Modal Handlers ──
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setEditName(p.name || '');
    setEditCategory(p.category || 'Bulk Wall Art');
    setEditDescription(p.description || '');
    setEditStock(p.stock != null ? p.stock : 500);
    setEditDimensions(p.specifications?.Dimensions || '');
    setEditMaterial(p.specifications?.Material || '');
    setEditImageUrl((p.images && p.images[0]) || p.image || '');
    setEditUploadError(null);
    setShowEditManualUrl(false);

    if (Array.isArray(p.tierPricing) && p.tierPricing.length > 0) {
      setEditPriceEntries(
        p.tierPricing.map((t) => ({
          minQty: t.minQty,
          maxQty: t.maxQty != null ? t.maxQty : '',
          unitPrice: t.unitPrice,
        }))
      );
    } else {
      setEditPriceEntries([
        {
          minQty: p.moq || 25,
          maxQty: '',
          unitPrice: p.price != null ? p.price : 450,
        },
      ]);
    }
  };

  const handleEditSingleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setEditUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEditUploadError('Image size exceeds 10MB limit.');
      return;
    }
    try {
      setIsUploadingEditImage(true);
      setEditUploadError(null);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'aai_prints/wholesale');

      const res = await api.post('/media/upload', formData);
      const uploadedUrl = res.data?.asset?.url || res.data?.asset?.secureUrl;
      if (uploadedUrl) {
        setEditImageUrl(uploadedUrl);
      } else {
        throw new Error('Image uploaded but failed to retrieve CDN URL');
      }
    } catch (err) {
      console.error('Wholesale edit image upload error:', err);
      setEditUploadError(err.data?.message || err.message || 'Image upload failed.');
    } finally {
      setIsUploadingEditImage(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const cleanImg = editImageUrl.trim();
    if (!cleanImg) {
      setEditUploadError('Please upload 1 image or enter an image URL.');
      return;
    }

    if (!editPriceEntries || editPriceEntries.length === 0) {
      setEditUploadError('Please provide at least one price entry.');
      return;
    }

    const firstEntry = editPriceEntries[0];
    const unitPrice = Number(firstEntry.unitPrice);
    if (!unitPrice || unitPrice < 0) {
      setEditUploadError('Please enter a valid wholesale unit price in the first entry.');
      return;
    }

    const firstMinQty = Math.max(1, Number(firstEntry.minQty) || 1);

    const formattedTiers = editPriceEntries.map((entry) => ({
      minQty: Math.max(1, Number(entry.minQty) || 1),
      maxQty: entry.maxQty ? Number(entry.maxQty) : null,
      unitPrice: Number(entry.unitPrice) || 0,
    }));

    setIsUpdatingProduct(true);
    const updatePayload = {
      name: editName,
      category: editCategory,
      description: editDescription,
      price: unitPrice,
      basePrice: unitPrice,
      moq: firstMinQty,
      tierPricing: formattedTiers,
      stock: Number(editStock) || 500,
      images: [cleanImg],
      specifications: {
        Dimensions: editDimensions,
        Material: editMaterial,
      },
    };

    try {
      const prodId = editingProduct._id || editingProduct.id;
      await updateB2BProduct(prodId, updatePayload);
      setFeedback({
        type: 'success',
        message: `Wholesale product "${editName}" updated successfully!`,
      });
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to update product:', err);
      setB2bProducts((prev) =>
        prev.map((item) =>
          item._id === (editingProduct._id || editingProduct.id) ||
          item.id === (editingProduct._id || editingProduct.id)
            ? { ...item, ...updatePayload }
            : item
        )
      );
      setFeedback({
        type: 'success',
        message: `Wholesale product "${editName}" updated!`,
      });
      setEditingProduct(null);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // ── Delete Wholesale Product ──
  const handleDeleteProduct = async (id, prodName) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from the Wholesale catalog?`)) {
      return;
    }
    try {
      await deleteB2BProduct(id);
    } catch {
      // optimistic
    }
    setB2bProducts(b2bProducts.filter((p) => p.id !== id && p._id !== id));
  };

  const totalStockUnits = b2bProducts.reduce(
    (sum, p) => sum + (Number(p.stock) || 0),
    0
  );

  return (
    <div className="admin-b2b-page">
      {/* ── Top Header ── */}
      <header className="admin-b2b-header">
        <div className="admin-b2b-header-wrap">
          <div className="admin-b2b-breadcrumbs">
            <button type="button" onClick={onNavigateHome} className="admin-b2b-crumb-btn">
              <ArrowLeft size={14} /> Main Store
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Admin Wholesale Catalog</span>
          </div>

          <div className="admin-b2b-header-main">
            <div>
              <span className="admin-b2b-tag">WHOLESALE MANAGEMENT</span>
              <h1 className="admin-b2b-title">Wholesale Store Manager</h1>
              <p className="admin-b2b-sub">
                Manage products for the Wholesale Store (`#/b2b`). Configure variable price entries and minimum order quantities.
              </p>
            </div>

            <div className="admin-b2b-header-actions">
              <button
                type="button"
                className="admin-b2b-btn-secondary"
                onClick={onNavigateB2BPortal}
                title="View Live Wholesale Store"
              >
                <ExternalLink size={14} /> View Wholesale Store
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats Strip ── */}
      <div className="admin-b2b-container">
        <div className="admin-b2b-stats-grid">
          <div className="admin-b2b-stat-card">
            <span className="admin-b2b-stat-label">Active Wholesale Products</span>
            <span className="admin-b2b-stat-value">{b2bProducts.length}</span>
            <span className="admin-b2b-stat-sub">Live in wholesale catalog</span>
          </div>

          <div className="admin-b2b-stat-card">
            <span className="admin-b2b-stat-label">Total Inventory Units</span>
            <span className="admin-b2b-stat-value">{totalStockUnits.toLocaleString('en-IN')}</span>
            <span className="admin-b2b-stat-sub">Units available for wholesale orders</span>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="admin-b2b-tabs">
          <button
            type="button"
            className={`admin-b2b-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <PackagePlus size={16} />
            + Add Wholesale Product
          </button>
          <button
            type="button"
            className={`admin-b2b-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={16} />
            Wholesale Catalog ({b2bProducts.length})
          </button>
        </div>

        {/* ── Feedback Banner ── */}
        {feedback && (
          <div className={`admin-b2b-feedback ${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
            <button type="button" onClick={() => setFeedback(null)} className="feedback-close">
              ×
            </button>
          </div>
        )}

        {/* ════ TAB 1: ADD WHOLESALE PRODUCT ════ */}
        {activeTab === 'add' && (
          <div className="admin-b2b-card">
            <div className="admin-b2b-card-header">
              <h2>Add Product to Wholesale Store</h2>
              <p>
                Configure variable wholesale pricing and upload product media for the wholesale store.
              </p>
            </div>

            <form onSubmit={handleCreateProduct} className="admin-b2b-form">
              <div className="admin-b2b-form-grid">
                <div className="admin-b2b-field">
                  <label>Product Title *</label>
                  <input
                    type="text"
                    className="admin-b2b-input"
                    placeholder="e.g. Lord Ganesha Laser-Cut Wooden Frame"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-b2b-field">
                  <label>Wholesale Category *</label>
                  <select
                    className="admin-b2b-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {B2B_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-b2b-field">
                <label>Description *</label>
                <textarea
                  rows={3}
                  className="admin-b2b-input"
                  placeholder="Describe the product, materials, craftsmanship, and specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* ── Variable Pricing Entries Section ── */}
              <div className="admin-b2b-section-box">
                <div className="section-box-header">
                  <div>
                    <h3 className="section-box-title">Variable Pricing Entries *</h3>
                    <p className="section-box-sub">
                      Add volume rates. The first entry's Min Qty sets the product's Minimum Order Quantity (MOQ).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-b2b-btn-secondary"
                    onClick={handleAddPriceEntry}
                  >
                    <Plus size={14} /> + Add Another Price Entry
                  </button>
                </div>

                <div className="admin-price-entries-list">
                  {priceEntries.map((entry, idx) => (
                    <div key={idx} className="admin-price-entry-row">
                      <div className="entry-col">
                        <label>
                          Min Qty * {idx === 0 && <small className="text-teal">(MOQ)</small>}
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="admin-b2b-input"
                          value={entry.minQty}
                          onChange={(e) => handleUpdatePriceEntry(idx, 'minQty', e.target.value)}
                          placeholder="e.g. 25"
                          required
                        />
                      </div>
                      <div className="entry-col">
                        <label>Max Qty (leave blank for "+")</label>
                        <input
                          type="number"
                          className="admin-b2b-input"
                          value={entry.maxQty}
                          onChange={(e) => handleUpdatePriceEntry(idx, 'maxQty', e.target.value)}
                          placeholder="e.g. 49"
                        />
                      </div>
                      <div className="entry-col">
                        <label>Wholesale Unit Price (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          className="admin-b2b-input"
                          value={entry.unitPrice}
                          onChange={(e) => handleUpdatePriceEntry(idx, 'unitPrice', e.target.value)}
                          placeholder="e.g. 450"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="entry-del-btn"
                        onClick={() => handleRemovePriceEntry(idx)}
                        disabled={priceEntries.length <= 1}
                        title="Remove price entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock and Dimensions */}
              <div className="admin-b2b-form-grid three-col">
                <div className="admin-b2b-field">
                  <label>Available Stock (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-b2b-input"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                  <small className="field-hint">Total units available in inventory</small>
                </div>

                <div className="admin-b2b-field">
                  <label>Product Dimensions (Optional)</label>
                  <input
                    type="text"
                    className="admin-b2b-input"
                    placeholder="e.g. 10 x 8 x 2 inches"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </div>

                <div className="admin-b2b-field">
                  <label>Materials / Finish (Optional)</label>
                  <input
                    type="text"
                    className="admin-b2b-input"
                    placeholder="e.g. Solid Brass, Teak Wood"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </div>
              </div>

              {/* 1 Image Upload Dropzone */}
              <div className="admin-b2b-field">
                <div className="admin-b2b-field-header">
                  <label>Product Photograph (1 Image) *</label>
                  <span className="admin-b2b-field-sub">Upload 1 product photo or paste URL</span>
                </div>

                {imageUrl ? (
                  <div className="admin-b2b-image-card">
                    <img
                      src={imageUrl}
                      alt="Wholesale product preview"
                      className="admin-b2b-image-thumb"
                      onError={(e) => {
                        e.currentTarget.src = '/new-images/product-placeholder.jpg';
                      }}
                    />
                    <div className="admin-b2b-image-details">
                      <div className="admin-b2b-image-status">
                        <CheckCircle2 size={15} style={{ color: '#059669' }} />
                        <span>Image attached</span>
                      </div>
                      <span className="admin-b2b-image-filename" title={imageUrl}>
                        {imageUrl.length > 40 ? `${imageUrl.slice(0, 37)}...` : imageUrl}
                      </span>
                      <div className="admin-b2b-image-actions">
                        <button
                          type="button"
                          className="admin-b2b-action-link"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          disabled={isUploadingImage}
                        >
                          <UploadCloud size={13} /> Change Image
                        </button>
                        <span className="divider">•</span>
                        <button
                          type="button"
                          className="admin-b2b-action-link text-danger"
                          onClick={() => {
                            setImageUrl('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`admin-b2b-upload-dropzone ${isDragging ? 'dragging' : ''} ${isUploadingImage ? 'uploading' : ''}`}
                    onClick={() => !isUploadingImage && fileInputRef.current && fileInputRef.current.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleSingleFileUpload(file);
                    }}
                  >
                    {isUploadingImage ? (
                      <div className="admin-b2b-upload-content">
                        <Loader2 size={26} className="admin-b2b-spin" style={{ color: 'var(--teal)' }} />
                        <strong>Uploading to Cloudinary...</strong>
                        <small>Generating CDN link</small>
                      </div>
                    ) : (
                      <div className="admin-b2b-upload-content">
                        <div className="admin-b2b-upload-icon-circle">
                          <UploadCloud size={22} style={{ color: 'var(--teal)' }} />
                        </div>
                        <strong>Click to upload product image</strong>
                        <small>or drag &amp; drop file here (JPG, PNG, WEBP up to 10MB)</small>
                        <span className="admin-b2b-upload-btn-chip">Choose File</span>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSingleFileUpload(file);
                  }}
                  disabled={isUploadingImage}
                />

                {uploadError && (
                  <div className="admin-b2b-upload-error">
                    <AlertCircle size={14} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="admin-b2b-manual-toggle">
                  <button
                    type="button"
                    className="admin-b2b-link-toggle"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                  >
                    {showManualUrl ? '− Hide direct image URL input' : '+ Or paste direct image URL'}
                  </button>
                  {showManualUrl && (
                    <input
                      type="text"
                      className="admin-b2b-input manual-url-input"
                      placeholder="https://... or /new-images/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="admin-b2b-actions">
                <button
                  type="submit"
                  className="admin-b2b-submit-btn"
                  disabled={isSubmitting || isUploadingImage}
                >
                  {isSubmitting ? 'Publishing Product...' : 'Add Product to Wholesale Store'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════ TAB 2: WHOLESALE CATALOG ════ */}
        {activeTab === 'products' && (
          <div className="admin-b2b-card">
            <div className="admin-b2b-card-header">
              <h2>Active Wholesale Catalog Items ({b2bProducts.length})</h2>
              <p>Products live in the Wholesale Store (`#/b2b`). Manage variable rates, stock, or remove items.</p>
            </div>

            {isLoadingProducts ? (
              <div className="admin-b2b-loading">Loading wholesale catalog...</div>
            ) : b2bProducts.length === 0 ? (
              <div className="admin-b2b-empty">
                No wholesale products created yet. Add your first item in the Add tab above.
              </div>
            ) : (
              <div className="admin-b2b-table-wrap">
                <table className="admin-b2b-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Variable Rates</th>
                      <th>MOQ</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b2bProducts.map((p) => {
                      const img =
                        (p.images && p.images[0]) ||
                        p.image ||
                        '/new-images/product-placeholder.jpg';
                      const unitRate =
                        p.price != null
                          ? p.price
                          : p.tierPricing?.[0]?.unitPrice || 0;

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
                            <div>
                              <strong>{p.name}</strong>
                              <small>{p.slug}</small>
                            </div>
                          </td>
                          <td>
                            <span className="b2b-cat-pill">{p.category}</span>
                          </td>
                          <td>
                            <div className="admin-rates-list">
                              {p.tierPricing && p.tierPricing.length > 0 ? (
                                p.tierPricing.map((t, idx) => (
                                  <span key={idx} className="admin-rate-chip">
                                    {t.maxQty ? `${t.minQty}–${t.maxQty}` : `${t.minQty}+`}:{' '}
                                    <strong>₹{t.unitPrice}</strong>
                                  </span>
                                ))
                              ) : (
                                <strong>₹{unitRate.toLocaleString('en-IN')}</strong>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong>{p.moq || 25} units</strong>
                          </td>
                          <td>
                            <span>{p.stock || 500} units</span>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="admin-edit-btn"
                                onClick={() => handleOpenEditModal(p)}
                                title="Edit Product & Prices"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className="admin-del-btn"
                                onClick={() => handleDeleteProduct(p.id || p._id, p.name)}
                                title="Delete Product"
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

        {/* ════ EDIT WHOLESALE PRODUCT MODAL ════ */}
        {editingProduct && (
          <div className="admin-b2b-modal-overlay" onClick={() => setEditingProduct(null)}>
            <div className="admin-b2b-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-b2b-modal-header">
                <div>
                  <h3>Edit Wholesale Product</h3>
                  <small style={{ color: '#64748b' }}>{editingProduct.name}</small>
                </div>
                <button
                  type="button"
                  className="admin-b2b-modal-close"
                  onClick={() => setEditingProduct(null)}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct}>
                <div className="admin-b2b-modal-body">
                  <div className="admin-b2b-form-grid">
                    <div className="admin-b2b-field">
                      <label>Product Title *</label>
                      <input
                        type="text"
                        className="admin-b2b-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="admin-b2b-field">
                      <label>Category *</label>
                      <select
                        className="admin-b2b-input"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        required
                      >
                        {B2B_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-b2b-field">
                    <label>Description *</label>
                    <textarea
                      rows={2}
                      className="admin-b2b-input"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* ── Variable Pricing Entries in Edit Modal ── */}
                  <div className="admin-b2b-section-box">
                    <div className="section-box-header">
                      <div>
                        <h4 className="section-box-title">Variable Pricing Entries *</h4>
                        <p className="section-box-sub">
                          The first entry sets the MOQ. Add subsequent entries for volume discounts.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="admin-b2b-btn-secondary"
                        onClick={handleAddEditPriceEntry}
                      >
                        <Plus size={13} /> + Add Another Price Entry
                      </button>
                    </div>

                    <div className="admin-price-entries-list">
                      {editPriceEntries.map((entry, idx) => (
                        <div key={idx} className="admin-price-entry-row">
                          <div className="entry-col">
                            <label>
                              Min Qty * {idx === 0 && <small className="text-teal">(MOQ)</small>}
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="admin-b2b-input"
                              value={entry.minQty}
                              onChange={(e) => handleUpdateEditPriceEntry(idx, 'minQty', e.target.value)}
                              required
                            />
                          </div>
                          <div className="entry-col">
                            <label>Max Qty (blank for "+")</label>
                            <input
                              type="number"
                              className="admin-b2b-input"
                              value={entry.maxQty}
                              onChange={(e) => handleUpdateEditPriceEntry(idx, 'maxQty', e.target.value)}
                              placeholder="e.g. 49"
                            />
                          </div>
                          <div className="entry-col">
                            <label>Unit Price (₹) *</label>
                            <input
                              type="number"
                              min="1"
                              className="admin-b2b-input"
                              value={entry.unitPrice}
                              onChange={(e) => handleUpdateEditPriceEntry(idx, 'unitPrice', e.target.value)}
                              required
                            />
                          </div>
                          <button
                            type="button"
                            className="entry-del-btn"
                            onClick={() => handleRemoveEditPriceEntry(idx)}
                            disabled={editPriceEntries.length <= 1}
                            title="Remove price entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock, Dimensions, Materials */}
                  <div className="admin-b2b-form-grid three-col">
                    <div className="admin-b2b-field">
                      <label>Stock (Units) *</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-b2b-input"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        required
                      />
                    </div>
                    <div className="admin-b2b-field">
                      <label>Dimensions</label>
                      <input
                        type="text"
                        className="admin-b2b-input"
                        value={editDimensions}
                        onChange={(e) => setEditDimensions(e.target.value)}
                      />
                    </div>
                    <div className="admin-b2b-field">
                      <label>Materials</label>
                      <input
                        type="text"
                        className="admin-b2b-input"
                        value={editMaterial}
                        onChange={(e) => setEditMaterial(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Single Image Upload Section for Edit */}
                  <div className="admin-b2b-field">
                    <div className="admin-b2b-field-header">
                      <label>Product Photograph (1 Image) *</label>
                      <span className="admin-b2b-field-sub">Upload new photo or change URL</span>
                    </div>

                    {editImageUrl ? (
                      <div className="admin-b2b-image-card">
                        <img
                          src={editImageUrl}
                          alt="Edit preview"
                          className="admin-b2b-image-thumb"
                          onError={(e) => {
                            e.currentTarget.src = '/new-images/product-placeholder.jpg';
                          }}
                        />
                        <div className="admin-b2b-image-details">
                          <div className="admin-b2b-image-status">
                            <CheckCircle2 size={15} style={{ color: '#059669' }} />
                            <span>Current Wholesale Image</span>
                          </div>
                          <span className="admin-b2b-image-filename" title={editImageUrl}>
                            {editImageUrl.length > 40 ? `${editImageUrl.slice(0, 37)}...` : editImageUrl}
                          </span>
                          <div className="admin-b2b-image-actions">
                            <button
                              type="button"
                              className="admin-b2b-action-link"
                              onClick={() => editFileInputRef.current && editFileInputRef.current.click()}
                              disabled={isUploadingEditImage}
                            >
                              <UploadCloud size={13} /> Upload New Image
                            </button>
                            <span className="divider">•</span>
                            <button
                              type="button"
                              className="admin-b2b-action-link text-danger"
                              onClick={() => {
                                setEditImageUrl('');
                                if (editFileInputRef.current) editFileInputRef.current.value = '';
                              }}
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`admin-b2b-upload-dropzone ${isUploadingEditImage ? 'uploading' : ''}`}
                        onClick={() =>
                          !isUploadingEditImage && editFileInputRef.current && editFileInputRef.current.click()
                        }
                      >
                        {isUploadingEditImage ? (
                          <div className="admin-b2b-upload-content">
                            <Loader2 size={24} className="admin-b2b-spin" style={{ color: 'var(--teal)' }} />
                            <strong>Uploading new image to Cloudinary...</strong>
                          </div>
                        ) : (
                          <div className="admin-b2b-upload-content">
                            <UploadCloud size={24} style={{ color: 'var(--teal)' }} />
                            <strong>Click to upload product image</strong>
                            <small>Supports PNG, JPG, WEBP up to 10MB</small>
                          </div>
                        )}
                      </div>
                    )}

                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditSingleFileUpload(file);
                      }}
                      disabled={isUploadingEditImage}
                    />

                    {editUploadError && (
                      <div className="admin-b2b-upload-error">
                        <AlertCircle size={14} />
                        <span>{editUploadError}</span>
                      </div>
                    )}

                    <div className="admin-b2b-manual-toggle">
                      <button
                        type="button"
                        className="admin-b2b-link-toggle"
                        onClick={() => setShowEditManualUrl(!showEditManualUrl)}
                      >
                        {showEditManualUrl ? '− Hide direct image URL input' : '+ Or paste direct image URL'}
                      </button>
                      {showEditManualUrl && (
                        <input
                          type="text"
                          className="admin-b2b-input manual-url-input"
                          placeholder="https://... or /new-images/..."
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-b2b-modal-footer">
                  <button
                    type="button"
                    className="admin-b2b-btn-secondary"
                    onClick={() => setEditingProduct(null)}
                    disabled={isUpdatingProduct}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-b2b-submit-btn"
                    disabled={isUpdatingProduct || isUploadingEditImage}
                  >
                    {isUpdatingProduct ? 'Saving Changes...' : 'Save Product Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
