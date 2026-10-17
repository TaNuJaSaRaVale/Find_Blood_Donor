# utils/: pure helper functions (no database access)

| File | Contents |
|---|---|
| `bloodCompatibility.js` | The 9 blood groups (incl. Bombay `hh`), who-can-receive-from-whom table, `donorGroupsFor()`, `recipientGroupsFor()`, `isCompatible()` |
| `eligibility.js` | Donation rules: `checkEligibility(user)` (for the Passport) and `eligibleDonorFilter()`, the **same rules as a MongoDB query** |
| `gamification.js` | Badges, levels, lives-saved multiplier, reliability score deltas |
| `geo.js` | `toPoint(lat, lng)` → GeoJSON, `pointFromQuery`, haversine `distanceKm`, `clampRadiusKm` |
| `httpError.js` | `HttpError` class and `pick()` (whitelists request fields → prevents mass-assignment) |

## Blood compatibility table (red cells)
| Patient | Can receive from |
|---|---|
| A+ | A+, A−, O+, O− |
| A− | A−, O− |
| B+ | B+, B−, O+, O− |
| B− | B−, O− |
| AB+ | **everyone** (universal recipient) |
| AB− | A−, B−, AB−, O− |
| O+ | O+, O− |
| O− | O− only |
| Bombay (hh) | Bombay only |

## Eligibility rules (NBTC India)
- Age **18–65**, weight **≥ 50 kg**
- Gap since last donation: **90 days (men)**, **120 days (women)**
- Donor must be listed (`isDonor`) and not paused (`available`)

## Reliability score (0–100, starts at 50)
Pledge **+2** · Withdraw **−3** · Confirmed donation **+10**
