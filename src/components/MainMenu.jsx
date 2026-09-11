import React from 'react';
import { audio } from '../utils/audio';

/**
 * Main Menu Scene: Focused, clean, and child-friendly.
 * Displays only the game title, subtitle, and prominent "Play Game" button in the center.
 */
export const MainMenu = ({
  headerBadge = "SAVE THE CHILDREN • GRADE 3 ENGLISH",
  title = "Himalayan Word Mahjong",
  subtitle = "हिमाली शब्द माजोङ",
  onPlay
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
        zIndex: 40,
        boxSizing: 'border-box',
        padding: '40px'
      }}
    >
      {/* Center Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(12px)',
          padding: '60px 80px',
          borderRadius: '48px',
          border: '6px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.5), 0 0 50px rgba(250, 204, 21, 0.25)'
        }}
      >
        {/* Nepal Flag & Grade Badge */}
        {headerBadge && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(255, 255, 255, 0.98)',
              padding: '12px 36px',
              borderRadius: '50px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              border: '4px solid #facc15',
              marginBottom: '28px'
            }}
          >
            <span style={{ fontSize: '32px' }}>🇳🇵</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', letterSpacing: '1px' }}>
              {headerBadge}
            </span>
          </div>
        )}

        {/* Big Game Title */}
        <h1
          style={{
            fontSize: '92px',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '0 8px 30px rgba(0,0,0,0.85), 0 0 50px rgba(250, 204, 21, 0.7)',
            margin: '0 0 12px 0',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            fontFamily: "'Fredoka', sans-serif"
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: '34px',
              fontWeight: '800',
              color: '#fef08a',
              textShadow: '0 4px 12px rgba(0,0,0,0.85)',
              marginBottom: '54px'
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Center Prominent Play Game Button */}
        <button
          onClick={() => {
            audio.playSelect();
            onPlay();
          }}
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#ffffff',
            padding: '28px 90px',
            borderRadius: '40px',
            fontSize: '44px',
            fontWeight: '900',
            border: '6px solid #bbf7d0',
            boxShadow: '0 16px 50px rgba(34, 197, 94, 0.65), 0 0 40px rgba(34, 197, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 22px 60px rgba(34, 197, 94, 0.8), 0 0 50px rgba(34, 197, 94, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 16px 50px rgba(34, 197, 94, 0.65), 0 0 40px rgba(34, 197, 94, 0.4)';
          }}
        >
          <span>PLAY GAME</span>
        </button>
      </div>
    </div>
  );
};
