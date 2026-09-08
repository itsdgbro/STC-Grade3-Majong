import React, { useEffect, useState } from 'react';

/**
 * Ensures the entire game is locked to a 1920x1080 (16:9) viewport,
 * centered with solid black bars on excess spaces (letterbox / pillarbox).
 */
export const AspectRatioContainer = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Attempt screen orientation lock if supported
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock('landscape').catch(() => {
        // Not all browsers support programmatic locking without user gesture
      });
    }

    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      // Support visualViewport for mobile browser bars and pinch zoom prevention
      const windowWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const windowHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

      setIsPortrait(windowHeight > windowWidth);

      // Scale to fit while preserving 16:9 strictly without distortion
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
      {/* Rotate Device Overlay shown strictly when device is in Portrait */}
      <div className="rotate-device-overlay" style={{ display: isPortrait ? 'flex' : 'none' }}>
        <div className="rotate-phone-icon">📱</div>
        <h2
          style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#ffffff',
            margin: '0 0 12px 0',
            fontFamily: "'Fredoka', sans-serif"
          }}
        >
          Please Rotate Your Device
        </h2>
        <div
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#facc15',
            marginBottom: '16px'
          }}
        >
          कृपया आफ्नो डिभाइसलाई तेर्सो पार्नुहोस् (Landscape Mode)
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
          This Mahjong game is optimized for landscape play for the best visual experience.
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
