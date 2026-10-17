# RaktSetu REST API reference

Base URL: `http://localhost:5000/api` · All bodies are JSON · 🔒 = needs `Authorization: Bearer <token>`

Errors always look like: `{ "message": "Phone must be 10-13 digits", "errors": { "phone": "…" } }`

## Health
| Method | URL | Notes |
|---|---|---|
| GET | `/health` | `{ status, database: "connected" }` |

## Auth
| Method | URL | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `name, email, password, phone, gender, dateOfBirth, weight, bloodGroup, isDonor, lat, lng, city, address?, lastDonationDate?` | `201 { token, user }` |
| POST | `/auth/login` | `email, password` | `{ token, user }` |
| GET 🔒 | `/auth/me` | – | `{ user }` |

## My profile
| Method | URL | Body | Notes |
|---|---|---|---|
| PUT 🔒 | `/users/me` | any of `name, phone, gender, dateOfBirth, weight, bloodGroup, isDonor, available, city, address, lat, lng` | Validated update |
| PATCH 🔒 | `/users/me/availability` | `{ available: true }` | Pause/resume being found |
| PATCH 🔒 | `/users/me/password` | `currentPassword, newPassword` | |
| DELETE 🔒 | `/users/me` | – | Deletes account, donations, notifications, organized camps; cancels open requests |
| GET 🔒 | `/users/me/passport` | – | `{ user, eligibility, badges, level, stats, compatibility, activePledges, donations }` |

## Donors
| Method | URL | Notes |
|---|---|---|
| GET | `/donors/search?bloodGroup=A%2B&lat=16.85&lng=74.6&radiusKm=10&mode=compatible` | `mode=exact` for the same group only. Note `+` must be URL-encoded as `%2B`. Returns `{ count, radiusKm, searchedGroups, donors[] }`, each donor with `distanceKm, matchScore, exactMatch` (no phone) |
| GET | `/donors/compatibility?group=O-` | `{ canReceiveFrom, canDonateTo }` |

## Blood requests
| Method | URL | Body / query | Notes |
|---|---|---|---|
| GET | `/requests` | `status=open\|fulfilled\|cancelled\|all, bloodGroup, city, mine=true, lat, lng, radiusKm` | Critical first. With lat/lng → nearest first |
| POST 🔒 | `/requests` | `patientName, bloodGroup, unitsNeeded, hospital, city, lat, lng, urgency, contactPhone, requiredBy?, note?` | Alerts matching donors → `{ request, notifiedCount, topMatches }` |
| GET 🔒 | `/requests/for-me` | `radiusKm?` | Open requests within 50 km my blood group can help |
| GET | `/requests/:id` | – | Owner also gets `responses[]` with donor phones |
| PUT 🔒 | `/requests/:id` | same fields as POST | Owner only, open requests only |
| PATCH 🔒 | `/requests/:id/status` | `{ status }` | Owner. Closing removes `expiresAt` (kept as history) |
| DELETE 🔒 | `/requests/:id` | – | Owner |
| POST 🔒 | `/requests/:id/respond` | `{ action: "pledge" \| "withdraw" }` | Checks compatibility + eligibility |
| POST 🔒 | `/requests/:id/confirm/:donorId` | – | Owner confirms → verified Donation, donor stats updated, auto-fulfil |

## Donations
| Method | URL | Body |
|---|---|---|
| GET 🔒 | `/donations/me` | – |
| POST 🔒 | `/donations` | `date, place, units?, notes?` |
| PUT 🔒 | `/donations/:id` | same (self-reported only) |
| DELETE 🔒 | `/donations/:id` | (self-reported only) |

## Camps
| Method | URL | Body / query |
|---|---|---|
| GET | `/camps` | `when=upcoming\|past\|all, lat, lng, radiusKm, mine=true` |
| POST 🔒 | `/camps` | `name, date, venue, city, lat, lng, capacity, startTime?, endTime?, description?, contactPhone?` → notifies donors within 20 km |
| GET | `/camps/:id` | Organizer also sees participants |
| PUT 🔒 | `/camps/:id` | Organizer only, capacity ≥ registered |
| DELETE 🔒 | `/camps/:id` | Organizer only, participants notified |
| POST 🔒 | `/camps/:id/register` | Atomic seat booking |
| DELETE 🔒 | `/camps/:id/register` | Cancel booking |

## Notifications 🔒
| Method | URL |
|---|---|
| GET | `/notifications` → `{ unread, notifications[] }` |
| GET | `/notifications/unread-count` |
| PATCH | `/notifications/read-all` |
| PATCH | `/notifications/:id/read` |
| DELETE | `/notifications/:id` |

## Stats
| Method | URL | Returns |
|---|---|---|
| GET | `/stats/overview` | totals, donorsByGroup, donorsByCity, requestsByStatus, donationsByMonth |
| GET | `/stats/shortage?city=Sangli` | per group: `unitsNeeded, exactDonors, compatibleDonors, level (critical/low/watch/healthy)` |

## Quick test with curl
```bash
TOKEN=$(curl -s -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"demo@raktsetu.in","password":"demo1234"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s "localhost:5000/api/requests/for-me" -H "Authorization: Bearer $TOKEN"
```
