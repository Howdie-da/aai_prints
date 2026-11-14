import { useRef, useEffect } from 'react';
import './HeroVideo.css';

export default function HeroVideo() {
  const mainVideoRef = useRef(null);
  const ambientVideoRef = useRef(null);

  // Synchronize playback between main video and ambient background glow
  useEffect(() => {
    const main = mainVideoRef.current;
    const ambient = ambientVideoRef.current;
    if (!main || !ambient) return;

    const syncTime = () => {
      if (Math.abs(ambient.currentTime - main.currentTime) > 0.15) {
        ambient.currentTime = main.currentTime;
      }
    };

    const handlePlay = () => ambient.play().catch(() => {});
    const handlePause = () => ambient.pause();

    main.addEventListener('timeupdate', syncTime);
    main.addEventListener('play', handlePlay);
    main.addEventListener('pause', handlePause);

    // Initial play trigger
    main.play().catch(() => {});
    ambient.play().catch(() => {});

    return () => {
      main.removeEventListener('timeupdate', syncTime);
      main.removeEventListener('play', handlePlay);
      main.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <section className="hero-video-section" aria-label="Brand Video Showcase">
      {/* Dynamic Ambient Glow Behind (Edge-to-Edge Frosted Wings) */}
      <div className="hero-video-ambient" aria-hidden="true">
        <video
          ref={ambientVideoRef}
          className="hero-video-ambient-player"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          tabIndex="-1"
        >
          <source src="/videos/dummy_hero_21x9_60fps.mp4" type="video/mp4" />
          <source src="/dummy_hero_21x9_60fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-ambient-overlay" />
      </div>

      {/* Crisp Main 2:1 Video Player Window */}
      <div className="hero-video-container">
        <video
          ref={mainVideoRef}
          className="hero-video-player"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/dummy_hero_21x9_60fps.mp4" type="video/mp4" />
          <source src="/dummy_hero_21x9_60fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
