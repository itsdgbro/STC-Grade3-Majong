/**
 * Standard UI Positioning Constants and Slot Calculators (1920x1080)
 */
export const UIPositions = {
  // Screen Anchors
  SCREEN_CENTER: { x: 960, y: 540 },
  TOP_HUD_CENTER: { x: 960, y: 55 },
  BOTTOM_ACTION_CENTER: { x: 960, y: 950 },

  // Top-Left Toolbar Configuration
  TOOLBAR_START: { x: 100, y: 100 },
  TOOLBAR_SPACING: 120,

  /**
   * Calculates top-left dynamic button position based on slot index
   * Slot 0: (100, 100)
   * Slot 1: (220, 100)
   * Slot 2: (340, 100)
   * @param {number} slotIndex
   * @returns {{x: number, y: number}}
   */
  getTopLeftButtonPos(slotIndex) {
    return {
      x: this.TOOLBAR_START.x + slotIndex * this.TOOLBAR_SPACING,
      y: this.TOOLBAR_START.y
    };
  },

  /**
   * Top-Right Toolbar Slot calculation
   * @param {number} slotIndex (0 = rightmost, 1 = next to left...)
   * @returns {{x: number, y: number}}
   */
  getTopRightButtonPos(slotIndex) {
    return {
      x: 1920 - (100 + slotIndex * this.TOOLBAR_SPACING),
      y: this.TOOLBAR_START.y
    };
  }
};
