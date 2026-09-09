import { LEVELS as FALLBACK_LEVELS } from '../data/gameData';

/**
 * Loads game levels data.
 * Checks priority:
 * 1. window.__GAME_DATA__ (Injected by Flutter / WebView / Host container)
 * 2. URL query param `?data=path/to/custom.json` or `?dataset=filename.json`
 * 3. Local build folder JSON `data/levels.json` (or `./data/levels.json`)
 * 4. Bundled fallback JS data (guarantees zero crash even offline)
 */
export async function loadGameLevels() {
  // 1. Check window injected data
  if (typeof window !== 'undefined' && window.__GAME_DATA__ && Array.isArray(window.__GAME_DATA__)) {
    console.log('[DataLoader] Loaded levels from window.__GAME_DATA__');
    return window.__GAME_DATA__;
  }

  // 2. Check URL search params
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    const customUrl = params.get('data') || (params.get('dataset') ? `data/${params.get('dataset')}` : null);

    if (customUrl) {
      try {
        console.log(`[DataLoader] Fetching levels from query param: ${customUrl}`);
        const res = await fetch(customUrl);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            return json;
          }
        }
      } catch (err) {
        console.warn(`[DataLoader] Failed to load from ${customUrl}:`, err);
      }
    }
  }

  // 3. Check build folder data/levels.json
  try {
    // Relative path works correctly whether hosted under root or subfolder
    const jsonPath = (import.meta.env.BASE_URL || './') + 'data/levels.json';
    const res = await fetch(jsonPath);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        console.log('[DataLoader] Loaded levels from build folder data/levels.json');
        return json;
      }
    }
  } catch (err) {
    console.warn('[DataLoader] Failed to fetch data/levels.json:', err);
  }

  // 4. Fallback bundled data
  console.log('[DataLoader] Using fallback bundled levels');
  return FALLBACK_LEVELS;
}
