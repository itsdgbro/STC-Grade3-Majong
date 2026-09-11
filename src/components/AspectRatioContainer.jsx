import React, { useEffect, useState } from 'react';

/**
 * Ensures the entire game is locked to a 1080x1920 (9:16 portrait) viewport,
 * centered with solid black bars on excess spaces (letterbox / pillarbox).
 */
export const AspectRatioContainer = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    // Attempt screen orientation lock to portrait if supported
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock('portrait').catch(() => {
        // Not all browsers support programmatic locking without user gesture
      });
    }

    const handleResize = () => {
      const targetWidth = 1080;
      const targetHeight = 1920;
      
      // Support visualViewport for mobile browser bars and pinch zoom prevention
      const windowWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const windowHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

      // On mobile / handheld touch devices (or max-height < 600px), prompt portrait if held sideways
      const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || windowWidth < 600;
      setIsLandscape(isMobileDevice && windowWidth > windowHeight);

      // Scale to fit while preserving 9:16 strictly without distortion
      const currentScale = Math.min(windowWidth / targetWidth, windowHeight / targetHeight);
      setScale(currentScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Rotate Device Overlay shown when device is held in landscape on small screens */}
      <div className="rotate-device-overlay" style={{ display: isLandscape ? 'flex' : 'none' }}>
        <div className="rotate-phone-icon" style={{ transform: 'rotate(90deg)' }}>📱</div>
        <h2
          style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#ffffff',
            margin: '0 0 12px 0',
            fontFamily: "'Fredoka', sans-serif"
          }}
        >
          Please Rotate to Portrait
        </h2>
        <div
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#facc15',
            marginBottom: '16px'
          }}
        >
          कृपया आफ्नो डिभाइसलाई ठाडो पार्नुहोस् (Portrait Mode)
        </div>
        <p
          style={{
            fontSize: '18px',
            color: '#cbd5e1',
            maxWidth: '500px',
            lineHeight: 1.4,
            margin: 0
          }}
        >
          This Crossword game is optimized for vertical portrait play.
        </p>
      </div>

      <div
        className="game-viewport"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {children}
      </div>
    </div>
  );
};
