# 🐛 Game Glitch Fix: UI Tiles Cut Off in Flutter InAppWebView

**Date:** 2026-09-11  
**Project:** STC Grade 3 Mahjong Revamp  
**Affected Environment:** Android (flutter_inappwebview)  
**Status:** ✅ Fixed

---

## 🔍 The Symptom

When the game was loaded inside the Flutter app via `flutter_inappwebview`, some **Mahjong tiles were visually cut off** along sharp, rectangular grid lines:

- The bottom row of tiles was sliced cleanly in half horizontally.
- Tiles in the bottom-right of the second row were completely invisible.
- The background (mountains, clouds) was visible behind them — meaning the game container existed, but the **GPU compositor dropped the raster tiles** covering that region.

The bug did **not** occur in a desktop browser or Chrome on Android (standalone URL).  
It was **exclusive to the Flutter InAppWebView** context.

---

## 🔬 Root Cause Analysis

### Cause 1 — `will-change: transform` on a 1920×1080 Element

In `src/index.css`, the `.game-viewport` class had:

```css
.game-viewport {
  width: 1920px;
  height: 1080px;
  will-change: transform;   /* ← THE CULPRIT */
}
```

The device screenshot was **2776 × 1281 px** at ~2.5–3.0 DPR. This meant the browser needed to allocate a GPU texture of approximately **4700 × 2700 px** to back the `will-change` layer.

Most mobile GPUs (Adreno / Mali) have a **maximum raster tile texture limit of 2048px or 4096px**. When memory pressure exceeded this, Chromium's rasterizer silently **dropped compositor tiles**, causing rectangular blank patches across the game board.

### Cause 2 — `backdrop-filter: blur()` Nested Inside a CSS `transform: scale()` Viewport

The `AspectRatioContainer.jsx` scales the entire 1920×1080 game viewport using `transform: scale(...)` to fit any screen.

Inside this scaled viewport, multiple elements used `backdrop-filter: blur(...)`:

| Location | Element | Filter |
|---|---|---|
| `App.jsx` ~line 922 | In-game vignette overlay | `blur(3.5px)` |
| `App.jsx` ~line 1205 | Board ambient aura (directly behind tiles) | `blur(5px)` |
| `App.jsx` ~line 1040 | Round banner HUD pill | `blur(12px)` |
| `App.jsx` ~line 1068 | Score widget | `blur(12px)` |
| `App.jsx` ~line 1095 | Hearts widget | `blur(12px)` |
| `App.jsx` ~line 1374 | Bottom progress bar | `blur(12px)` |

`backdrop-filter` requires Chromium to **capture an off-screen framebuffer** of everything behind the element, apply the blur, and composite it back. When this is performed on elements nested inside a `transform: scale()` container, the Android WebView (Chromium) miscalculates the clip boundary for the raster tile, leading to **tile dropping** and **blank rectangular regions**.

This is a known limitation: `flutter_inappwebview` renders as an Android `PlatformView`, which operates on a **separate GPU compositing layer** from Flutter's own render tree. This exacerbates the Chromium compositor tile clipping issue.

---

## 🛠️ The Fix

### Fix 1 — Remove `will-change: transform` from `.game-viewport`

**File:** `src/index.css`

```diff
 .game-viewport {
   position: relative;
   width: 1920px;
   height: 1080px;
   min-width: 1920px;
   min-height: 1080px;
   background: radial-gradient(circle at 50% 20%, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%);
   overflow: hidden;
   transform-origin: center center;
   box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
-  will-change: transform;
 }
```

`will-change: transform` is **not needed** here because the outer wrapper (`AspectRatioContainer`) already applies `transform: scale()` directly to `.game-viewport`. The hint is redundant and causes Android WebView to pre-allocate a massive GPU texture.

---

### Fix 2 — Replace All In-Game `backdrop-filter: blur()` with GPU-Safe Alternatives

**File:** `src/App.jsx`

Every `backdropFilter` in the active game scene was replaced with **opaque-enough solid backgrounds + `box-shadow`**, which look visually identical but do not trigger off-screen framebuffer passes.

#### In-Game Vignette Overlay
```diff
-  backdropFilter: 'blur(3.5px)',
-  WebkitBackdropFilter: 'blur(3.5px)',
-  background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.32) 100%)',
+  background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.28) 100%)',
```

#### Board Ambient Aura (directly under tiles — most critical)
```diff
-  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 65%, transparent 100%)',
-  backdropFilter: 'blur(5px)',
-  WebkitBackdropFilter: 'blur(5px)',
+  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 65%, transparent 100%)',
```

#### Round Banner, Score Widget, Hearts Widget, Progress Bar
```diff
-  background: 'rgba(255, 255, 255, 0.94)',
-  backdropFilter: 'blur(12px)',
-  WebkitBackdropFilter: 'blur(12px)',
+  background: 'rgba(255, 255, 255, 0.97)',
```

Increasing opacity from `0.94` → `0.97` compensates for the lost frosted-glass effect — HUD elements still look clean and solid without requiring GPU framebuffer capture.

---

## 📦 Build & Deployment

After applying the fixes, a fresh production build was compiled:

```sh
npm run build
# ✓ built in 1.28s
```

The `dist/` output was synced into `Grade-3-English-Majhong/` for Flutter asset packaging:

```sh
Copy-Item -Path "dist\*" -Destination "Grade-3-English-Majhong" -Recurse -Force
```

---

## 📱 Flutter-Side Recommendation

In addition to the CSS fixes above, ensure `flutter_inappwebview` is configured with **Hybrid Composition** enabled to prevent Android `PlatformView` compositing issues:

```dart
InAppWebView(
  initialSettings: InAppWebViewSettings(
    useHybridComposition: true,    // Prevents PlatformView clipping on Android
    hardwareAcceleration: true,    // Must be enabled for CSS transforms to render
    useWideViewPort: true,
    loadWithOverviewMode: true,
    supportZoom: false,
    transparentBackground: true,
  ),
)
```

And in `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:hardwareAccelerated="true"
    ...>
```

---

## ✅ Summary of Changes

| File | Change | Why |
|---|---|---|
| `src/index.css` | Removed `will-change: transform` from `.game-viewport` | Prevented oversized GPU texture allocation on high-DPR Android screens |
| `src/App.jsx` | Removed `backdrop-filter: blur()` from vignette layer | Eliminated off-screen framebuffer that triggered compositor tile dropping |
| `src/App.jsx` | Removed `backdrop-filter: blur()` from board ambient aura | Same — this was the closest blur to the tile grid, direct cause of cut-off |
| `src/App.jsx` | Removed `backdrop-filter: blur()` from HUD widgets (banner, score, hearts, progress) | Reduced total GPU compositor workload; replaced with high-opacity solid backgrounds |
| Flutter app | `useHybridComposition: true` in `InAppWebViewSettings` | Prevents Android PlatformView layer desync from cutting off WebView render tiles |

> [!NOTE]
> `backdrop-filter: blur()` is safe in **non-scaled desktop browser** contexts. The bug is specific to Chromium on Android when `backdrop-filter` is nested inside a large CSS `transform: scale()` container, especially within a `flutter_inappwebview` PlatformView.
