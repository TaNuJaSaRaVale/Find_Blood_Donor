# 📱 Converting RaktSetu into a mobile app

The project is already built to be mobile-ready:
- **Stateless JWT auth**: works the same from a phone (no cookies/sessions).
- **All API calls live in `client/src/api/`**, and the base URL comes from `VITE_API_URL`.
- **Responsive CSS** and a **PWA manifest**, so it can already be installed on a phone from the browser.
- GPS uses the standard `navigator.geolocation`, which works inside mobile web views.

## Step 0: Host the backend (required for any real phone)
A phone cannot reach `localhost`. Deploy `server/` to Render / Railway, and use MongoDB Atlas for the database.
Then set `CORS_ORIGIN` on the server and `VITE_API_URL=https://<your-api>/api` in `client/.env`.

## Option A: Capacitor (fastest, reuses 100% of the React code) ✅ recommended first
```bash
cd client
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init RaktSetu in.raktsetu.app --web-dir=dist
npm run build
npx cap add android
npx cap open android      # opens Android Studio → Run on phone / build APK
```
Add later: `@capacitor/geolocation` (native GPS), `@capacitor/push-notifications` (Firebase FCM for SOS alerts),
`@capacitor/share` (native share sheet instead of the WhatsApp link).

## Option B: React Native (Expo), a fully native UI
- Copy `src/api/`, `src/utils/` and the logic of `AuthContext` as-is (store the token in `expo-secure-store` instead of localStorage).
- Rebuild the screens with React Native components, `react-native-maps` for maps and `expo-location` for GPS.
- The backend stays exactly the same.

## Backend additions for mobile
| Feature | Change |
|---|---|
| Push notifications | Add `fcmTokens: [String]` to `User`, and send FCM messages inside `services/notify.js` |
| Live updates | Socket.IO, or MongoDB **Change Streams** (Atlas) on `notifications` |
| Background location | Periodic `PUT /users/me` with new `lat/lng` |
