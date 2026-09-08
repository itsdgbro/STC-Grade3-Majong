import React from 'react';

/**
 * Authentic 3D Mahjong Tile Component.
 * 
 * Visual features:
 * - 3-layer classic construction: Ivory acrylic face, bone-white core, and jade/bamboo backing.
 * - Layer-dependent drop shadows simulating true multi-tier 3D elevation.
 * - Distinct states:
 *   - Free / Playable: Bright ivory face with subtle golden rim sheen and lift on hover.
 *   - Blocked: Realistic ambient occlusion shadow + engraved lock badge.
 *   - Newly Unlocked: Golden shine wave animation when uncovered.
 *   - Selected: Raised 3D translation with radiant golden aura.
 *   - Mismatch: Gentle wobble feedback.
 */
export const Tile = ({
  tile,
  isFree,
  isSelected,
  isHinted,
  isMismatch,
  isMatched,
  isJustUnlocked,
  onClick
}) => {
  if (isMatched) return null;

  // Geometry dimensions - Extra super-sized Mahjong tiles clearly dominating the screen
  const tileWidth = 184;
  const tileHeight = 230;
  const unitX = 86;
  const unitY = 106;

  // Layer elevation calculation with layout origin normalization
  const layerHeight = tile.z * 16; // 16px 3D height per layer
  const originX = tile.minX !== undefined ? tile.minX : 0;
  const originY = tile.minY !== undefined ? tile.minY : 0;
  const leftPx = (tile.x - originX) * unitX + (tile.z * 8);
  const topPx = (tile.y - originY) * unitY - layerHeight;

  // Dynamic colors and shadows based on state
  let frontBg = 'linear-gradient(175deg, #ffffff 0%, #fafaf9 65%, #f5f5f4 100%)';
  let faceBorder = '#d6d3d1';
  let sideDepth = '#e7e5e4';
  let jadeBack = '#065f46';
  let textColor = '#1c1917';
  let iconOpacity = 1.0;
  let transformStyle = 'scale(1)';

  // Cast shadow grows with higher layers
  const castShadowBlur = 16 + tile.z * 8;
  const castShadowSpread = 6 + tile.z * 3;
  let dropShadowStyle = `0 ${12 + tile.z * 6}px ${castShadowBlur}px ${castShadowSpread}px rgba(0,0,0,${0.42 + tile.z * 0.1})`;

  if (!isFree) {
    // Blocked & shaded ambient occlusion
    frontBg = 'linear-gradient(175deg, #78716c 0%, #57534e 60%, #44403c 100%)';
    faceBorder = '#44403c';
    sideDepth = '#292524';
    jadeBack = '#1c1917';
    textColor = '#d6d3d1';
    iconOpacity = 0.45;
  } else if (isSelected) {
    // Active selected
    frontBg = 'linear-gradient(175deg, #fef9c3 0%, #fef08a 60%, #facc15 100%)';
    faceBorder = '#ca8a04';
    sideDepth = '#a16207';
    jadeBack = '#713f12';
    textColor = '#713f12';
    transformStyle = 'scale(1.08) translateY(-14px)';
    dropShadowStyle = '0 0 42px rgba(250, 204, 21, 0.95), 0 22px 40px rgba(0,0,0,0.45)';
  } else if (isHinted) {
    // Hint state
    frontBg = 'linear-gradient(175deg, #dcfce7 0%, #86efac 60%, #22c55e 100%)';
    faceBorder = '#16a34a';
    sideDepth = '#15803d';
    jadeBack = '#14532d';
    textColor = '#14532d';
    transformStyle = 'scale(1.06) translateY(-8px)';
    dropShadowStyle = '0 0 40px rgba(34, 197, 94, 0.9), 0 20px 32px rgba(0,0,0,0.4)';
  }

  // Dynamic font sizing based on word length to ensure massive, bold, highly legible words for kids
  const wordLen = tile.word.length;
  const wordFontSize = wordLen <= 4 ? '44px' : wordLen <= 6 ? '38px' : '34px';

  return (
    <div
      onClick={() => isFree && onClick(tile)}
      style={{
        position: 'absolute',
        width: `${tileWidth}px`,
        height: `${tileHeight}px`,
        left: `${leftPx}px`,
        top: `${topPx}px`,
        zIndex: tile.z * 30 + Math.floor(tile.y) * 2 + (isSelected ? 99 : 0),
        cursor: isFree ? 'pointer' : 'not-allowed',
        transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease',
        transform: transformStyle,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        animation: isMismatch 
          ? 'wobbleError 0.4s ease' 
          : isJustUnlocked 
            ? 'unlockedFlash 0.8s ease' 
            : isHinted 
              ? 'pulseGlow 1.2s infinite' 
              : 'none'
      }}
    >
      <style>{`
        @keyframes unlockedFlash {
          0% { filter: brightness(1.7) drop-shadow(0 0 18px #fde047); transform: scale(1.1) translateY(-6px); }
          100% { filter: brightness(1); transform: scale(1); }
        }
      `}</style>

      {/* Layer 1: Jade/Bamboo Bottom Base with Deep 3D Drop Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-12px',
          right: '-10px',
          width: '100%',
          height: '100%',
          backgroundColor: jadeBack,
          borderRadius: '18px',
          boxShadow: dropShadowStyle
        }}
      />

      {/* Layer 2: Middle Bone Core Bevel Layer */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          right: '-5px',
          width: '100%',
          height: '100%',
          backgroundColor: sideDepth,
          borderRadius: '18px'
        }}
      />

      {/* Layer 3: Polished Front Ivory Tile Face with Inset Bevel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: frontBg,
          borderRadius: '24px',
          border: `4.5px solid ${faceBorder}`,
          boxShadow: isFree 
            ? 'inset 2px 2px 7px rgba(255,255,255,0.95), inset -2px -2px 7px rgba(0,0,0,0.22)' 
            : 'inset 0 0 18px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 12px 12px 12px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Header: Layer Number & Status Indicator */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: '900',
              color: isFree ? (isSelected ? '#713f12' : '#0284c7') : '#a8a29e',
              letterSpacing: '0.6px'
            }}
          >
            Tier {tile.z + 1}
          </span>

          {!isFree ? (
            <span style={{ fontSize: '20px', opacity: 0.85 }} title="Blocked: unblock top or sides">
              🔒
            </span>
          ) : (
            <span style={{ fontSize: '20px', opacity: 0.8 }} title="Click to pronounce">
              🔊
            </span>
          )}
        </div>

        {/* Central Illustration Icon */}
        <div
          style={{
            fontSize: '64px',
            opacity: iconOpacity,
            filter: !isFree ? 'grayscale(90%)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.22))',
            margin: '0',
            lineHeight: 1,
            transition: 'transform 0.2s ease'
          }}
        >
          {tile.icon}
        </div>

        {/* Vocabulary Word Display - Extra Large, Bold & Kid-Friendly */}
        <div
          style={{
            fontSize: wordFontSize,
            fontWeight: '900',
            color: textColor,
            textAlign: 'center',
            textTransform: 'capitalize',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.1,
            letterSpacing: '-0.4px',
            fontFamily: "'Fredoka', sans-serif"
          }}
        >
          {tile.word}
        </div>

        {/* Relation Tag Ribbon */}
        <div
          style={{
            fontSize: '17px',
            fontWeight: '900',
            padding: '5px 18px',
            borderRadius: '12px',
            background: isFree 
              ? (isSelected ? 'rgba(113, 63, 18, 0.25)' : 'rgba(2, 132, 199, 0.2)') 
              : 'rgba(0, 0, 0, 0.35)',
            color: isFree ? (isSelected ? '#713f12' : '#0369a1') : '#d6d3d1',
            letterSpacing: '0.6px',
            textTransform: 'uppercase'
          }}
        >
          {tile.relation}
        </div>
      </div>
    </div>
  );
};
