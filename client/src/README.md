# client/src: frontend source code

| File / folder | Role |
|---|---|
| `main.jsx` | Entry point: mounts `<App/>` inside the Router, AuthProvider and toast container; imports Leaflet + app CSS |
| `App.jsx` | Navbar, all routes (which URL shows which page), footer |
| `styles.css` | The whole design system in plain CSS (variables, light/dark mode, responsive breakpoints) |
| `api/` | Talking to the backend |
| `context/` | Global logged-in user |
| `hooks/` | Reusable React hooks |
| `components/` | Reusable UI building blocks |
| `pages/` | Screens |
| `utils/` | Pure helper functions |

## Routes
| URL | Page | Login? |
|---|---|---|
| `/` | Home | – |
| `/login`, `/register` | Auth | – |
| `/find` | Find Donors | – |
| `/requests` | Request list (I can help / All / Mine) | – |
| `/requests/new` (`?sos=1`) | New request / Emergency SOS | ✔ |
| `/requests/:id` | Request detail, pledge, confirm | – |
| `/requests/:id/edit` | Edit request | ✔ |
| `/passport` | Donor Passport + profile | ✔ |
| `/camps` | Camps list, book, organize | – |
| `/insights` | Charts + Shortage Radar | – |
| `/notifications` | Inbox | ✔ |
