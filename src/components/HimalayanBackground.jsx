import React from 'react';

/**
 * Renders a rich cartoon mountain landscape of Nepal with rolling green hills,
 * snowy Himalayan peaks, prayer flags, rhododendron flowers, drifting clouds, and sun rays,
 * complete with a classic green felt Mahjong playing table mat.
 */
export const HimalayanBackground = ({ themeGradient }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Sky & Theme Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: themeGradient || 'linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%)',
          transition: 'background 0.8s ease'
        }}
      />

      {/* Sun Glow & Orb */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '240px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.9) 0%, rgba(253, 224, 71, 0.4) 40%, rgba(250, 204, 21, 0) 70%)',
          filter: 'blur(20px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30px',
          right: '340px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fffbeb 20%, #fde047 70%, #eab308 100%)',
          boxShadow: '0 0 45px #facc15'
        }}
      />

      {/* Drifting Clouds */}
      <div
        style={{
          position: 'absolute',
          top: '55px',
          left: 0,
          animation: 'cloudDrift1 45s linear infinite',
          opacity: 0.85
        }}
      >
        <svg width="220" height="90" viewBox="0 0 200 80" fill="#ffffff">
          <ellipse cx="60" cy="50" rx="45" ry="25" />
          <ellipse cx="110" cy="40" rx="55" ry="32" />
          <ellipse cx="160" cy="50" rx="35" ry="20" />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: 0,
          animation: 'cloudDrift2 65s linear infinite',
          opacity: 0.7
        }}
      >
        <svg width="300" height="110" viewBox="0 0 240 90" fill="#ffffff">
          <ellipse cx="70" cy="60" rx="55" ry="30" />
          <ellipse cx="130" cy="45" rx="65" ry="40" />
          <ellipse cx="190" cy="60" rx="45" ry="25" />
        </svg>
      </div>

      {/* Distant Snow Mountains (Himalayas) */}
      <svg
        viewBox="0 0 1080 800"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: '360px',
          left: 0,
          right: 0,
          width: '100%',
          height: '520px',
          opacity: 0.95
        }}
      >
        <polygon points="0,700 120,420 380,220 540,550 720,700" fill="#cbd5e1" />
        <polygon points="380,220 340,300 380,320 410,280" fill="#f8fafc" />
        <polygon points="380,220 410,280 440,330 380,320" fill="#e2e8f0" />

        <polygon points="260,750 540,110 880,750" fill="#94a3b8" />
        <polygon points="540,110 470,220 520,250 540,230" fill="#ffffff" />
        <polygon points="540,110 540,230 590,260 620,210" fill="#e2e8f0" />

        <polygon points="650,750 900,200 1080,550 1080,750" fill="#cbd5e1" />
        <polygon points="900,200 850,290 900,310 930,260" fill="#ffffff" />
        <polygon points="900,200 930,260 970,300 900,310" fill="#e2e8f0" />
      </svg>

      {/* Prayer Flags (Nepal Dhoja) */}
      <svg
        viewBox="0 0 1080 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: '0',
          left: 0,
          right: 0,
          width: '100%',
          height: '110px',
          opacity: 0.85
        }}
      >
        <path d="M 0,20 Q 540,75 1080,20" fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="4 2" />
        {[
          { x: 60, y: 26, fill: '#2563eb' },
          { x: 150, y: 34, fill: '#f8fafc' },
          { x: 240, y: 42, fill: '#dc2626' },
          { x: 330, y: 48, fill: '#16a34a' },
          { x: 420, y: 52, fill: '#eab308' },
          { x: 510, y: 53, fill: '#2563eb' },
          { x: 600, y: 51, fill: '#f8fafc' },
          { x: 690, y: 47, fill: '#dc2626' },
          { x: 780, y: 41, fill: '#16a34a' },
          { x: 870, y: 33, fill: '#eab308' },
          { x: 960, y: 25, fill: '#2563eb' }
        ].map((flag, i) => (
          <polygon
            key={i}
            points={`${flag.x},${flag.y} ${flag.x + 42},${flag.y + 2} ${flag.x + 38},${flag.y + 48} ${flag.x - 4},${flag.y + 46}`}
            fill={flag.fill}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Midground Lush Green Hills */}
      <svg
        viewBox="0 0 1080 500"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: '0px',
          left: 0,
          right: 0,
          width: '100%',
          height: '620px',
          display: 'block'
        }}
      >
        <path d="M 0,240 Q 300,60 600,180 T 1080,120 L 1080,500 L 0,500 Z" fill="#22c55e" opacity="0.45" />
        <path d="M 0,300 Q 250,140 550,250 T 1080,180 L 1080,500 L 0,500 Z" fill="#16a34a" opacity="0.8" />
        <path d="M 0,370 Q 350,220 750,320 T 1080,260 L 1080,500 L 0,500 Z" fill="#15803d" />
      </svg>
    </div>
  );
};

