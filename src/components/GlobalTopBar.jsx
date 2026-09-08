import React from 'react';
import { audio } from '../utils/audio';

/**
 * Standard Global Top-Left Toolbar Button Slots Component.
 * Implements the project-rules UI specification:
 * - Dynamic slot positions based on number of active buttons:
 *   - Slot 0: (100, 100) -> left: 62px, top: 62px
 *   - Slot 1: (220, 100) -> spacing 120px
 *   - Slot 2: (340, 100) -> spacing 120px
 * - Standard circular icon buttons with 76px diameter, centered origin, interactive scaling.
 */
export const GlobalTopBar = ({
  buttons = [],
  zIndex = 85
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '62px',
        left: '62px',
        display: 'flex',
        alignItems: 'center',
        gap: '44px', // 76px button width + 44px gap = 120px center-to-center spacing
        zIndex: zIndex,
        pointerEvents: 'auto'
      }}
    >
      {buttons.map((btn, index) => {
        if (!btn || btn.visible === false) return null;

        const isCircle = btn.variant !== 'pill';
        const bg = btn.active === false
          ? '#94a3b8'
          : btn.background || '#ffffff';
        const textColor = btn.color || '#1e293b';

        return (
          <button
            key={btn.id || index}
            onClick={() => {
              audio.playSelect();
              if (btn.onClick) btn.onClick();
            }}
            title={btn.title || btn.label}
            style={{
              width: isCircle ? '76px' : 'auto',
              height: '76px',
              minWidth: isCircle ? '76px' : '140px',
              padding: isCircle ? '0' : '0 28px',
              borderRadius: isCircle ? '50%' : '38px',
              background: bg,
              color: textColor,
              border: btn.border || '4px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0,0,0,0.2)',
              fontSize: btn.fontSize || '34px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transform: 'scale(1)',
              transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
            }}
          >
            <span>{btn.icon}</span>
            {btn.label && (
              <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.5px' }}>
                {btn.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
