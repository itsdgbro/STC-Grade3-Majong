import React, { useEffect, useState } from 'react';
import { audio } from '../utils/audio';

/**
 * RoundCompleteModal:
 * Clean, celebratory pop-up shown when all words in the round are solved.
 * Features large background height, bold typography with all small text clutter removed.
 */
export const RoundCompleteModal = ({
  round = 1,
  totalRounds = 5,
  wordsCount = 4,
  words = [],
  score = 0,
  onNextRound
}) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Generate playful confetti particles
    const particles = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 10 + Math.random() * 14,
      color: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][
        Math.floor(Math.random() * 7)
      ],
      speed: 2.2 + Math.random() * 2.5,
      delay: Math.random() * 1.2,
      rotate: Math.random() * 360
    }));
    setConfetti(particles);

    if (typeof audio.playVictory === 'function') {
      audio.playVictory();
    }
  }, []);

  const handleNextClick = () => {
    if (typeof audio.playSelect === 'function') {
      audio.playSelect();
    }
    if (onNextRound) {
      onNextRound();
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

      {/* Main Dialog Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '48px',
          border: '8px solid #facc15',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.55), 0 0 45px rgba(250, 204, 21, 0.35)',
          padding: '84px 64px 72px 64px',
          width: '820px',
          minHeight: '960px',
          maxWidth: '95%',
          maxHeight: '90%',
          boxSizing: 'border-box',
          textAlign: 'center',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '76px',
            fontWeight: '900',
            color: '#0f172a',
            margin: '0 0 40px 0',
            fontFamily: "'Fredoka', sans-serif",
            letterSpacing: '1.5px',
            lineHeight: 1.05
          }}
        >
          Round {round} Completed! 🎉
        </h2>

        {/* Big Stats Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            width: '100%',
            marginBottom: '40px'
          }}
        >
          {/* Words Solved Card */}
          <div
            style={{
              flex: 1,
              background: '#f1f5f9',
              border: '3px solid #cbd5e1',
              borderRadius: '30px',
              padding: '28px 30px'
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#64748b',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              Words Solved
            </div>
            <div
              style={{
                fontSize: '68px',
                fontWeight: '900',
                color: '#10b981',
                fontFamily: "'Fredoka', sans-serif",
                lineHeight: 1
              }}
            >
              {wordsCount}/{wordsCount}
            </div>
          </div>

          {/* Points Card */}
          <div
            style={{
              flex: 1,
              background: '#f1f5f9',
              border: '3px solid #cbd5e1',
              borderRadius: '30px',
              padding: '28px 30px'
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#64748b',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              Points
            </div>
            <div
              style={{
                fontSize: '68px',
                fontWeight: '900',
                color: '#f59e0b',
                fontFamily: "'Fredoka', sans-serif",
                lineHeight: 1
              }}
            >
              {score} PTS
            </div>
          </div>
        </div>

        {/* Solved Words Tag List (Big, clear word tags in 2 columns x 2 rows) */}
        {words && words.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px 20px',
              marginBottom: '44px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {words.map((w, i) => (
              <div
                key={`${w}-${i}`}
                style={{
                  background: '#f8fafc',
                  color: '#0f172a',
                  padding: '14px 24px',
                  borderRadius: '24px',
                  fontSize: '28px',
                  fontWeight: '900',
                  border: '3px solid #cbd5e1',
                  fontFamily: "'Fredoka', sans-serif",
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Big Next Round Button */}
        <button
          onClick={handleNextClick}
          style={{
            width: '100%',
            height: '96px',
            borderRadius: '30px',
            backgroundColor: '#22c55e',
            border: 'none',
            borderBottom: '8px solid #16a34a',
            color: '#ffffff',
            fontSize: '38px',
            fontWeight: '900',
            cursor: 'pointer',
            fontFamily: "'Fredoka', sans-serif",
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.42)',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Next Round
        </button>
      </div>
    </div>
  );
};
