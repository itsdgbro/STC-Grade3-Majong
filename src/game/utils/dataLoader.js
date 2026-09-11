import { flutterBridge } from './flutterBridge';

let cachedGameData = null;

/**
 * Loads game levels data.
 */
export async function loadGameLevels() {
  if (cachedGameData) {
    return cachedGameData;
  }

  // 1. Check window injected data (for Flutter / container injection)
  if (typeof window !== 'undefined' && window.__GAME_DATA__ && Array.isArray(window.__GAME_DATA__) && window.__GAME_DATA__.length > 0) {
    console.log('[DataLoader] Loaded levels from window.__GAME_DATA__');
    const firstLevel = window.__GAME_DATA__[0];
    const gameId = firstLevel?.gameId || firstLevel?.id || 'stc_bingo';
    const gameTitle = firstLevel?.headerBadge || firstLevel?.header || firstLevel?.headerTitle || firstLevel?.title || 'Grade 3 Nepali Bingo';
    flutterBridge.init({ gameId, gameTitle });
    cachedGameData = window.__GAME_DATA__;
    return cachedGameData;
  }

  const baseUrl = import.meta.env.BASE_URL || './';
  let targetFileName = null;

  // 2. Check if URL query parameter specifies the dataset (e.g. ?data=filename.json)
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const queryFile = urlParams.get('data') || urlParams.get('dataset');
    if (queryFile && queryFile.trim()) {
      targetFileName = queryFile.trim();
      console.log(`[DataLoader] URL query parameter specified dataset: "${targetFileName}"`);
    }
  }

  // 3. Fallback: If no URL parameter was provided, read the centralized data.json file
  if (!targetFileName) {
    try {
      const configPath = `${baseUrl}data/data.json`;
      const dataRes = await fetch(configPath);

      const isHtmlResponse = dataRes.headers.get('content-type')?.includes('text/html');
      if (!dataRes.ok || isHtmlResponse) {
        throw new Error(`Failed to fetch data.json (Status: ${dataRes.status})`);
      }

      const config = await dataRes.json();
      if (!config || typeof config.data !== 'string' || !config.data.trim()) {
        throw new Error('Field "data" missing or invalid in data.json');
      }

      targetFileName = config.data.trim();
    } catch (err) {
      console.error('[DataLoader] Centralized data.json could not be loaded:', err);
      throw new Error('Failed to fetch json file.');
    }
  }

  // 3. Search for the value of data in the directory and load it
  try {
    const cleanFileName = targetFileName.startsWith('data/') ? targetFileName : `data/${targetFileName}`;
    const datasetUrl = `${baseUrl}${cleanFileName}`;

    console.log(`[DataLoader] Centralized data.json pointed to: ${cleanFileName}. Fetching dataset...`);
    const datasetRes = await fetch(datasetUrl);

    const isHtmlResponse = datasetRes.headers.get('content-type')?.includes('text/html');
    if (!datasetRes.ok || isHtmlResponse) {
      throw new Error(`Failed to fetch dataset ${cleanFileName} (Status: ${datasetRes.status})`);
    }

    const json = await datasetRes.json();
    if (!json) {
      throw new Error(`Empty JSON response from ${cleanFileName}`);
    }

    // Configure flutterBridge with dynamic gameId (JSON filename) and gameTitle (header field from JSON)
    const gameId = targetFileName.replace(/^.*[\\/]/, '').replace(/\.json$/i, '');
    const firstLevel = Array.isArray(json) ? json[0] : json;
    const gameTitle = firstLevel?.headerBadge || firstLevel?.header || firstLevel?.headerTitle || firstLevel?.title || 'Grade 3 Nepali Bingo';

    flutterBridge.init({ gameId, gameTitle });
    console.log(`[DataLoader] Initialized FlutterBridge -> gameId: "${gameId}", gameTitle: "${gameTitle}"`);

    let result = null;
    // Support array of levels or level object containing questions
    if (Array.isArray(json) && json.length > 0) {
      console.log(`[DataLoader] Successfully loaded ${json[0]?.questions?.length || 0} questions from ${cleanFileName}`);
      result = json;
    } else if (json.questions && Array.isArray(json.questions) && json.questions.length > 0) {
      console.log(`[DataLoader] Successfully loaded single level object from ${cleanFileName}`);
      result = [json];
    } else {
      throw new Error(`Dataset ${cleanFileName} does not contain valid questions`);
    }

    cachedGameData = result;
    return result;
  } catch (err) {
    console.error(`[DataLoader] Error loading dataset "${targetFileName}":`, err);
    throw new Error('Failed to fetch json file.');
  }
}

export function getLoadedGameData() {
  return cachedGameData;
}

