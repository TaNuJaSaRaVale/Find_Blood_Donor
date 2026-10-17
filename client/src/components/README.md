# components/: reusable UI building blocks

| Component | What it shows |
|---|---|
| `Navbar.jsx` | Top bar: links, 🚨 SOS button, 🔔 bell with unread count (polled every 30 s), user menu, mobile hamburger |
| `ProtectedRoute.jsx` | Redirects to `/login` if not logged in, then back to the page afterwards |
| `MapView.jsx` | OpenStreetMap via Leaflet: markers, search-radius circle, "you are here", click-to-pick |
| `LocationPicker.jsx` | Set a location 3 ways: 📍 GPS, city dropdown, or tap the map. Auto-fills the city |
| `BloodGroupPicker.jsx` | Grid of 9 blood-group buttons. Highlights compatible groups in amber |
| `EligibilityRing.jsx` | Circular SVG countdown: "42 days to go" → "✓ Ready to donate" |
| `RequestCard.jsx` | One request in a list: urgency colour, units progress, distance, time left |
| `ui.jsx` | Small pieces: `BloodBadge`, `UrgencyTag`, `StatusTag`, `Loader`, `EmptyState`, `ErrorBox`, `StatCard`, `ProgressBar`, `Field` |

All styling lives in `../styles.css` (class names follow a simple BEM style: `block__element--modifier`).
