# utils/: frontend helpers

| File | Contents |
|---|---|
| `blood.js` | Blood groups, display labels (`hh` → "Bombay (hh)"), the compatibility table (mirror of the server's), urgency labels & hints |
| `format.js` | `formatDate`, `toInputDate` (for `<input type="date">`), `timeAgo` ("5 minutes ago"), `timeLeft` ("23h 10m left") |
| `cities.js` | Preset city coordinates (Sangli, Miraj, Kolhapur…), the default map centre (WCE Sangli), `nearestCity()` |

The compatibility table exists on both sides: the **server** enforces it (security), and the **client** uses it to explain matches instantly without an API call.
