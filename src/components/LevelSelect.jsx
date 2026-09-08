import React from 'react';
import { LEVELS } from '../data/gameData';
import { audio } from '../utils/audio';

/**
 * Level Selection Scene: Clean, spacious, and centered.
 * Large readable text, focused info, and vibrant clickable level cards.
 */
export const LevelSelect = ({
  levelProgress = {},
  onSelectLevel
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 60px',
        zIndex: 40,
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header Row with Centered Title */}
      <div
        style={{
          width: '100%',
          maxWidth: '1700px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '36px',
          textAlign: 'center'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: '900',
              color: '#ffffff',
              textShadow: '0 6px 18px rgba(0,0,0,0.85), 0 0 30px rgba(250, 204, 21, 0.5)',
              margin: 0,
              fontFamily: "'Fredoka', sans-serif",
              letterSpacing: '-0.5px'
            }}
          >
            🗺️ Select Level
          </h1>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#fef08a',
              textShadow: '0 3px 8px rgba(0,0,0,0.8)',
              marginTop: '6px'
            }}
          >
            खेलको स्तर रोज्नुहोस् (Grade 3 English)
          </div>
        </div>
      </div>

      {/* 5 Centered Level Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '28px',
          width: '100%',
          maxWidth: '1700px',
          alignItems: 'stretch'
        }}
      >
        {LEVELS.map((lvl, index) => {
          const progress = levelProgress[lvl.id] || { stars: 0, highScore: 0, completed: false };
          const isUnlocked = index === 0 || (levelProgress[LEVELS[index - 1]?.id]?.completed ?? false) || progress.stars > 0;
          const themeColor = lvl.themeColor || '#0284c7';

          return (
            <div
              key={lvl.id}
              onClick={() => {
                if (isUnlocked) {
                  audio.playSelect();
                  onSelectLevel(index);
                }
              }}
              style={{
                background: isUnlocked
                  ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
                  : 'linear-gradient(180deg, #64748b 0%, #475569 100%)',
                borderRadius: '36px',
                border: `6px solid ${isUnlocked ? themeColor : '#334155'}`,
                boxShadow: isUnlocked
                  ? '0 18px 40px rgba(0, 0, 0, 0.35), 0 0 24px rgba(255, 255, 255, 0.2)'
                  : '0 10px 24px rgba(0, 0, 0, 0.3)',
                padding: '30px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                transform: 'translateY(0)',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isUnlocked ? 1 : 0.72,
                position: 'relative',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.04)';
                  e.currentTarget.style.boxShadow = `0 24px 50px rgba(0, 0, 0, 0.5), 0 0 35px ${themeColor}`;
                }
              }}
              onMouseLeave={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.35)';
                }
              }}
            >
              {/* Top: Level Badge & Status */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <span
                    style={{
                      background: isUnlocked ? themeColor : '#334155',
                      color: '#ffffff',
                      padding: '8px 20px',
                      borderRadius: '20px',
                      fontSize: '22px',
                      fontWeight: '900',
                      letterSpacing: '0.8px'
                    }}
                  >
                    LEVEL {index + 1}
                  </span>

                  <span style={{ fontSize: '32px' }}>
                    {!isUnlocked ? '🔒' : progress.completed ? '✅' : '⭐'}
                  </span>
                </div>

                {/* Level Title - Big & Legible */}
                <h3
                  style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    color: isUnlocked ? '#1e293b' : '#f1f5f9',
                    margin: '14px 0 8px 0',
                    lineHeight: 1.2,
                    fontFamily: "'Fredoka', sans-serif"
                  }}
                >
                  {lvl.title}
                </h3>

                {/* Subtitle / Relationship Type - Clean & High Contrast */}
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: isUnlocked ? themeColor : '#cbd5e1',
                    marginBottom: '18px',
                    lineHeight: 1.3
                  }}
                >
                  {lvl.subtitle}
                </div>
              </div>

              {/* Bottom: Stars & Big Play Button */}
              <div>
                {/* 3 Stars Display */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  {[1, 2, 3].map((starIdx) => (
                    <span
                      key={starIdx}
                      style={{
                        fontSize: '44px',
                        filter: starIdx <= progress.stars ? 'drop-shadow(0 0 10px #facc15)' : 'grayscale(100%) opacity(0.3)',
                        transform: starIdx <= progress.stars ? 'scale(1.15)' : 'scale(0.95)'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Big Button */}
                <button
                  disabled={!isUnlocked}
                  style={{
                    width: '100%',
                    background: isUnlocked
                      ? `linear-gradient(135deg, ${themeColor} 0%, #0369a1 100%)`
                      : '#475569',
                    color: '#ffffff',
                    padding: '18px 0',
                    borderRadius: '24px',
                    fontSize: '26px',
                    fontWeight: '900',
                    boxShadow: isUnlocked ? `0 8px 24px ${themeColor}66` : 'none',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    border: isUnlocked ? '3px solid rgba(255,255,255,0.4)' : 'none'
                  }}
                >
                  {isUnlocked ? (progress.stars > 0 ? '🔄 Replay' : '▶️ Play') : '🔒 Locked'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
