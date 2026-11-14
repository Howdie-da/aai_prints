import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ShoppingBag,
  Eye,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { reelService } from '../services/reelService';
import './ReelsSection.css';

/**
 * Autoplaying Video Preview for Reel Cards on the homepage shelf.
 * Silently autoplays in an infinite loop while the reel card is on screen.
 * Pauses automatically when the fullscreen story modal is opened.
 */
function ReelCardMedia({ reel, isModalOpen }) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // IntersectionObserver to only autoplay cards visible in the carousel viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoError, reel.videoUrl]);

  // Handle Play/Pause based on modal state and viewport intersection
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoError) return;

    // Browser autoplay requirements
    video.muted = true;
    video.defaultMuted = true;

    if (!isModalOpen && isInView) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Gracefully ignore autoplay postponement by browser
        });
      }
    } else {
      video.pause();
    }
  }, [isModalOpen, isInView, videoError, reel.videoUrl]);

  if (reel.videoUrl && !videoError) {
    return (
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl || undefined}
        className="reel-card-video-preview"
        autoPlay
        muted
        defaultMuted
        loop
        playsInline
        preload="auto"
        onError={() => setVideoError(true)}
        onLoadedData={(e) => {
          e.currentTarget.muted = true;
          if (!isModalOpen && isInView) {
            e.currentTarget.play().catch(() => {});
          }
        }}
      />
    );
  }

  if (reel.thumbnailUrl) {
    return (
      <img
        src={reel.thumbnailUrl}
        alt={reel.title}
        className="reel-card-thumbnail"
        loading="lazy"
      />
    );
  }

  return <div className="reel-card-fallback-poster" />;
}

export default function ReelsSection({ onSelectProduct }) {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default as requested
  const [progress, setProgress] = useState(0);
  const [tapFeedback, setTapFeedback] = useState(null);
  const [audioBlockedNotice, setAudioBlockedNotice] = useState(false);
  const [slideDirection, setSlideDirection] = useState('up'); // 'up' | 'down'
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const scrollTrackRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);
  const isSwiping = useRef(false);
  const lastWheelTime = useRef(0);

  // Fetch reels on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await reelService.getReels();
        if (isMounted) {
          setReels(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeReel = activeReelIndex !== null ? reels[activeReelIndex] : null;

  // Open modal handler (direct user gesture -> unmuted playback allowed)
  const openReelModal = (index) => {
    setActiveReelIndex(index);
    setIsMuted(false); // By default it will be unmute
    setIsPlaying(true);
    setProgress(0);
    setAudioBlockedNotice(false);
    setSlideDirection('up');
    setShowSwipeHint(true);

    const targetReel = reels[index];
    if (targetReel?._id || targetReel?.id) {
      reelService.trackView(targetReel._id || targetReel.id);
    }
  };

  const closeReelModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveReelIndex(null);
    setIsPlaying(false);
    setProgress(0);
    setShowSwipeHint(false);
  }, []);

  // Cycle to next reel (vertical scroll/swipe down -> up)
  const nextReel = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (reels.length === 0) return;
      setSlideDirection('up');
      setShowSwipeHint(false);
      setActiveReelIndex((prev) => (prev + 1) % reels.length);
      setIsPlaying(true);
      setProgress(0);
    },
    [reels.length]
  );

  // Cycle to previous reel (vertical scroll/swipe up -> down)
  const prevReel = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (reels.length === 0) return;
      setSlideDirection('down');
      setShowSwipeHint(false);
      setActiveReelIndex((prev) => (prev - 1 + reels.length) % reels.length);
      setIsPlaying(true);
      setProgress(0);
    },
    [reels.length]
  );

  // Auto-play when active reel changes
  useEffect(() => {
    if (activeReelIndex === null || !videoRef.current) return;

    const videoEl = videoRef.current;
    videoEl.currentTime = 0;
    videoEl.muted = isMuted;

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAudioBlockedNotice(false);
        })
        .catch((err) => {
          // If browser policy blocks unmuted autoplay without sufficient interaction
          console.warn('[ReelsSection] Unmuted autoplay prevented by browser policy, falling back to muted:', err);
          videoEl.muted = true;
          setIsMuted(true);
          setAudioBlockedNotice(true);
          videoEl.play().catch(() => {});
        });
    }
  }, [activeReelIndex]);

  // Sync mute state changes to video element
  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuteState = !isMuted;
    videoRef.current.muted = nextMuteState;
    setIsMuted(nextMuteState);
    if (!nextMuteState) {
      setAudioBlockedNotice(false);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setTapFeedback('play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setTapFeedback('pause');
    }
    setTimeout(() => setTapFeedback(null), 550);
  };

  // Time progress update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  };

  // Vertical Touch Swipe Gesture Navigation (Mobile Reels / TikTok / Whatmore style)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping.current || touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - touchEndY;
    const deltaX = touchStartX.current - touchEndX;

    // Minimum swipe threshold (40px) & primarily vertical
    if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0) {
        // Swiped UP -> Go to Next reel
        nextReel();
      } else {
        // Swiped DOWN -> Go to Prev reel
        prevReel();
      }
    }

    touchStartY.current = null;
    touchStartX.current = null;
    isSwiping.current = false;
  };

  // Mouse Wheel / Trackpad Vertical Scroll Navigation (with 450ms debounce)
  const handleWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelTime.current < 450) return;
    if (Math.abs(e.deltaY) > 25) {
      lastWheelTime.current = now;
      if (e.deltaY > 0) {
        nextReel();
      } else {
        prevReel();
      }
    }
  };

  // Keyboard navigation (Supports ArrowDown/ArrowUp + ArrowRight/ArrowLeft + Esc + Space + M)
  useEffect(() => {
    if (activeReelIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeReelModal();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextReel();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevReel();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, closeReelModal, nextReel, prevReel, isMuted]);

  // Lock body & document scroll when reel modal is open
  useEffect(() => {
    if (activeReelIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeReelIndex]);

  // Horizontal scroll buttons for the carousel shelf
  const scrollShelf = (direction) => {
    if (!scrollTrackRef.current) return;
    const scrollAmount = direction === 'left' ? -360 : 360;
    scrollTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Handle shoppable product click
  const handleProductClick = (product, e) => {
    if (e) e.stopPropagation();
    if (!product) return;
    closeReelModal();
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  if (loading) {
    return (
      <section className="reels-section-wrapper" aria-label="Short Videos Loading">
        <div className="reels-container">
          <div className="reels-header-skeleton" />
          <div className="reels-carousel-skeleton">
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="reel-card-skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reels || reels.length === 0) {
    return null; // Homepage remains clean if no reels available
  }

  return (
    <section className="reels-section-wrapper" aria-label="Short Videos & Stories">
      <div className="reels-container">
        {/* Section Header */}
        <div className="reels-header">
          <div className="reels-header-left">
            <h2 className="reels-title">Our Products as Stories</h2>
            <p className="reels-subtitle">
              Experience the warm ambient glow of our products in motion.
            </p>
          </div>

          {/* Shelf Navigation Arrows */}
          <div className="reels-header-arrows">
            <button
              type="button"
              className="reels-arrow-btn"
              onClick={() => scrollShelf('left')}
              aria-label="Scroll reels left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="reels-arrow-btn"
              onClick={() => scrollShelf('right')}
              aria-label="Scroll reels right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Shelf */}
        <div className="reels-track-container" ref={scrollTrackRef}>
          <div className="reels-track">
            {reels.map((reel, idx) => {
              const prod = reel.product;
              return (
                <div
                  key={reel._id || reel.id || idx}
                  className="reel-card"
                  onClick={() => openReelModal(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openReelModal(idx);
                    }
                  }}
                  aria-label={`Watch reel: ${reel.title}`}
                >
                  {/* Card Visual / Thumbnail / Autoplaying Video Preview */}
                  <div className="reel-card-media-wrap">
                    <ReelCardMedia
                      reel={reel}
                      isModalOpen={activeReelIndex !== null}
                    />

                    {/* Gradient Overlay */}
                    <div className="reel-card-gradient" />

                    {/* Bottom Shoppable Product Dock on Card */}
                    {prod && (
                      <div
                        className="reel-card-product-chip"
                        onClick={(e) => handleProductClick(prod, e)}
                        title={`Shop ${prod.name}`}
                      >
                        <img
                          src={prod.image || reel.thumbnailUrl}
                          alt={prod.name}
                          className="reel-card-product-thumb"
                        />
                        <div className="reel-card-product-info">
                          <span className="reel-card-product-name">{prod.name}</span>
                          <span className="reel-card-product-price">
                            ₹{Number(prod.price || prod.basePrice || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="reel-card-product-action">
                          <ShoppingBag size={15} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Caption / Title under card */}
                  <div className="reel-card-meta">
                    <h3 className="reel-card-title">{reel.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SHOPIFY WHATMORE-STYLE STORY MODAL PLAYER (Portaled to document.body) ── */}
      {activeReel && createPortal(
        <div
          className="reel-modal-backdrop"
          onClick={closeReelModal}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-label="Reel Video Player"
        >
          {/* Previous Arrow Button */}
          <button
            type="button"
            className="reel-modal-nav-btn prev"
            onClick={prevReel}
            aria-label="Previous story"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Main Focused Reel Player Card */}
          <div
            className="reel-modal-card"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Progress Bar */}
            <div className="reel-modal-progress-bar">
              <div
                className="reel-modal-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Top Controls Overlay */}
            <div className="reel-modal-header">
              <div className="reel-modal-header-brand">
                <span className="reel-modal-header-title">{activeReel.title}</span>
              </div>

              <div className="reel-modal-header-actions">
                {/* Mute / Unmute Button (Unmuted by default) */}
                <button
                  type="button"
                  className={`reel-modal-icon-btn ${!isMuted ? 'active-audio' : ''}`}
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                  title={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
                >
                  {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  className="reel-modal-icon-btn close-btn"
                  onClick={closeReelModal}
                  aria-label="Close story player"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Subtle Vertical Swipe Hint on Mobile */}
            {showSwipeHint && (
              <div className="reel-modal-swipe-hint">
                <span>Swipe up for next</span>
                <ChevronDown size={14} className="reel-modal-swipe-arrow" />
              </div>
            )}

            {/* Video Viewport (Tap to Play/Pause, Animated Vertical Slide) */}
            <div
              key={`reel-${activeReel._id || activeReel.id || activeReelIndex}`}
              className={`reel-modal-viewport ${slideDirection === 'up' ? 'slide-up' : 'slide-down'}`}
              onClick={togglePlay}
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              <video
                ref={videoRef}
                src={activeReel.videoUrl}
                poster={activeReel.thumbnailUrl}
                playsInline
                loop
                onTimeUpdate={handleTimeUpdate}
                className="reel-modal-video"
              />

              {/* Tap Feedback Animation */}
              {tapFeedback && (
                <div className="reel-modal-tap-feedback">
                  {tapFeedback === 'play' ? (
                    <Play size={44} fill="currentColor" />
                  ) : (
                    <Pause size={44} fill="currentColor" />
                  )}
                </div>
              )}
            </div>

            {/* Attached Shoppable Product Dock Overlay (Whatmore Extension Pattern) */}
            {activeReel.product && (
              <div className="reel-modal-product-dock">
                <div
                  className="reel-modal-product-card"
                  onClick={(e) => handleProductClick(activeReel.product, e)}
                >
                  <img
                    src={activeReel.product.image || activeReel.thumbnailUrl}
                    alt={activeReel.product.name}
                    className="reel-modal-product-img"
                  />

                  <div className="reel-modal-product-details">
                    <h4 className="reel-modal-product-name">{activeReel.product.name}</h4>
                    <div className="reel-modal-product-pricing">
                      <span className="reel-modal-product-price">
                        ₹{Number(activeReel.product.price || activeReel.product.basePrice || 0).toLocaleString()}
                      </span>
                      {activeReel.product.originalPrice && activeReel.product.originalPrice > (activeReel.product.price || 0) && (
                        <span className="reel-modal-product-original-price">
                          ₹{Number(activeReel.product.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="reel-modal-shop-cta"
                    onClick={(e) => handleProductClick(activeReel.product, e)}
                    aria-label={`Shop ${activeReel.product.name}`}
                  >
                    <span>Shop Now</span>
                    <ShoppingBag size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Next Arrow Button */}
          <button
            type="button"
            className="reel-modal-nav-btn next"
            onClick={nextReel}
            aria-label="Next story"
          >
            <ChevronRight size={28} />
          </button>
        </div>,
        document.body
      )}
    </section>
  );
}
