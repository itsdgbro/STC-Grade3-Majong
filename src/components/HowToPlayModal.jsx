import React from 'react';

/**
 * Child-friendly visual tutorial modal explaining Crossword Puzzle rules.
 */
export const HowToPlayModal = ({ onClose }) => {
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
        animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '36px',
          border: '8px solid #facc15',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(250, 204, 21, 0.45)',
          padding: '40px 36px',
          maxWidth: '920px',
          width: '90%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(90deg, #0284c7, #3b82f6)',
              color: '#ffffff',
              padding: '10px 36px',
              borderRadius: '50px',
              fontSize: '30px',
              fontWeight: '900',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            📖 How to Play Crossword
          </div>
          <div style={{ fontSize: '20px', color: '#64748b', fontWeight: '800', marginTop: '8px' }}>
            क्रसवर्ड खेल्ने तरिका (How to Play)
          </div>
        </div>

        {/* 3 Step Guide Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
          {/* Step 1 */}
          <div
            style={{
              background: '#f0f9ff',
              border: '3.5px solid #7dd3fc',
              borderRadius: '24px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ fontSize: '48px', flexShrink: 0 }}>🎡</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0369a1', marginBottom: '4px' }}>
                1. Swipe Letters on the Wheel
              </div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1.35, margin: 0 }}>
                Drag your finger or mouse across the letters in the bottom wheel to connect and spell words.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: '#f0fdf4',
              border: '3.5px solid #86efac',
              borderRadius: '24px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ fontSize: '48px', flexShrink: 0 }}>🧩</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#15803d', marginBottom: '4px' }}>
                2. Fill the Crossword Grid
              </div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1.35, margin: 0 }}>
                When you form a correct crossword word, its letter slots light up and reveal on the grid!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: '#fefce8',
              border: '3.5px solid #fde047',
              borderRadius: '24px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ fontSize: '48px', flexShrink: 0 }}>💡</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#a16207', marginBottom: '4px' }}>
                3. Use Clues & Hints
              </div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1.35, margin: 0 }}>
                Tap any word on the grid to read its clue! Tap the 💡 <b>Hint button</b> or 🔊 <b>Listen button</b> for help.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: '4px solid #a7f3d0',
              padding: '16px 52px',
              borderRadius: '40px',
              fontSize: '26px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(16, 185, 129, 0.45)',
              letterSpacing: '1px'
            }}
          >
            👍 बुझें! सुरु गरौं (Got It!)
          </button>
        </div>
      </div>
    </div>
  );
};
