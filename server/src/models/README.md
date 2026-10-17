# models/: database design (Mongoose schemas)

Each file defines **one MongoDB collection**: its fields, validation rules and indexes.

| Model | Collection | Stores |
|---|---|---|
| `User.js` | `users` | Everyone (donors & requesters): profile, blood group, GeoJSON location, eligibility fields, reliability score |
| `BloodRequest.js` | `bloodrequests` | A patient's need for blood + **embedded** donor `responses` |
| `Donation.js` | `donations` | One document per donation (**references** the donor) |
| `Camp.js` | `camps` | Donation camps + embedded `participants` array |
| `Notification.js` | `notifications` | In-app alerts, auto-deleted after 30 days |
| `pointSchema.js` | — | Reusable GeoJSON `{ type: 'Point', coordinates: [lng, lat] }` |
| `index.js` | — | Exports all models from one place |

## Embedding vs referencing (common viva question)
- **Embedded** `BloodRequest.responses`: small, bounded, always read with the request.
- **Referenced** `Donation.donor → User`: grows forever and is queried on its own (history, stats).

## Indexes
| Collection | Index | Why |
|---|---|---|
| users | `location: 2dsphere` | Nearby donor search (`$geoNear`) |
| users | `email` unique | No duplicate accounts |
| users | `{ bloodGroup, isDonor, available }` | Fast filtering |
| bloodrequests | `location: 2dsphere` | Requests near a donor |
| bloodrequests | `expiresAt` **TTL** (`expireAfterSeconds: 0`) | Open requests auto-delete when they expire |
| camps | `location: 2dsphere`, `date` | Nearby / upcoming camps |
| notifications | `createdAt` **TTL** 30 days | Inbox cleans itself |

## Validation examples
- `phone` must match `^\+?\d{10,13}$`
- `bloodGroup` must be one of `A+ A- B+ B- AB+ AB- O+ O- hh`
- `Donation.date` cannot be in the future (custom validator)
- `password` is hashed with **bcrypt** in a `pre('save')` hook and never returned (`select: false`)
