import React from 'react';
import { audio } from '../utils/audio';

/**
 * LetterKeyboard / Word Keyboard Component
 * Replaces circular dial with a clean row/column keyboard grid of letters.
 * Clicking a letter attempts to guess that letter for the active clue / word.
 * If correct, it reveals the letter in the crossword grid boxes!
 */
export const LetterKeyboard = ({
  letters = [], // Distinct or pooled letters for current puzzle, or full A-Z / word letters
  onLetterClick,
  onShuffle,
  disabled = false,
  activeWord = null,
  guessedLetters = new Set() // Set of letters already guessed/revealed
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '920px',
        padding: '10px 20px',
        userSelect: 'none'
      }}
    >
      {/* Keyboard Grid (Rows and Columns) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '20px 24px',
          borderRadius: '28px',
          border: '3px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          width: '100%'
        }}
      >
        {letters.map((letter, idx) => {
          const isGuessed = guessedLetters.has(letter);
          return (
            <button
              key={`${letter}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                audio.playSelect();
                if (onLetterClick) onLetterClick(letter);
              }}
              style={{
                width: '74px',
                height: '78px',
                borderRadius: '16px',
                background: isGuessed
                  ? 'linear-gradient(180deg, #334155 0%, #1e293b 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)',
                border: isGuessed
                  ? '3px solid #475569'
                  : '3px solid #94a3b8',
                borderBottom: isGuessed
                  ? '4px solid #334155'
                  : '6px solid #64748b',
                color: isGuessed ? '#94a3b8' : '#0f172a',
                fontSize: '36px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isGuessed
                  ? 'none'
                  : '0 6px 16px rgba(0, 0, 0, 0.35)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transform: isGuessed ? 'scale(0.96)' : 'scale(1)',
                transition: 'all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
                outline: 'none',
                touchAction: 'manipulation'
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isGuessed) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.06)';
                  e.currentTarget.style.boxShadow = '0 10px 22px rgba(56, 189, 248, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGuessed) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.35)';
                }
              }}
            >
              {letter}
            </button>
          );
        })}

        {/* Shuffle / Randomize Button */}
        {onShuffle && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              audio.playShuffle();
              onShuffle();
            }}
            title="Shuffle Keyboard Letters"
            style={{
              width: '74px',
              height: '78px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: '3px solid #93c5fd',
              borderBottom: '6px solid #1e40af',
              color: '#ffffff',
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.transform = 'translateY(-3px) scale(1.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            🔀
          </button>
        )}
      </div>
    </div>
  );
};
