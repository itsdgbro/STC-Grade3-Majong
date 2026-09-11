import React from 'react';
import { audio } from '../utils/audio';

/**
 * Crossword Grid Component
 * Displays the 2D crossword puzzle with numbered starting cells,
 * solved letters, active clue word highlighting, and hint reveals.
 */
export const CrosswordGrid = ({
  gridData,
  solvedWords = [], // Array of clean word strings solved so far, e.g. ['FARM', 'WASH']
  revealedLetters = {}, // Map of "r,c" -> letter for hints
  activeWord = null, // currently selected word object
  onSelectWord
}) => {
  if (!gridData || !gridData.matrix) return null;

  const { rows, cols, matrix, words, cellNumbers } = gridData;

  // Compute solved cell coordinates
  const solvedCells = new Set();
  words.forEach((w) => {
    if (solvedWords.includes(w.clean)) {
      for (let i = 0; i < w.clean.length; i++) {
        const r = w.direction === 'across' ? w.startRow : w.startRow + i;
        const c = w.direction === 'across' ? w.startCol + i : w.startCol;
        solvedCells.add(`${r},${c}`);
      }
    }
  });

  // Check if a cell belongs to the currently active word
  const isActiveCell = (r, c) => {
    if (!activeWord) return false;
    if (activeWord.direction === 'across') {
      return (
        r === activeWord.startRow &&
        c >= activeWord.startCol &&
        c < activeWord.startCol + activeWord.length
      );
    } else {
      return (
        c === activeWord.startCol &&
        r >= activeWord.startRow &&
        r < activeWord.startRow + activeWord.length
      );
    }
  };

  // Find word associated with cell when clicked
  const handleCellClick = (r, c) => {
    if (!matrix[r][c]) return;
    audio.playSelect();

    // Prefer words passing through this cell that are not yet solved
    const matchingWords = words.filter((w) => {
      if (w.direction === 'across') {
        return r === w.startRow && c >= w.startCol && c < w.startCol + w.length;
      } else {
        return c === w.startCol && r >= w.startRow && r < w.startRow + w.length;
      }
    });

    if (matchingWords.length === 0) return;

    // Toggle if clicking same cell or pick unsolved first
    if (matchingWords.length > 1 && activeWord && matchingWords.includes(activeWord)) {
      const other = matchingWords.find((w) => w !== activeWord);
      if (onSelectWord) onSelectWord(other);
    } else {
      const unsolved = matchingWords.find((w) => !solvedWords.includes(w.clean));
      if (onSelectWord) onSelectWord(unsolved || matchingWords[0]);
    }
  };

  // Dynamic Safe Grid Sizing System:
  // Strictly bounds the grid within SAFE_MAX_WIDTH and SAFE_MAX_HEIGHT for 1080px portrait screens.
  const SAFE_MAX_WIDTH = 940;
  const SAFE_MAX_HEIGHT = 580;

  // Responsive padding and gaps for larger word layouts (7+ letters)
  const isLargeGrid = Math.max(cols, rows) >= 7;
  const gap = isLargeGrid ? 6 : 8;
  const gridPad = isLargeGrid ? 16 : 22;

  // Calculate cell size that strictly fits within safe bounds
  const maxCellW = Math.floor((SAFE_MAX_WIDTH - gridPad * 2 - (Math.max(cols, 1) - 1) * gap) / Math.max(cols, 1));
  const maxCellH = Math.floor((SAFE_MAX_HEIGHT - gridPad * 2 - (Math.max(rows, 1) - 1) * gap) / Math.max(rows, 1));

  // Up to 115px for standard/shorter words, dynamically scaled down for 7+ letter words
  const maxSafeCell = Math.min(maxCellW, maxCellH);
  const cellSize = Math.max(46, Math.min(115, maxSafeCell));

  // Compute total grid footprint
  const totalGridWidth = cols * cellSize + (cols - 1) * gap + gridPad * 2;
  const totalGridHeight = rows * cellSize + (rows - 1) * gap + gridPad * 2;

  // Edge scale safety factor: automatically scales down if touching or nearing the edge
  const scaleX = totalGridWidth > SAFE_MAX_WIDTH ? SAFE_MAX_WIDTH / totalGridWidth : 1;
  const scaleY = totalGridHeight > SAFE_MAX_HEIGHT ? SAFE_MAX_HEIGHT / totalGridHeight : 1;
  const edgeScale = Math.min(scaleX, scaleY, 1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gap: `${gap}px`,
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.45)',
          padding: `${gridPad}px`,
          borderRadius: isLargeGrid ? '20px' : '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35), inset 0 2px 6px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          transform: edgeScale < 1 ? `scale(${edgeScale.toFixed(3)})` : 'none',
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease'
        }}
      >
        {matrix.map((row, r) =>
          row.map((char, c) => {
            const key = `${r},${c}`;
            if (!char) {
              return <div key={key} style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />;
            }

            const isSolved = solvedCells.has(key);
            const isRevealedByHint = revealedLetters[key];
            const active = isActiveCell(r, c);
            const cellNumber = cellNumbers[key];

            return (
              <div
                key={key}
                onClick={() => handleCellClick(r, c)}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: cellSize < 68 ? '10px' : cellSize < 85 ? '12px' : '16px',
                  backgroundColor: isSolved
                    ? '#ffffff'
                    : active
                    ? '#fef08a' // Warm light yellow highlight for active word
                    : '#f8fafc',
                  border: isSolved
                    ? `${cellSize < 68 ? 3 : 4}px solid #22c55e`
                    : active
                    ? `${cellSize < 68 ? 3 : 4}px solid #eab308`
                    : `${cellSize < 68 ? 3 : 4}px solid #cbd5e1`,
                  boxShadow: active
                    ? '0 0 16px rgba(234, 179, 8, 0.8), 0 4px 10px rgba(0,0,0,0.2)'
                    : isSolved
                    ? '0 0 14px rgba(34, 197, 94, 0.4), 0 4px 8px rgba(0,0,0,0.15)'
                    : '0 4px 10px rgba(0, 0, 0, 0.15)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Crossword Starting Number */}
                {cellNumber && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '6px',
                      fontSize: `${Math.max(12, Math.floor(cellSize * 0.22))}px`,
                      fontWeight: '800',
                      color: active ? '#854d0e' : '#64748b'
                    }}
                  >
                    {cellNumber}
                  </span>
                )}

                {/* Letter display (if solved or hinted) */}
                {(isSolved || isRevealedByHint) && (
                  <span
                    style={{
                      fontSize: `${Math.floor(cellSize * 0.58)}px`,
                      fontWeight: '900',
                      color: isSolved ? '#0f172a' : '#2563eb',
                      animation: 'popInLetter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      lineHeight: 1
                    }}
                  >
                    {char}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
