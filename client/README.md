# 🎨 client/: RaktSetu web app (React + Vite)

The user interface. It never touches MongoDB directly: every action is a REST call to the API in `../server`.

## Quick start
```bash
npm install
npm run dev        # http://localhost:5173  (backend must be running on :5000)
npm run build      # production build into dist/
```
During development, Vite **proxies** `/api/*` to `http://localhost:5000` (see `vite.config.js`), so there are no CORS issues.

## Libraries
| Library | Used for |
|---|---|
| React 18 + React Router 6 | Pages and navigation |
| Axios | HTTP calls to the REST API |
| Leaflet + react-leaflet | Maps (OpenStreetMap, no API key needed) |
| Chart.js + react-chartjs-2 | Insights charts |
| react-hot-toast | Success/error popups |

## Folder map
| Folder | Purpose |
|---|---|
| [`public/`](public) | Static files: app icon, PWA manifest |
| [`src/api/`](src/api) | Axios instance + every endpoint function |
| [`src/context/`](src/context) | Logged-in user state (AuthContext) |
| [`src/hooks/`](src/hooks) | Reusable hooks: data loading, GPS |
| [`src/components/`](src/components) | Reusable UI pieces (map, cards, pickers…) |
| [`src/pages/`](src/pages) | One file per screen |
| [`src/utils/`](src/utils) | Blood-group rules, date formatting, city list |

## Environment
`VITE_API_URL` (optional, see `.env.example`) points the app at a hosted API, which is needed for the mobile app build.
