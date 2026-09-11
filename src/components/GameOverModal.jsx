import React from 'react';
import { audio } from '../utils/audio';

/**
 * Supportive & encouraging Game Over modal shown when children run out of hearts.
 */
export const GameOverModal = ({
  score = 0,
  round = 1,
  totalRounds = 3,
  pairsMatched = 0,
  totalPairs = 6,
  onRetry,
  onHome
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Main Game Over Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '36px',
          border: '8px solid #f43f5e',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), 0 0 40px rgba(244, 63, 94, 0.3)',
          padding: '44px 56px',
          width: '680px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Top Floating Banner */}
        <div
          style={{
            position: 'absolute',
            top: '-42px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #ef4444, #f97316)',
            color: '#ffffff',
            padding: '14px 54px',
            borderRadius: '50px',
            fontSize: '32px',
            fontWeight: '900',
            boxShadow: '0 10px 24px rgba(239, 68, 68, 0.45)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            whiteSpace: 'nowrap'
          }}
        >
          💔 Out of Hearts! 💔
        </div>

        {/* Heart Loss Icon & Encouraging Message */}
        <div style={{ marginTop: '24px' }}>
          <div
            style={{
              fontSize: '64px',
              margin: '8px 0',
              filter: 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.35))',
              animation: 'heartPulse 1.8s ease-in-out infinite'
            }}
          >
            ❤️‍🩹
          </div>

          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              padding: '8px 24px',
              borderRadius: '20px',
              fontSize: '20px',
              fontWeight: '900',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            💪 Don't Give Up!
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: '900',
              color: '#1e293b',
              fontFamily: "'Fredoka', sans-serif"
            }}
          >
            Practice makes perfect! Try again to master the words!
          </div>
        </div>

        {/* Performance Summary Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px',
            margin: '28px 0',
            background: '#f1f5f9',
            padding: '22px 28px',
            borderRadius: '26px'
          }}
        >
          <div>
            <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px' }}>
              ROUND REACHED
            </div>
            <div style={{ fontSize: '38px', color: '#0284c7', fontWeight: '900', lineHeight: '1.2' }}>
              Round {round} / {totalRounds}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700', marginTop: '4px' }}>
              {pairsMatched} of {totalPairs} Pairs Solved
            </div>
          </div>

          <div>
            <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px' }}>
              TOTAL SCORE
            </div>
            <div style={{ fontSize: '38px', color: '#f59e0b', fontWeight: '900', lineHeight: '1.2' }}>
              {score}
            </div>
            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '800', marginTop: '4px' }}>
              Great effort! 🌟
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginTop: '34px',
            width: '100%'
          }}
        >
          <button
            onClick={() => {
              audio.playSelect();
              if (onHome) onHome();
            }}
            style={{
              flex: 1,
              background: '#64748b',
              color: '#ffffff',
              padding: '18px 20px',
              borderRadius: '24px',
              fontSize: '22px',
              fontWeight: '900',
              boxShadow: '0 6px 18px rgba(100, 116, 139, 0.4)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: 'none',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Main Menu
          </button>

          <button
            onClick={() => {
              audio.playSelect();
              if (onRetry) onRetry();
            }}
            style={{
              flex: 1.3,
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              borderRadius: '24px',
              fontSize: '24px',
              fontWeight: '900',
              boxShadow: '0 8px 28px rgba(34, 197, 94, 0.45)',
              border: '3.5px solid #bbf7d0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
