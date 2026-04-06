# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npx expo start       # start dev server (scan QR with Expo Go on phone)
npx expo start --web # run in browser
npx expo export --platform web  # build static web export to dist/
```

Platform-specific launchers: `npm run ios`, `npm run android`, `npm run web`.

## Architecture

The entire app is a single file: `App.js`. No navigation, no state management library, no separate components. All logic, state, and styles live together.

**Two modes** toggled by `isRunning`:
- **Picker mode** — a `ScrollView`-based scroll wheel (1–120 minutes). Scroll snapping is handled differently per platform: native uses `snapToInterval`/`onMomentumScrollEnd`; web uses a debounced `onScroll` + manual `scrollTo` snap.
- **Timer mode** — countdown display driven by a `setInterval` stored in `timerRef`.

**Key refs:** `soundRef` (loaded `expo-av` Sound object), `timerRef` (interval id), `scrollRef` (ScrollView), `scrollTimeoutRef` (web debounce timeout). All are cleaned up in the mount-effect's return.

**Audio:** gong sound (`assets/sounds/gong.mp3`) is loaded once on mount via `expo-av` and replayed by rewinding to position 0 before each play. `playsInSilentModeIOS: true` is set so audio works on muted iPhones.

**Screen keep-awake:** `activateKeepAwakeAsync` is called on start; `deactivateKeepAwake` is called on stop or natural end.

**Styling:** Dark navy background (`#1a1a2e`), gold accent (`#c9a96e`), all via `StyleSheet.create` at the bottom of `App.js`.
