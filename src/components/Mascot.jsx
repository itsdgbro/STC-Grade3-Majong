import React from 'react';

/**
 * Animated Mascot: Pema the friendly Snow Leopard & English Explorer.
 * Gives contextual tips, praises successful matches, and reacts to gameplay.
 */
export const Mascot = ({ tip, mood = 'happy', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '18px',
        left: '28px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
        zIndex: 25,
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Mascot Character Avatar SVG */}
      <div
        style={{
          width: '156px',
          height: '156px',
          animation: 'bounceSlow 3s ease-in-out infinite',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))',
          flexShrink: 0
        }}
      >
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          {/* Ears */}
          <polygon points="25,35 15,10 45,20" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <polygon points="24,30 20,16 38,22" fill="#fda4af" />
          <polygon points="95,35 105,10 75,20" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <polygon points="96,30 100,16 82,22" fill="#fda4af" />

          {/* Head */}
          <ellipse cx="60" cy="55" rx="42" ry="36" fill="#f8fafc" stroke="#475569" strokeWidth="3.5" />

          {/* Leopard Rosettes / Spots */}
          <circle cx="36" cy="36" r="4" fill="#94a3b8" />
          <circle cx="84" cy="36" r="4" fill="#94a3b8" />
          <circle cx="60" cy="28" r="3.5" fill="#94a3b8" />
          <circle cx="30" cy="52" r="3" fill="#cbd5e1" />
          <circle cx="90" cy="52" r="3" fill="#cbd5e1" />

          {/* Eyes */}
          {mood === 'celebrating' || mood === 'correct' ? (
            <>
              {/* Happy squint eyes ^^ */}
              <path d="M 40,48 Q 48,40 54,48" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <path d="M 66,48 Q 72,40 80,48" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Big sparkly curious eyes */}
              <circle cx="47" cy="48" r="8" fill="#0f172a" />
              <circle cx="73" cy="48" r="8" fill="#0f172a" />
              <circle cx="49" cy="45" r="3.2" fill="#ffffff" />
              <circle cx="75" cy="45" r="3.2" fill="#ffffff" />
              <circle cx="45" cy="51" r="1.5" fill="#ffffff" />
              <circle cx="71" cy="51" r="1.5" fill="#ffffff" />
            </>
          )}

          {/* Pink Cheeks */}
          <circle cx="35" cy="60" r="6" fill="#f43f5e" opacity="0.35" />
          <circle cx="85" cy="60" r="6" fill="#f43f5e" opacity="0.35" />

          {/* Cute Nose & Whiskers */}
          <polygon points="56,58 64,58 60,63" fill="#f43f5e" />
          <path d="M 60,63 L 60,68 Q 54,73 48,68 M 60,68 Q 66,73 72,68" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

          {/* Whiskers */}
          <line x1="28" y1="58" x2="10" y2="54" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="64" x2="12" y2="68" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <line x1="92" y1="58" x2="110" y2="54" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <line x1="92" y1="64" x2="108" y2="68" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

          {/* Traditional Nepali Dhaka Topi Hat */}
          <polygon points="38,24 60,4 82,24" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <polygon points="46,24 60,10 74,24" fill="#0284c7" />
          <circle cx="60" cy="4" r="3.5" fill="#fbbf24" />
        </svg>
      </div>

      {/* Speech Bubble - Compact & Clear */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '14px 24px',
          maxWidth: '460px',
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28)',
          border: '4px solid #facc15',
          position: 'relative',
          marginBottom: '6px'
        }}
      >
        <div style={{ fontSize: '17px', fontWeight: '900', color: '#d97706', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          🐾 Pema says:
        </div>
        <div style={{ fontSize: '21px', fontWeight: '800', color: '#1e293b', lineHeight: '1.3', fontFamily: "'Fredoka', sans-serif" }}>
          {tip || 'Match the word pairs to clear the board!'}
        </div>
        {/* Tail pointing to avatar */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '-18px',
            width: '0',
            height: '0',
            borderTop: '13px solid transparent',
            borderBottom: '13px solid transparent',
            borderRight: '20px solid #facc15'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '26px',
            left: '-11px',
            width: '0',
            height: '0',
            borderTop: '11px solid transparent',
            borderBottom: '11px solid transparent',
            borderRight: '15px solid #ffffff'
          }}
        />
      </div>
    </div>
  );
};
