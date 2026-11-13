import { useState, useEffect, useRef } from 'react';
import {
  Film,
  Upload,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Search
} from 'lucide-react';
import { reelService } from '../services/reelService';
import { getAllProducts, fetchAllProducts } from '../services/productService';
import './AdminReelsPage.css';

export default function AdminReelsPage({ onNavigateHome, onSelectProduct }) {
  // Available products list
  const [productsList, setProductsList] = useState(() => getAllProducts());
  const [productSearch, setProductSearch] = useState('');

  // Form Fields (Requested by user)
  const [title, setTitle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption, setCaption] = useState('');

  // Video Upload State
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFileName, setVideoFileName] = useState('');
  const fileInputRef = useRef(null);

  // Form Submission & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Existing Reels state for live preview & management
  const [existingReels, setExistingReels] = useState([]);
  const [isLoadingReels, setIsLoadingReels] = useState(true);
  const [deletingReelId, setDeletingReelId] = useState(null);

  // Fetch live products and existing reels on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const liveProducts = await fetchAllProducts();
        if (isMounted && Array.isArray(liveProducts) && liveProducts.length > 0) {
          setProductsList(liveProducts);
          if (!selectedProductId) {
            setSelectedProductId(liveProducts[0]._id || liveProducts[0].id);
          }
        }
      } catch (err) {
        console.warn('[AdminReelsPage] Failed to fetch live products:', err);
      }
    })();

    loadReels();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadReels = async () => {
    try {
      setIsLoadingReels(true);
      const data = await reelService.getReels();
      setExistingReels(data || []);
    } catch (err) {
      console.warn('[AdminReelsPage] Failed to load reels:', err);
    } finally {
      setIsLoadingReels(false);
    }
  };

  // Selected Product object
  const selectedProduct = productsList.find(
    (p) => String(p._id || p.id) === String(selectedProductId)
  );

  // Filter products by search query
  const filteredProducts = productsList.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  });

  // Handle Cloudinary Video Upload
  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verify it is a video file
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    try {
      setIsUploadingVideo(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setVideoFileName(file.name);

      const asset = await reelService.uploadVideo(file);
      if (asset && asset.url) {
        setVideoUrl(asset.url);
        if (asset.thumbnailUrl) {
          setThumbnailUrl(asset.thumbnailUrl);
        }
        setSuccessMessage('Video uploaded successfully to Cloudinary!');
      } else {
        throw new Error('Upload returned invalid response.');
      }
    } catch (err) {
      setErrorMessage(
        err?.message || err?.data?.message || 'Failed to upload video to Cloudinary. You can also paste a direct video URL.'
      );
    } finally {
      setIsUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Reel Submission
  const handleSubmitReel = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Reel title is required.');
      return;
    }

    if (!videoUrl.trim()) {
      setErrorMessage('Please upload a video to Cloudinary or provide a video URL.');
      return;
    }

    if (!selectedProductId) {
      setErrorMessage('Please select a product to assign to this reel.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newReel = await reelService.createReel({
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || selectedProduct?.image || '',
        product: selectedProductId,
        caption: caption.trim(),
        order: existingReels.length + 1,
        isActive: true
      });

      setSuccessMessage(`Reel "${title}" created and published to the homepage!`);
      // Reset form
      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setCaption('');
      setVideoFileName('');

      // Reload reels list
      await loadReels();
    } catch (err) {
      setErrorMessage(
        err?.message || err?.data?.message || 'Failed to publish reel. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Reel
  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Are you sure you want to delete this reel? It will no longer appear on the homepage.')) {
      return;
    }
    try {
      setDeletingReelId(reelId);
      await reelService.deleteReel(reelId);
      setExistingReels((prev) => prev.filter((r) => (r._id || r.id) !== reelId));
      setSuccessMessage('Reel deleted successfully.');
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to delete reel.');
    } finally {
      setDeletingReelId(null);
    }
  };

  return (
    <div className="admin-reels-page">
      {/* ── Top Header Bar ── */}
      <div className="admin-reels-header">
        <div className="admin-reels-header-left">
          <button
            type="button"
            className="admin-reels-back-btn"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={16} />
            <span>Return to Store</span>
          </button>
          <div className="admin-reels-header-title-wrap">
            <span className="admin-reels-eyebrow">
              <Sparkles size={13} />
              STOREFRONT SHORT VIDEOS • ADMIN STUDIO
            </span>
            <h1 className="admin-reels-title">Shoppable Reels Manager</h1>
            <p className="admin-reels-subtitle">
              Upload vertical videos to Cloudinary and attach them to products to showcase real craftsmanship on your homepage.
            </p>
          </div>
        </div>

        <div className="admin-reels-stats-pill">
          <Film size={16} />
          <span>{existingReels.length} Active Reels</span>
        </div>
      </div>

      {/* ── Feedback Alerts ── */}
      {errorMessage && (
        <div className="admin-reels-alert error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)}>✕</button>
        </div>
      )}

      {successMessage && (
        <div className="admin-reels-alert success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)}>✕</button>
        </div>
      )}

      {/* ── Main Two-Column Layout ── */}
      <div className="admin-reels-grid">
        {/* Left Column: Reel Upload Form */}
        <div className="admin-reels-card">
          <div className="admin-reels-card-header">
            <div className="admin-reels-card-icon">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="admin-reels-card-title">Upload New Shoppable Reel</h2>
              <p className="admin-reels-card-desc">
                Fill in the details, upload the video to Cloudinary, and select the product.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitReel} className="admin-reels-form">
            {/* ── 1. Reel Title (Requirement 1) ── */}
            <div className="admin-reels-field">
              <label htmlFor="reel-title" className="admin-reels-label">
                1. Reel Title <em>*</em>
              </label>
              <input
                id="reel-title"
                type="text"
                className="admin-reels-input"
                placeholder="e.g., Divine Sanctum • Ambient LED Light Frame"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
              />
              <span className="admin-reels-hint">
                This headline will be shown as <code>reel-card-title</code> on the homepage card and in the story player.
              </span>
            </div>

            {/* ── 2. Cloudinary Video Upload (Requirement 2) ── */}
            <div className="admin-reels-field">
              <label className="admin-reels-label">
                2. Video Upload (Cloudinary) <em>*</em>
              </label>

              {/* Drag & Drop Upload Zone */}
              <div
                className={`admin-reels-dropzone ${isUploadingVideo ? 'uploading' : ''} ${videoUrl ? 'has-video' : ''}`}
                onClick={() => !isUploadingVideo && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleVideoFileChange}
                  style={{ display: 'none' }}
                  disabled={isUploadingVideo}
                />

                {isUploadingVideo ? (
                  <div className="admin-reels-upload-state">
                    <div className="admin-reels-spinner" />
                    <span className="admin-reels-upload-prompt">
                      Uploading to Cloudinary...
                    </span>
                    <span className="admin-reels-upload-subtext">
                      Optimizing vertical video for 60fps streaming ({videoFileName})
                    </span>
                  </div>
                ) : videoUrl ? (
                  <div className="admin-reels-video-preview-wrap" onClick={(e) => e.stopPropagation()}>
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="admin-reels-video-preview"
                    />
                    <div className="admin-reels-video-preview-meta">
                      <span className="admin-reels-preview-status">
                        <CheckCircle size={14} /> Ready on Cloudinary
                      </span>
                      <button
                        type="button"
                        className="admin-reels-replace-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-reels-upload-prompt-wrap">
                    <div className="admin-reels-upload-icon-circle">
                      <Upload size={24} />
                    </div>
                    <span className="admin-reels-upload-prompt">
                      Click or drop video to upload to Cloudinary
                    </span>
                    <span className="admin-reels-upload-subtext">
                      Supports MP4, WebM, MOV vertical 9:16 videos up to 100MB
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Video URL Fallback */}
              <div className="admin-reels-url-fallback">
                <span className="admin-reels-url-fallback-label">Or paste direct Video URL:</span>
                <input
                  type="url"
                  className="admin-reels-input-small"
                  placeholder="https://res.cloudinary.com/... or /videos/reel-1.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </div>

            {/* ── 3. Product Selector (Requirement 3) ── */}
            <div className="admin-reels-field">
              <label htmlFor="reel-product" className="admin-reels-label">
                3. Assign Shoppable Product <em>*</em>
              </label>

              {/* Product Search Box */}
              <div className="admin-reels-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Filter available products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-reels-search-input"
                />
              </div>

              {/* Product Select Dropdown */}
              <select
                id="reel-product"
                className="admin-reels-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select a product to link --</option>
                {filteredProducts.map((p) => {
                  const pid = p._id || p.id;
                  const price = Number(p.price || p.basePrice || 0);
                  return (
                    <option key={pid} value={pid}>
                      {p.name} — ₹{price.toLocaleString()} ({p.category || 'General'})
                    </option>
                  );
                })}
              </select>

              {/* Live Shoppable Product Preview Card */}
              {selectedProduct && (
                <div className="admin-reels-product-preview-card">
                  <img
                    src={selectedProduct.image || thumbnailUrl || 'https://via.placeholder.com/60'}
                    alt={selectedProduct.name}
                    className="admin-reels-product-thumb"
                  />
                  <div className="admin-reels-product-info">
                    <span className="admin-reels-product-cat">
                      {selectedProduct.category || 'Store Product'}
                    </span>
                    <h4 className="admin-reels-product-name">{selectedProduct.name}</h4>
                    <span className="admin-reels-product-price">
                      ₹{Number(selectedProduct.price || selectedProduct.basePrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="admin-reels-product-badge">
                    <ShoppingBag size={13} />
                    <span>Attached</span>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Caption Field */}
            <div className="admin-reels-field">
              <label htmlFor="reel-caption" className="admin-reels-label">
                Caption / Description (Optional)
              </label>
              <textarea
                id="reel-caption"
                className="admin-reels-textarea"
                rows={2}
                placeholder="Brief craft story or artisan detail..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="admin-reels-submit-btn"
              disabled={isSubmitting || isUploadingVideo}
            >
              {isSubmitting ? (
                <>
                  <div className="admin-reels-btn-spinner" />
                  <span>Publishing to Homepage...</span>
                </>
              ) : (
                <>
                  <Film size={18} />
                  <span>Publish Reel to Homepage</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Reels Showcase & Management */}
        <div className="admin-reels-card">
          <div className="admin-reels-card-header">
            <div className="admin-reels-card-icon" style={{ background: '#FAF6F2', color: '#3B2F2F' }}>
              <Film size={20} />
            </div>
            <div>
              <h2 className="admin-reels-card-title">Live Storefront Reels ({existingReels.length})</h2>
              <p className="admin-reels-card-desc">
                These short videos are currently displayed in the "Art in Motion" shelf on the homepage.
              </p>
            </div>
          </div>

          {isLoadingReels ? (
            <div className="admin-reels-loading">
              <div className="admin-reels-spinner" />
              <span>Loading current reels...</span>
            </div>
          ) : existingReels.length === 0 ? (
            <div className="admin-reels-empty">
              <Film size={36} />
              <h3>No Reels Uploaded Yet</h3>
              <p>Upload your first reel using the form on the left to activate the homepage showcase.</p>
            </div>
          ) : (
            <div className="admin-reels-list">
              {existingReels.map((reel, idx) => {
                const rid = reel._id || reel.id;
                const prod = reel.product;
                const isDeleting = deletingReelId === rid;

                return (
                  <div key={rid || idx} className="admin-reels-item">
                    {/* Thumbnail / Autoplaying Video Preview */}
                    <div className="admin-reels-item-media">
                      {reel.videoUrl ? (
                        <video
                          src={reel.videoUrl}
                          poster={reel.thumbnailUrl || undefined}
                          className="admin-reels-item-thumb"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : reel.thumbnailUrl ? (
                        <img
                          src={reel.thumbnailUrl}
                          alt={reel.title}
                          className="admin-reels-item-thumb"
                        />
                      ) : (
                        <div className="admin-reels-item-placeholder">
                          <Film size={20} />
                        </div>
                      )}
                      <span className="admin-reels-item-order">#{idx + 1}</span>
                    </div>

                    {/* Metadata */}
                    <div className="admin-reels-item-details">
                      <h4 className="admin-reels-item-title">{reel.title}</h4>
                      {prod ? (
                        <div className="admin-reels-item-product">
                          <ShoppingBag size={12} />
                          <span>{prod.name} (₹{Number(prod.price || prod.basePrice || 0).toLocaleString()})</span>
                        </div>
                      ) : (
                        <div className="admin-reels-item-product unlinked">
                          <span>⚠️ Product unlinked</span>
                        </div>
                      )}

                      <div className="admin-reels-item-stats">
                        <span className="admin-reels-item-stat">
                          <Eye size={12} /> {reel.viewsCount ? (reel.viewsCount).toLocaleString() : 0} views
                        </span>
                        <span className="admin-reels-active-tag">● Live on Home</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="admin-reels-item-actions">
                      <button
                        type="button"
                        className="admin-reels-delete-btn"
                        onClick={() => handleDeleteReel(rid)}
                        disabled={isDeleting}
                        title="Delete Reel"
                        aria-label={`Delete ${reel.title}`}
                      >
                        {isDeleting ? <div className="admin-reels-btn-spinner sm" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
