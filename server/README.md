# 🖥️ server/: RaktSetu REST API

Node.js + Express.js backend that talks to MongoDB through Mongoose.
The React app (and the future mobile app) calls this API over HTTP with JSON.

## Quick start
```bash
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm install
npm run seed             # optional: demo data
npm run dev              # restarts automatically when you edit files
```
Check it works: open http://localhost:5000/api/health and you should see `"database": "connected"`.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start with auto-reload (`node --watch`) |
| `npm start` | Start normally (production) |
| `npm run seed` | **Wipe** the DB and insert demo data |

## Environment variables (`.env`)
| Name | Example | Meaning |
|---|---|---|
| `PORT` | `5000` | Port the API listens on |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/raktsetu` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | any long random text | Signs login tokens |
| `JWT_EXPIRES_IN` | `7d` | How long a login lasts |
| `CORS_ORIGIN` | `*` | Which frontends may call the API |

## How a request flows through the code
```
HTTP request
  → src/app.js            (security headers, CORS, JSON parsing, logging)
  → src/routes/index.js   (URL + method → controller function)
  → src/middleware/auth.js (who is calling? JWT check)
  → src/controllers/*.js  (business logic)
  → src/services/*.js     (shared logic: donor matching, notifications)
  → src/models/*.js       (Mongoose schema → MongoDB)
  ← JSON response   (errors are formatted by src/middleware/errorHandler.js)
```

## Folder map
| Folder | Purpose |
|---|---|
| [`src/config`](src/config) | Environment variables & database connection |
| [`src/models`](src/models) | Mongoose schemas = the database design |
| [`src/routes`](src/routes) | All API URLs in one file |
| [`src/controllers`](src/controllers) | What each endpoint does |
| [`src/services`](src/services) | Reusable logic (geo matching, notifications) |
| [`src/middleware`](src/middleware) | Auth guard & error handler |
| [`src/utils`](src/utils) | Blood compatibility, eligibility rules, badges, geo helpers |
| [`src/seed`](src/seed) | Demo data generator |

Full endpoint list: [../docs/API.md](../docs/API.md)
