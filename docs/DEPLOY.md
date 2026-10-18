# Deploy RaktSetu (free tier)

One **Render** web service runs the Express API and serves the built React app from the same URL. **MongoDB Atlas** holds the database.

You do **not** need `VITE_API_URL` for this setup: the browser calls `/api` on the same host.

---

## 1. MongoDB Atlas

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → create a **free M0** cluster.
2. **Database Access** → add a database user (username + password). Save the password.
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect. (Tighten this later if you use a fixed IP.)
4. **Connect** → **Drivers** → copy the connection string. Replace `<password>` and set the database name, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/raktsetu?retryWrites=true&w=majority`

---

## 2. Push code to GitHub

Render deploys from Git. If the project is not on GitHub yet:

```bash
cd /path/to/Database_MiniProject
git add .
git commit -m "Prepare for deployment"
# create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

---

## 3. Render (recommended)

### Option A — Blueprint (`render.yaml`)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the GitHub repo. Render reads [`render.yaml`](../render.yaml) at the repo root.
3. When prompted, paste **MONGO_URI** (Atlas string from step 1). **JWT_SECRET** can be auto-generated.
4. Deploy. When the build finishes, open `https://<your-service>.onrender.com/api/health` — `"database": "connected"`.
5. Open `https://<your-service>.onrender.com/` for the app.

### Option B — Manual Web Service

| Setting | Value |
|---|---|
| **Root Directory** | *(leave empty — repo root)* |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Environment** | `NODE_ENV=production`, `MONGO_URI=…`, `JWT_SECRET=…` (long random string), `CORS_ORIGIN=*` |

**Health check path:** `/api/health`

### Load demo data (optional)

On Render, open **Shell** for the service (paid plans) or run seed locally pointing at Atlas:

```bash
cd server
MONGO_URI="your-atlas-uri" JWT_SECRET="same-as-production" npm run seed
```

Demo logins match the main [README](../README.md) (`demo@raktsetu.in` / `demo1234`, etc.).

---

## 4. Railway (alternative)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select the repo.
2. Set **Root Directory** to the repo root (not `server/` alone, or `client/dist` will not be built next to the server).
3. **Settings → Deploy**:
   - Build: `npm run build`
   - Start: `npm start`
4. **Variables**: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN=*`.
5. **Settings → Networking** → generate a public domain. Test `/api/health` then `/`.

---

## 5. Split frontend and API (optional)

If you host the API and frontend on **different** domains:

1. Deploy only `server/` (build command: `npm install`, start: `npm start`).
2. Deploy `client/` on Vercel/Netlify: build `npm run build`, output `dist`.
3. Set **`VITE_API_URL=https://your-api.example.com/api`** in the frontend host’s env **before** build.
4. Set **`CORS_ORIGIN=https://your-frontend.example.com`** on the API.

For SPA routing on static hosts, add a redirect rule so all paths serve `index.html` (Vercel/Netlify both support this).

---

## 6. Verify after deploy

| Check | Expected |
|---|---|
| `GET /api/health` | `{ "status": "ok", "database": "connected" }` |
| Home page | Stats load (needs data; run seed if empty) |
| Register / login | JWT in browser localStorage |
| Find Donors + map | Geo queries work (Atlas supports 2dsphere) |

---

## 7. Free-tier notes

- **Render free** services spin down after ~15 minutes idle; first request may take 30–60s.
- **Atlas M0** has storage and connection limits; fine for demos and viva.
- Never commit `.env` or Atlas passwords. Use the host’s secret/env UI only.

---

## Local production smoke test

Same layout as Render:

```bash
# Terminal 1 — MongoDB (Docker example)
docker run -d --name raktsetu-mongo -p 27017:27017 mongo:7

# From repo root
cd server && cp .env.example .env   # set MONGO_URI + JWT_SECRET
cd .. && npm run build
MONGO_URI=... JWT_SECRET=... npm start

# Open http://localhost:5000  (API + UI)
```
