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
  geometry,
  isFree,
  isSelected,
  isHinted,
  isMismatch,
  isMatched,
  isJustUnlocked,
  onClick
}) => {
  if (isMatched) return null;

  // Geometry dimensions - Dynamic or wide landscape defaults
  const tileWidth = geometry?.tileWidth || 280;
  const tileHeight = geometry?.tileHeight || 220;
  const unitX = geometry?.unitX || 135;
  const unitY = geometry?.unitY || 120;

  // Layer elevation calculation with layout origin normalization
  const layerHeight = tile.z * 18; // 18px 3D height per layer
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
    jadeBack = '#065f46';
    textColor = '#14532d';
    transformStyle = 'scale(1.04) translateY(-6px)';
    dropShadowStyle = '0 0 40px rgba(34, 197, 94, 0.9), 0 20px 32px rgba(0,0,0,0.4)';
  }

  // Dynamic font sizing based on word length to ensure massive words for short terms, scaling down for long math/Nepali expressions
  const wordLen = tile.word ? tile.word.length : 0;
  const calculatedFontSize = !tile.icon
    ? (wordLen <= 5
        ? '52px'
        : wordLen <= 8
        ? '46px'
        : wordLen <= 12
        ? '38px'
        : wordLen <= 18
        ? '32px'
        : wordLen <= 24
        ? '27px'
        : '24px')
    : (wordLen <= 4
        ? '44px'
        : wordLen <= 7
        ? '38px'
        : wordLen <= 10
        ? '32px'
        : wordLen <= 15
        ? '26px'
        : '22px');

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
        pointerEvents: isFree ? 'auto' : 'none',
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
        {/* Header: Status Indicator (Lock when blocked) */}
        {!isFree && (
          <div style={{ position: 'absolute', top: '10px', right: '12px', zIndex: 5 }}>
            <span style={{ fontSize: '20px', opacity: 0.85 }} title="Blocked: unblock outer sides">
              🔒
            </span>
          </div>
        )}

        {/* Top visual balancing spacer when there is no icon to keep word centered with relation ribbon */}
        {!tile.icon && tile.relation && (
          <div style={{ height: '12px', pointerEvents: 'none', visibility: 'hidden' }} />
        )}

        {/* Central Illustration: Image or Emoji (only rendered if icon exists) */}
        {tile.icon ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              overflow: 'hidden',
              margin: '4px 0'
            }}
          >
            {(() => {
              let iconSrc = tile.icon;
              if (typeof iconSrc === 'string' && (iconSrc.includes('drive.google.com') || iconSrc.includes('drive.usercontent.google.com'))) {
                const match = iconSrc.match(/\/d\/([a-zA-Z0-9_-]+)/) || iconSrc.match(/id=([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                  // High-reliability direct thumbnail proxy for public Google Drive images
                  iconSrc = `https://lh3.googleusercontent.com/d/${match[1]}`;
                }
              }

              // Automatic addressable resolution: If given a simple filename like "mountain.png", "mountain.jpg" or "mountain.webp"
              if (typeof iconSrc === 'string' && iconSrc && !iconSrc.startsWith('http') && !iconSrc.startsWith('/') && !iconSrc.startsWith('./') && !iconSrc.startsWith('data:')) {
                if (/\.(png|jpe?g|svg|webp|gif|avif)$/i.test(iconSrc)) {
                  const basePath = import.meta.env.BASE_URL || './';
                  iconSrc = `${basePath}images/${iconSrc.replace(/^images\//, '')}`;
                }
              }

              const isImage = typeof iconSrc === 'string' && (
                iconSrc.startsWith('http://') ||
                iconSrc.startsWith('https://') ||
                iconSrc.startsWith('data:image/') ||
                iconSrc.startsWith('/') ||
                iconSrc.startsWith('./') ||
                iconSrc.includes('images/') ||
                iconSrc.includes('assets/') ||
                /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(iconSrc) ||
                iconSrc.includes('googleusercontent.com')
              );

              if (isImage) {
                return (
                  <img
                    src={iconSrc}
                    alt={tile.word || 'Tile visual'}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{
                      maxWidth: '240px',
                      maxHeight: tile.word ? '105px' : '155px',
                      objectFit: 'contain',
                      borderRadius: '14px',
                      opacity: iconOpacity,
                      filter: !isFree ? 'grayscale(90%)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))',
                      transition: 'transform 0.2s ease'
                    }}
                    onError={(e) => {
                      // Fallback to direct export url if lh3 is blocked
                      if (tile.icon && tile.icon.includes('drive.google.com') && !e.target.dataset.triedFallback) {
                        const match = tile.icon.match(/\/d\/([a-zA-Z0-9_-]+)/) || tile.icon.match(/id=([a-zA-Z0-9_-]+)/);
                        if (match && match[1]) {
                          e.target.dataset.triedFallback = 'true';
                          e.target.src = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
                          return;
                        }
                      }
                      e.target.style.display = 'none';
                    }}
                  />
                );
              }

              return (
                <div
                  style={{
                    fontSize: tile.word ? '72px' : '84px',
                    opacity: iconOpacity,
                    filter: !isFree ? 'grayscale(90%)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.22))',
                    lineHeight: 1,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {tile.icon}
                </div>
              );
            })()}
          </div>
        ) : null}

        {/* Vocabulary Word Display - Rendered if word exists */}
        {tile.word ? (
          <div
            style={{
              flex: !tile.icon ? 1 : '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '2px 6px',
              boxSizing: 'border-box',
              margin: !tile.icon ? '0' : '0 0 2px 0'
            }}
          >
            <div
              style={{
                fontSize: calculatedFontSize,
                fontWeight: '800',
                color: textColor,
                textAlign: 'center',
                width: '100%',
                lineHeight: 1.28,
                paddingTop: '3px',
                paddingBottom: '2px',
                letterSpacing: '-0.2px',
                fontFamily: "'Mukta', 'Fredoka', sans-serif",
                wordBreak: wordLen > 14 ? 'break-word' : 'normal',
                overflowWrap: 'break-word',
                maxHeight: !tile.icon ? '134px' : '72px',
                display: '-webkit-box',
                WebkitLineClamp: !tile.icon ? 3 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {tile.word}
            </div>
          </div>
        ) : null}

        {/* Relation Tag Ribbon */}
        {tile.relation ? (
          <div
            style={{
              fontSize: tile.relation.length > 22 ? '17px' : tile.relation.length > 15 ? '19px' : '21px',
              fontWeight: '700',
              padding: '4px 16px',
              borderRadius: '12px',
              background: isFree 
                ? (isSelected ? 'rgba(113, 63, 18, 0.25)' : 'rgba(2, 132, 199, 0.22)') 
                : 'rgba(0, 0, 0, 0.35)',
              color: isFree ? (isSelected ? '#713f12' : '#0369a1') : '#d6d3d1',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              maxWidth: '94%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              lineHeight: 1.3,
              fontFamily: "'Mukta', 'Fredoka', sans-serif"
            }}
          >
            {tile.relation}
          </div>
        ) : null}
      </div>
    </div>
  );
};
