/**
 * Game Configuration
 * Adjust round progression, pair spawn counts, and session rules here.
 */
export const GAME_CONFIG = {
  // Select the JSON file to load game data from
  DATA_FILE: 'Grade-3-English-final.json',

  // Total continuous rounds in the game (e.g., 3)
  TOTAL_ROUNDS: 3,

  // Number of pairs to spawn per round (e.g. 2, 3, 4, 6, 8, 10, 12, 14)
  // 2 pairs = 4 tiles
  // 3 pairs = 6 tiles
  // 4 pairs = 8 tiles
  // 6 pairs = 12 tiles
  // 8 pairs = 16 tiles
  // 10 pairs = 20 tiles
  // 12 pairs = 24 tiles
  // 14 pairs = 28 tiles
  PAIRS_PER_ROUND: 6,

  // Tile Sizing & Dimensions
  TILE_SIZE: {
    // Base tile width in pixels (landscape profile)
    BASE_WIDTH: 280,
    // Base tile height in pixels
    BASE_HEIGHT: 220,
    // Maximum tile width when expanding for long words
    MAX_WIDTH: 400,
    // Proportional horizontal grid step ratio relative to tile width
    UNIT_X_RATIO: 0.48,
    // Vertical grid step in pixels
    UNIT_Y: 120
  },

  // Star scoring target times (seconds)
  STAR_TIMES: {
    THREE_STARS: 90,
    TWO_STARS: 150
  },

  // Number of hints granted per round
  HINTS_PER_ROUND: 3,

  // Points awarded per correct match
  SCORE_PER_MATCH: 100,

  // AFK Idle cooldown timeout in seconds before auto-pausing (e.g. 30 seconds)
  AFK_COOLDOWN_SECONDS: 30
};


