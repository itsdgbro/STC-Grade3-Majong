import React, { useEffect } from 'react';
import { audio } from '../utils/audio';

/**
 * GameOverModal:
 * Clean, tall, minimal game-over popup with generous height and prominent text sizes.
 * Displays only:
 *  - Title: Game Over
 *  - Points earned
 *  - 2 buttons without icons: Replay and Home
 */
export const GameOverModal = ({
  score = 0,
  onRetry,
  onHome
}) => {
  useEffect(() => {
    if (typeof audio.playGameOver === 'function') {
      audio.playGameOver();
    }
  }, []);

  const handleRetry = () => {
    if (typeof audio.playSelect === 'function') {
      audio.playSelect();
    }
    if (onRetry) {
      onRetry();
    }
  };

  const handleHome = () => {
    if (typeof audio.playSelect === 'function') {
      audio.playSelect();
    }
    if (onHome) {
      onHome();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        padding: '16px'
      }}
    >
      {/* Modal Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '44px',
          border: '7px solid #fecaca',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.55), 0 0 45px rgba(239, 68, 68, 0.28)',
          padding: '64px 64px 60px 64px',
          width: '780px',
          minHeight: '510px',
          maxWidth: '95%',
          maxHeight: '94vh',
          boxSizing: 'border-box',
          textAlign: 'center',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '78px',
            fontWeight: '900',
            color: '#ef4444',
            margin: '0 0 32px 0',
            fontFamily: "'Fredoka', sans-serif",
            letterSpacing: '2px',
            lineHeight: 1
          }}
        >
          Game Over
        </h2>

        {/* Points Earned Card */}
        <div
          style={{
            width: '100%',
            background: '#f1f5f9',
            border: '3px solid #e2e8f0',
            borderRadius: '30px',
            padding: '28px 36px',
            marginBottom: '36px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#64748b',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            Points Earned
          </div>
          <div
            style={{
              fontSize: '70px',
              fontWeight: '900',
              color: '#f59e0b',
              fontFamily: "'Fredoka', sans-serif",
              lineHeight: 1
            }}
          >
            {score} PTS
          </div>
        </div>

        {/* Action Buttons (without icons) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            width: '100%'
          }}
        >
          <button
            onClick={handleRetry}
            style={{
              flex: 1,
              height: '86px',
              borderRadius: '26px',
              backgroundColor: '#22c55e',
              border: 'none',
              borderBottom: '7px solid #16a34a',
              color: '#ffffff',
              fontSize: '34px',
              fontWeight: '900',
              cursor: 'pointer',
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.42)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Replay
          </button>

          <button
            onClick={handleHome}
            style={{
              flex: 1,
              height: '86px',
              borderRadius: '26px',
              backgroundColor: '#0284c7',
              border: 'none',
              borderBottom: '7px solid #0369a1',
              color: '#ffffff',
              fontSize: '34px',
              fontWeight: '900',
              cursor: 'pointer',
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: '0 8px 25px rgba(2, 132, 199, 0.42)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};
