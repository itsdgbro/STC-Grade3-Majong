/**
 * Flutter <-> Webview Communication Bridge
 */
class FlutterBridgeService {
  constructor() {
    this.gameId = 'stc_grade3_mahjong';
    this.gameTitle = 'Grade 3 Vocabulary Mahjong';
    this.handlers = {};

    if (typeof window !== 'undefined') {
      window.onFlutterCommand = (command, data) => {
        this.emit(command, data);
      };
    }
  }

  on(event, callback) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(callback);
  }

  off(event, callback) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(cb => cb(data));
    }
  }

  sendLevelCompleted(score, details = {}) {
    const payload = {
      event: 'LEVEL_COMPLETED',
      gameId: this.gameId,
      gameTitle: this.gameTitle,
      timeStamp: Date.now(),
      score: score,
      ...details
    };

    const message = JSON.stringify(payload);

    if (window.FlutterBridge && typeof window.FlutterBridge.postMessage === 'function') {
      window.FlutterBridge.postMessage(message);
    } else if (window.flutter_inappwebview && typeof window.flutter_inappwebview.callHandler === 'function') {
      window.flutter_inappwebview.callHandler('FlutterBridge', message);
    } else {
      console.log('📡 [FlutterBridge] Dispatched event (Mock):', payload);
    }
  }
}

export const flutterBridge = new FlutterBridgeService();
