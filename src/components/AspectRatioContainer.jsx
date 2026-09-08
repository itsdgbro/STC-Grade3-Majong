import React, { useEffect, useState } from 'react';

/**
 * Ensures the entire game is locked to a 1920x1080 (16:9) viewport,
 * centered with solid black bars on excess spaces (letterbox / pillarbox).
 */
export const AspectRatioContainer = ({ children }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      // Support visualViewport for mobile browser bars and pinch zoom prevention
      const windowWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const windowHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

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
