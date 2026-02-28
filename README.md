# Sprytna Meditation Timer

A minimal meditation timer for iOS, Android, and web. Built with Expo and React Native.

## Features

- Scroll wheel to set duration from 1 to 120 minutes
- Gong sound on start and end
- Screen stays awake during a session
- End a session early at any time
- Dark UI with gold accents

## Tech Stack

- [Expo](https://expo.dev) SDK 54
- React Native 0.81.5 / React 19
- `expo-av` — audio playback
- `expo-keep-awake` — prevents screen sleep during session

## Running the App

Install dependencies:

```bash
npm install
```

Start for iPhone/Android via Expo Go:

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

Start in browser:

```bash
npx expo start --web
```

Build a static web export:

```bash
npx expo export --platform web
```

Output goes to the `dist/` folder, ready to deploy to Netlify, Vercel, or GitHub Pages.

## Credits

Gong sound by [Orange Free Sounds](https://orangefreesounds.com), licensed under [CC Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
