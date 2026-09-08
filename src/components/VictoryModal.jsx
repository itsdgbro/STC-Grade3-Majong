import React, { useEffect, useState } from 'react';

/**
 * Vibrant celebratory modal shown when children successfully clear all Mahjong pairs.
 */
export const VictoryModal = ({
  score,
  stars = 3,
  timeTaken,
  levelTitle,
  onNextLevel,
  onReplay,
  onLevelMap,
  onHome,
  hasNextLevel
}) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Generate celebratory confetti particles
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 10 + Math.random() * 16,
      color: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
      speed: 2 + Math.random() * 3,
      delay: Math.random() * 1.5,
      rotate: Math.random() * 360
    }));
    setConfetti(particles);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      {/* Falling Confetti Particles */}
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.id % 2 === 0 ? '50%' : '3px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.speed}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.9,
            pointerEvents: 'none'
          }}
        />
      ))}

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(1100px) rotate(720deg); opacity: 0.2; }
        }
      `}</style>

      {/* Main Victory Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '36px',
          border: '8px solid #facc15',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), 0 0 40px rgba(250, 204, 21, 0.5)',
          padding: '44px 56px',
          width: '680px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Celebration Banner */}
        <div
          style={{
            position: 'absolute',
            top: '-42px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899)',
            color: '#ffffff',
            padding: '14px 54px',
            borderRadius: '50px',
            fontSize: '34px',
            fontWeight: '900',
            boxShadow: '0 10px 24px rgba(239, 68, 68, 0.45)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            whiteSpace: 'nowrap'
          }}
        >
          🎉 Shabbash! Outstanding! 🎉
        </div>

        {/* Level Name */}
        <div style={{ marginTop: '32px', fontSize: '30px', fontWeight: '800', color: '#334155' }}>
          {levelTitle} Complete!
        </div>

        {/* Star Rating Display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '22px', margin: '24px 0' }}>
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              style={{
                fontSize: '76px',
                filter: starIndex <= stars ? 'drop-shadow(0 0 18px #facc15)' : 'grayscale(100%) opacity(0.3)',
                transform: starIndex <= stars ? 'scale(1.15)' : 'scale(0.9)',
                transition: 'all 0.3s ease'
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Score & Time Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            margin: '28px 0',
            background: '#f1f5f9',
            padding: '22px 36px',
            borderRadius: '26px'
          }}
        >
          <div>
            <div style={{ fontSize: '20px', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL SCORE</div>
            <div style={{ fontSize: '44px', color: '#0284c7', fontWeight: '900' }}>{score}</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px' }}>TIME TAKEN</div>
            <div style={{ fontSize: '44px', color: '#059669', fontWeight: '900' }}>{timeTaken}s</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '38px', flexWrap: 'wrap' }}>
          <button
            onClick={onLevelMap}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '18px 36px',
              borderRadius: '24px',
              fontSize: '24px',
              fontWeight: '900',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            🗺️ Levels
          </button>

          <button
            onClick={onReplay}
            style={{
              background: '#e2e8f0',
              color: '#1e293b',
              padding: '18px 36px',
              borderRadius: '24px',
              fontSize: '24px',
              fontWeight: '900',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            🔄 Replay
          </button>

          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                padding: '18px 46px',
                borderRadius: '24px',
                fontSize: '26px',
                fontWeight: '900',
                boxShadow: '0 8px 28px rgba(34, 197, 94, 0.45)',
                border: '3.5px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Next Level ➡️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
