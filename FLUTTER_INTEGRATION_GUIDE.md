# 📱 Flutter <-> Game Communication Bridge Integration Guide

This guide details how to integrate and receive communication events from the Web Game in a Flutter Application (`webview_flutter` or `flutter_inappwebview`).

---

## 1. Outgoing Events (Game ➔ Flutter)

The game dispatches JSON strings over the `FlutterBridge` channel upon level completion.

### Event Format Schema
```json
{
  "event": "LEVEL_COMPLETED",
  "gameId": "stc_grade3_mahjong",
  "gameTitle": "Grade 3 Vocabulary Mahjong",
  "timeStamp": 1741421400000,
  "score": 450
}
```

---

## 2. Flutter Implementation Example (`webview_flutter`)

### Step 1: Add Dependency
In your Flutter `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.4.2
```

### Step 2: Configure WebViewController with JavaScriptChannel
```dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class GameScreen extends StatefulWidget {
  final String gameUrl;

  const GameScreen({Key? key, required this.gameUrl}) : super(key: key);

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      // Register the bridge channel named "FlutterBridge"
      ..addJavaScriptChannel(
        'FlutterBridge',
        onMessageReceived: (JavaScriptMessage message) {
          _handleGameMessage(message.message);
        },
      )
      ..loadRequest(Uri.parse(widget.gameUrl));
  }

  void _handleGameMessage(String jsonString) {
    try {
      final Map<String, dynamic> payload = jsonDecode(jsonString);
      final String event = payload['event'] ?? '';
      final String gameId = payload['gameId'] ?? '';
      final String gameTitle = payload['gameTitle'] ?? '';
      final int timeStamp = payload['timeStamp'] ?? 0;
      final int score = payload['score'] ?? 0;

      debugPrint('🎮 [$gameTitle] Received Event: $event');

      if (event == 'LEVEL_COMPLETED') {
        debugPrint('🏆 Level Completed!');
        debugPrint('Game ID: $gameId');
        debugPrint('Score: $score');
        debugPrint('Timestamp: $timeStamp');

        _onLevelCompleted(gameId, score, timeStamp);
      }
    } catch (e) {
      debugPrint('Error parsing game message: $e');
    }
  }

  void _onLevelCompleted(String gameId, int score, int timeStamp) {
    // Show native Flutter dialog or persist progress to database/API
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Level Finished! Game: $gameId | Score: $score'),
        backgroundColor: Colors.green,
      ),
    );
  }

  // Send commands into the game from Flutter
  void sendCommandToGame(String command) {
    _controller.runJavaScript('window.onFlutterCommand("$command", {})');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
```

---

## 3. Incoming Commands (Flutter ➔ Game)

Flutter can control the game state anytime by invoking JavaScript:

```dart
// Pause Game
_controller.runJavaScript('window.onFlutterCommand("PAUSE")');

// Resume Game
_controller.runJavaScript('window.onFlutterCommand("RESUME")');

// Restart Current Level
_controller.runJavaScript('window.onFlutterCommand("RESTART")');
```

---

## 4. Reusing `flutterBridge.js` in other Games

To use this bridge in any other project (Phaser, React, PixiJS, Vue, plain JS):
1. Copy `src/utils/flutterBridge.js` to your new game repository.
2. Initialize it at game launch:
   ```javascript
   import { flutterBridge } from './flutterBridge';

   flutterBridge.init({
     gameId: 'your_game_id',
     gameTitle: 'Your Game Title'
   });
   ```
3. Call `flutterBridge.sendLevelCompleted(finalScore)` when the level is cleared:
   ```javascript
   flutterBridge.sendLevelCompleted(totalFinalScore);
   ```
4. Listen for commands with `flutterBridge.on('PAUSE', () => { ... })`.
