# server/src: backend source code

| File / folder | Role |
|---|---|
| `server.js` | **Entry point**: connects to MongoDB, then starts listening on `PORT` |
| `app.js` | Builds the Express app: middleware, `/api` routes, error handler. In production it also serves the built React app |
| `config/` | `.env` loading and the MongoDB connection |
| `models/` | Database schemas (one file per collection) |
| `routes/` | URL → controller mapping |
| `controllers/` | Request handlers (the "C" in MVC) |
| `services/` | Logic shared by several controllers |
| `middleware/` | Code that runs *before* (auth) or *after* (errors) controllers |
| `utils/` | Pure helper functions with no database access |
| `seed/` | Script that fills the database with demo data |

The code uses **ES Modules** (`import`/`export`) and **Express 5**, which forwards errors thrown
in `async` handlers to the error handler automatically, so no `try/catch` is needed in controllers.
