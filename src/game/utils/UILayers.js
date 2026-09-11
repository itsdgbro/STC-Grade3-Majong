/**
 * Standard UI Depth Layers according to project architecture
 * Layer 0: Game (0 - 20)
 * Layer 1: Non-Blocking UI / HUD (100 - 130)
 * Layer 2: Full Overlays (900 - 1030)
 * Layer 3: Top Modals (10000+)
 */
export const UILayers = {
  // Layer 0: Game
  GAME_BACKGROUND: 0,
  GAME_TILES: 10,
  GAME_PLAYER: 15,
  GAME_EFFECTS: 20,

  // Layer 1: Non-Blocking UI / HUD
  UI_BACKGROUND_PANELS: 100,
  UI_TEXT: 110,
  UI_BUTTONS: 120,
  UI_ICONS: 130,
  HUD: 120,

  // Layer 2: Full Overlays
  OVERLAY_BLOCKER: 900,
  OVERLAY_BACKGROUND: 1000,
  OVERLAY_PANEL: 1010,
  OVERLAY_TEXT: 1020,
  OVERLAY_BUTTONS: 1030,

  // Layer 3: Top Modals
  MODAL_BACKGROUND: 10000,
  MODAL_PANEL: 10010,
  MODAL_TEXT: 10020,
  MODAL_BUTTONS: 10030,
  MODAL_CONTROLS: 10040,
  MODALS: 10010
};
