import React from 'react';
import { audio } from '../utils/audio';

/**
 * Standard Pause Modal Panel:
 * Displayed when user clicks Pause button in-game.
 * Options: Resume, Restart Level, Quit (navigates back to Level Selection).
 */
export const PauseModal = ({
  onResume,
  onRestart,
  onQuit
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 150,
        animation: 'popIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '40px',
          border: '8px solid #facc15',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55), 0 0 50px rgba(250, 204, 21, 0.4)',
          padding: '46px 60px',
          width: '620px',
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#1e293b',
            marginBottom: '6px',
            fontFamily: "'Fredoka', sans-serif"
          }}
        >
          ⏸️ Game Paused
        </div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#64748b', marginBottom: '38px' }}>
          खेल रोकिएको छ (Game is Paused)
        </div>

        {/* Action Buttons List: Resume, Restart, Quit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '10px' }}>
          {/* Resume Button */}
          <button
            onClick={() => {
              audio.playSelect();
              onResume();
            }}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              padding: '18px 0',
              borderRadius: '24px',
              fontSize: '28px',
              fontWeight: '900',
              border: '4px solid #bbf7d0',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span>Resume Game</span>
          </button>

          {/* Restart / Replay Level Button */}
          <button
            onClick={() => {
              audio.playSelect();
              onRestart();
            }}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              padding: '18px 0',
              borderRadius: '24px',
              fontSize: '26px',
              fontWeight: '900',
              border: '4px solid #bae6fd',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span>Restart Level</span>
          </button>

          {/* Quit Button (Navigates to Level Selection) */}
          <button
            onClick={() => {
              audio.playSelect();
              onQuit();
            }}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              padding: '18px 0',
              borderRadius: '24px',
              fontSize: '26px',
              fontWeight: '900',
              border: '4px solid #fecaca',
              boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span>Quit</span>
          </button>
        </div>

        {/* Bottom Right Circular Close Button with X cross icon */}
        <button
          onClick={() => {
            audio.playSelect();
            onResume();
          }}
          title="Close"
          style={{
            position: 'absolute',
            bottom: '-28px',
            right: '-28px',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            border: '4px solid #ffffff',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.5), 0 0 16px rgba(0, 0, 0, 0.25)',
            fontSize: '30px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.12)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(220, 38, 38, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.5), 0 0 16px rgba(0, 0, 0, 0.25)';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
