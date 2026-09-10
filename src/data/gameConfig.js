/**
 * Game Configuration
 * Adjust round progression, pair spawn counts, and session rules here.
 */
export const GAME_CONFIG = {
  // Select the JSON file to load game data from
  DATA_FILE: 'crossword_words.json',

  // Total continuous rounds in the game (e.g. 5 rounds)
  TOTAL_ROUNDS: 5,

  // Total player lives (hearts)
  MAX_HEARTS: 5,

  // Number of words to randomly pick and generate in crossword per round (4-8)
  WORDS_PER_ROUND: 5,

  // Star scoring target times (seconds)
  STAR_TIMES: {
    THREE_STARS: 120,
    TWO_STARS: 240
  },

  // Number of hints granted per round
  HINTS_PER_ROUND: 3,

  // Points awarded per correct word
  SCORE_PER_WORD: 3,

  // Extra distractor alphabets to add to keyboard to keep game confusing
  EXTRA_DISTRACTOR_LETTERS: 3,

  // AFK Idle cooldown timeout in seconds before auto-pausing
  AFK_COOLDOWN_SECONDS: 45
};
