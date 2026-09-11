/**
 * FlutterBridge - Modular & Reusable Game <-> Flutter Communication Layer
 * 
 * Works across Flutter WebView (webview_flutter), flutter_inappwebview,
 * web iframe embedding (window.parent.postMessage), and desktop browser debug modes.
 */

class FlutterBridgeService {
  constructor() {
    this.gameId = 'stc_mahjong';
    this.gameTitle = 'Himalayan Mahjong';
    // Only log to console if debug=true or ?debug_bridge=true in URL
    this.debug = false;
    this.listeners = new Map(); // Command name -> Set of callbacks
    this.messageHistory = [];
    this.maxHistoryLength = 30;

    this._setupWindowListeners();
  }

  /**
   * Configure global game identity & debug options
   * @param {Object} config
   * @param {string} [config.gameId]
   * @param {string} [config.gameTitle]
   * @param {boolean} [config.debug]
   */
  init({ gameId, gameTitle, debug } = {}) {
    if (gameId) this.gameId = gameId;
    if (gameTitle) this.gameTitle = gameTitle;
    if (typeof debug !== 'undefined') this.debug = Boolean(debug);

    this.log(`[FlutterBridge] Initialized for game: "${this.gameTitle}" (${this.gameId})`);
  }

  /**
   * Log messages if debug mode is active
   */
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  /**
   * Internal listener for incoming messages from Flutter or postMessage
   */
  _setupWindowListeners() {
    // 1. Listen for standard window.postMessage (if Flutter or parent iframe posts message to JS)
    window.addEventListener('message', (event) => {
      try {
        let payload = event.data;
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload);
          } catch (e) {
            // Not JSON, ignore
            return;
          }
        }
        if (payload && (payload.command || payload.action || payload.type)) {
          const cmd = payload.command || payload.action || payload.type;
          this._dispatchCommand(cmd, payload.data || payload);
        }
      } catch (err) {
        console.warn('[FlutterBridge] Error handling message event', err);
      }
    });

    // 2. Global explicit Flutter receiver function on window for direct JS evaluation
    // Flutter can call: webViewController.runJavaScript('window.onFlutterCommand("PAUSE", {})')
    window.onFlutterCommand = (command, data = {}) => {
      this._dispatchCommand(command, data);
    };
  }

  /**
   * Dispatch an incoming command to registered listeners
   */
  _dispatchCommand(command, data) {
    const cmdNormalized = String(command).toUpperCase();
    this.log(`[FlutterBridge] 📥 Received command: "${cmdNormalized}"`, data);

    this._recordHistory({
      direction: 'INCOMING',
      command: cmdNormalized,
      data,
      timestamp: Date.now()
    });

    const callbacks = this.listeners.get(cmdNormalized);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[FlutterBridge] Error in listener for "${cmdNormalized}"`, e);
        }
      });
    }
  }

  /**
   * Register a listener for a Flutter command (e.g. 'PAUSE', 'RESUME', 'RESTART', 'MUTE')
   * @param {string} command
   * @param {Function} callback
   */
  on(command, callback) {
    const cmd = String(command).toUpperCase();
    if (!this.listeners.has(cmd)) {
      this.listeners.set(cmd, new Set());
    }
    this.listeners.get(cmd).add(callback);
    return () => this.off(command, callback);
  }

  /**
   * Unregister a listener
   */
  off(command, callback) {
    const cmd = String(command).toUpperCase();
    if (this.listeners.has(cmd)) {
      this.listeners.get(cmd).delete(callback);
    }
  }

  /**
   * Core dispatch method to send message to Flutter
   * Schema: { event, gameId, gameTitle, timeStamp, score }
   * @param {string} eventName
   * @param {number|Object} scoreOrData
   */
  send(eventName, scoreOrData = 0) {
    const score = typeof scoreOrData === 'number' ? scoreOrData : (scoreOrData?.score || 0);

    const payload = {
      event: eventName,
      gameId: this.gameId,
      gameTitle: this.gameTitle,
      timeStamp: Date.now(),
      score: score
    };

    const jsonString = JSON.stringify(payload);
    let sentVia = [];

    // 1. Check window.FlutterBridge (JavascriptChannel in Flutter webview_flutter)
    if (window.FlutterBridge && typeof window.FlutterBridge.postMessage === 'function') {
      try {
        window.FlutterBridge.postMessage(jsonString);
        sentVia.push('window.FlutterBridge');
      } catch (err) {
        console.error('[FlutterBridge] Error posting to window.FlutterBridge', err);
      }
    }

    // 2. Check window.flutter_inappwebview (flutter_inappwebview plugin)
    if (window.flutter_inappwebview && typeof window.flutter_inappwebview.callHandler === 'function') {
      try {
        window.flutter_inappwebview.callHandler('FlutterBridge', jsonString);
        sentVia.push('window.flutter_inappwebview');
      } catch (err) {
        console.error('[FlutterBridge] Error posting to flutter_inappwebview', err);
      }
    }

    // 3. Fallback: window.parent.postMessage (if embedded in standard iframe/web wrapper)
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(payload, '*');
        sentVia.push('window.parent.postMessage');
      } catch (err) {
        console.error('[FlutterBridge] Error posting to window.parent', err);
      }
    }

    // Record for debug/history log
    this._recordHistory({
      direction: 'OUTGOING',
      event: eventName,
      payload,
      sentVia: sentVia.length > 0 ? sentVia : ['Console / Standalone Browser']
    });

    this.log(`[FlutterBridge] 📤 Sent "${eventName}" (${sentVia.join(', ') || 'Standalone Simulator'}):`, payload);

    return payload;
  }

  /**
   * Send Level Completed event to Flutter
   * Output payload: { event: "LEVEL_COMPLETED", gameId, gameTitle, timeStamp, score }
   * @param {number|Object} score
   */
  sendLevelCompleted(score = 0) {
    const finalScore = typeof score === 'object' ? (score.score || 0) : Number(score) || 0;
    return this.send('LEVEL_COMPLETED', finalScore);
  }

  /**
   * Send Game Over event to Flutter
   * Output payload: { event: "GAME_OVER", gameId, gameTitle, timeStamp, score }
   * @param {number|Object} score
   */
  sendGameOver(score = 0) {
    const finalScore = typeof score === 'object' ? (score.score || 0) : Number(score) || 0;
    return this.send('GAME_OVER', finalScore);
  }

  _recordHistory(item) {
    this.messageHistory.unshift(item);
    if (this.messageHistory.length > this.maxHistoryLength) {
      this.messageHistory.pop();
    }
  }

  getHistory() {
    return [...this.messageHistory];
  }

  isFlutterEnvironment() {
    return Boolean(
      (window.FlutterBridge && typeof window.FlutterBridge.postMessage === 'function') ||
      (window.flutter_inappwebview && typeof window.flutter_inappwebview.callHandler === 'function')
    );
  }
}

export const flutterBridge = new FlutterBridgeService();

// Expose directly to window for easy browser DevTools console testing
if (typeof window !== 'undefined') {
  window.flutterBridge = flutterBridge;
}

export default flutterBridge;
