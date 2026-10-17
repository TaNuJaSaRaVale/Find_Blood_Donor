# 🎓 Viva preparation: likely questions & short answers

## About the project
**Q. What problem does your project solve?**
Patients' families waste hours calling donors who are the wrong blood group, too far away, or donated recently.
RaktSetu shows only donors who are **compatible, nearby and eligible today**, and alerts them instantly.

**Q. What is unique compared to existing apps?**
Compatibility-aware search (not just same group), Bombay blood group support, eligibility checked inside the
DB query, a match score, privacy-first contact, a city shortage radar, and verified donations feeding a gamified Donor Passport.

**Q. Explain your architecture.**
React frontend → REST API (JSON over HTTP, JWT auth) → Node.js + Express → Mongoose → MongoDB.
Routes map URLs to controllers. Controllers use services and models. Errors are handled centrally.

## MongoDB / NoSQL
**Q. SQL vs NoSQL? Why MongoDB here?**
SQL uses fixed tables and joins. MongoDB stores flexible JSON-like documents (BSON).
MongoDB fits because of built-in **geospatial** queries, **embedded arrays** (responses, participants),
**TTL** auto-expiry and the **aggregation framework**, and its JSON maps directly to JavaScript.

**Q. What is BSON?** Binary JSON: MongoDB's storage format. It adds types like ObjectId, Date and Decimal.

**Q. What is `_id` / ObjectId?** A 12-byte unique id: timestamp + random value + counter. It is created automatically.

**Q. Embedding vs referencing? Give examples from your project.**
Embedding: `responses[]` inside a blood request, because it is small and always read together.
Referencing: `Donation.donor → User`, because it grows without limit and is queried separately.

**Q. What indexes did you create and why?**
`2dsphere` on location (needed for `$near`/`$geoNear`), unique on email, compound on
`bloodGroup+isDonor+available`, and **TTL** indexes on `expiresAt` (requests) and `createdAt` (notifications).

**Q. What is a TTL index?**
An index with `expireAfterSeconds`. A background job (every ~60 s) deletes documents whose date has passed.
Trick used: only *open* requests have `expiresAt`. When a request is closed we `$unset` it, so it stays as history.

**Q. What is GeoJSON? Why `[lng, lat]`?**
A standard format for geographic shapes: `{ type: "Point", coordinates: [longitude, latitude] }`.
Longitude comes first because it is the x-axis.

**Q. Difference between `$near` and `$geoNear`?**
`$near` is a query operator (used in `find`). `$geoNear` is an **aggregation stage** that must come first and can
output the distance (`distanceField`) for further computation, like our match score.

**Q. What is the aggregation pipeline?**
A sequence of stages (`$match`, `$group`, `$sort`, `$project`, `$facet`…) where each stage transforms the documents
from the previous one, similar to SQL `GROUP BY` plus more.

**Q. What does `$facet` do?** Runs several sub-pipelines on the same input in one query (used on the Insights page).

**Q. How do you prevent overbooking a camp?**
With a single atomic `findOneAndUpdate`. The filter checks `registeredCount < capacity` and "not already registered",
and the update does `$push` + `$inc`. MongoDB guarantees single-document atomicity.

**Q. What is the positional `$` operator?**
It updates the array element matched by the query, e.g. `"responses.$.status": "withdrawn"`.

**Q. Transactions?** MongoDB supports multi-document ACID transactions on replica sets (e.g. Atlas). We use
single-document atomic operations, which are enough here. Confirming a donation could be wrapped in a transaction as a future improvement.

## Mongoose / Node / Express
**Q. What is Mongoose?** An ODM (Object Data Modeling) library: schemas, validation, middleware hooks, `populate`.

**Q. What does `populate()` do?** It replaces an ObjectId reference with the referenced document (like a join).

**Q. Where is validation done?** In Mongoose schemas (required, enum, min/max, regex, custom validators), and the
frontend uses HTML5 validation for quick feedback. **The server never trusts the client.**

**Q. What is middleware in Express?** A function `(req, res, next)` that runs before or after route handlers, e.g. `protect` (auth),
`helmet` (security headers), `cors`, `express.json()`, the error handler.

**Q. How is the password stored?** It is hashed with **bcrypt** (salted, 10 rounds) in a `pre('save')` hook and never returned (`select: false`).

**Q. How does login work (JWT)?** The server signs `{ id }` with a secret and returns the token. The client sends it in the
`Authorization: Bearer` header. The server verifies the signature, so it needs no sessions. This is ideal for mobile apps too.

**Q. What is CORS?** A browser rule that blocks requests to another origin unless the server allows it. Vite's proxy
avoids it in development, and the `cors` middleware allows configured origins in production.

**Q. What is REST? Map CRUD to HTTP methods.** Create = POST, Read = GET, Update = PUT/PATCH, Delete = DELETE.
Resources are nouns (`/requests/:id`), and the server keeps no session state.

**Q. Status codes you use?** 200 OK, 201 Created, 400 Bad Request (validation), 401 Unauthorized,
403 Forbidden (not owner), 404 Not Found, 409 Conflict (duplicate email), 429 Too Many Requests, 500 Server Error.

## Domain knowledge
**Q. Universal donor / recipient?** O− is the universal red-cell donor. AB+ is the universal recipient.

**Q. What is the Bombay blood group?** A rare phenotype (hh) that lacks the H antigen. These patients can only receive hh blood.
About 1 in 10,000 Indians has it, and it was first found in Mumbai in 1952.

**Q. Why 90/120 days?** Indian NBTC guidelines: the minimum gap between whole-blood donations is 90 days for men and 120 days for women.

**Q. Why "lives saved = units × 3"?** One unit is separated into red cells, plasma and platelets, which can help up to 3 patients.

## Future scope
Push notifications and SMS (Firebase/Twilio), a React Native / Capacitor mobile app, hospital and blood-bank admin portal,
real-time updates with Socket.IO or MongoDB Change Streams, AI demand forecasting, and Aadhaar/hospital verification.
