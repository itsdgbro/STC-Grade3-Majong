import React from 'react';
import { audio } from '../utils/audio';

/**
 * Crossword Clue Banner Card
 * Displays the clue for the currently active word in the crossword,
 * with a text-to-speech speak button and hint button.
 */
export const ClueCard = ({
  activeWord,
  onHintClick,
  hintsRemaining = 3
}) => {
  if (!activeWord) return null;

  return (
    <div
      style={{
        width: '920px',
        maxWidth: '92%',
        margin: '0 auto 16px auto',
        padding: '16px 24px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1 }}>
        <button
          onClick={() => {
            audio.playSelect();
            if (activeWord.clue) {
              audio.speak(activeWord.clue.replace(/_/g, 'blank'));
            }
          }}
          title="Read Clue Aloud"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: '3px solid #7dd3fc',
            color: '#ffffff',
            fontSize: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          🔊
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {activeWord.number} {activeWord.direction} ({activeWord.length} letters)
            </span>
          </div>
          <span
            style={{
              fontSize: '44px',
              fontWeight: '900',
              color: '#f8fafc',
              marginTop: '6px',
              lineHeight: 1.25
            }}
          >
            {activeWord.clue || 'Find the missing word!'}
          </span>
        </div>
      </div>

      {/* Hint Button */}
      <button
        onClick={() => {
          if (hintsRemaining > 0 && onHintClick) {
            onHintClick();
          }
        }}
        disabled={hintsRemaining <= 0}
        style={{
          height: '76px',
          padding: '0 32px',
          borderRadius: '38px',
          background: hintsRemaining > 0
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : '#64748b',
          border: hintsRemaining > 0 ? '4px solid #fde68a' : '4px solid #94a3b8',
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          cursor: hintsRemaining > 0 ? 'pointer' : 'not-allowed',
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
          flexShrink: 0,
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (hintsRemaining > 0) e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          if (hintsRemaining > 0) e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '36px' }}>💡</span>
        <span style={{ fontSize: '32px' }}>HINT ({hintsRemaining})</span>
      </button>
    </div>
  );
};
