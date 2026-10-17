# middleware/: code that runs around every request

| File | Exports | What it does |
|---|---|---|
| `auth.js` | `signToken`, `protect`, `optionalAuth` | Creates JWTs at login. Reads `Authorization: Bearer <token>`, verifies it, loads the user into `req.user` |
| `errorHandler.js` | `notFound`, `errorHandler` | Converts every error into `{ message, errors? }` JSON with the right status code |

## Error → status code mapping
| Error | Status | Example message |
|---|---|---|
| Mongoose `ValidationError` | 400 | "Phone must be 10-13 digits" (+ `errors` per field) |
| Mongoose `CastError` (bad ObjectId) | 400 | "Invalid value for _id" |
| Duplicate key `11000` | 409 | "email already exists" |
| `HttpError(403, …)` | 403 | "Only the organizer can do that" |
| Anything else | 500 | logged to the console |

## How JWT login works
1. `POST /api/auth/login` → server checks the password with bcrypt → returns a signed token.
2. The frontend stores the token and sends it on every request as `Authorization: Bearer <token>`.
3. `protect` verifies the signature with `JWT_SECRET`. There are no server-side sessions, so it works the same for web and mobile.
