import React from 'react';

/**
 * Child-friendly interactive visual tutorial modal explaining Mahjong Solitaire rules.
 */
export const HowToPlayModal = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 120,
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
          padding: '40px 48px',
          maxWidth: '1100px',
          width: '92%',
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
              fontSize: '32px',
              fontWeight: '900',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            📖 How to Play Grade 3 Mahjong
          </div>
          <div style={{ fontSize: '20px', color: '#64748b', fontWeight: '800', marginTop: '8px' }}>
            खेलका सजिला नियमहरू (Easy Game Rules)
          </div>
        </div>

        {/* 3 Step Guide Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px', marginBottom: '32px' }}>
          {/* Step 1 */}
          <div
            style={{
              background: '#f0f9ff',
              border: '3.5px solid #7dd3fc',
              borderRadius: '24px',
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🔓</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0369a1', marginBottom: '8px' }}>
              1. Free Tiles Only
            </div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1.35, margin: 0 }}>
              Tiles must be free with their <b>Left or Right</b> side open and <b>no tile stacked on top</b>.
            </p>
            <div
              style={{
                marginTop: '14px',
                background: '#e0f2fe',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '800',
                color: '#0284c7'
              }}
            >
              🔒 Trapped tiles are dark grey
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: '#f0fdf4',
              border: '3.5px solid #86efac',
              borderRadius: '24px',
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>✨</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#15803d', marginBottom: '8px' }}>
              2. Match Word Pairs
            </div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1.35, margin: 0 }}>
              Find matching word relationships:
              <br />
              🔥 <b>Hot ↔ Cold</b> (Opposites)
              <br />
              😄 <b>Happy ↔ Glad</b> (Synonyms)
              <br />
              📚 <b>Book ↔ Read</b> (Partners)
            </p>
            <div
              style={{
                marginTop: '14px',
                background: '#dcfce7',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '800',
                color: '#16a34a'
              }}
            >
              🔊 Tap tiles to hear pronunciation
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: '#fefce8',
              border: '3.5px solid #fde047',
              borderRadius: '24px',
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🏔️</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#a16207', marginBottom: '8px' }}>
              3. Clear & Win
            </div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#334155', lineHeight: 1.35, margin: 0 }}>
              Clearing top & outer tiles unlocks the covered layers beneath! Clear all pairs to win 3 stars! ⭐
            </p>
            <div
              style={{
                marginTop: '14px',
                background: '#fef08a',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '800',
                color: '#854d0e'
              }}
            >
              💡 Use Hints & Undo if stuck!
            </div>
          </div>
        </div>

        {/* Got It Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              padding: '16px 56px',
              borderRadius: '24px',
              fontSize: '26px',
              fontWeight: '900',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
              border: '3px solid #bbf7d0'
            }}
          >
            👍 Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
