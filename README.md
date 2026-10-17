# 🩸 RaktSetu – Smart Blood Donor Finder

> *Rakt* (blood) + *Setu* (bridge): a bridge between blood donors and patients.

A full-stack **MERN** web application (MongoDB · Express · React · Node.js) that finds
**compatible**, **nearby** and **eligible-today** blood donors in seconds, and alerts them instantly in an emergency.

---

## ✨ Features

### Core (CRUD on MongoDB)
| Module | Create | Read | Update | Delete |
|---|---|---|---|---|
| **Users / Donors** | Register | Profile, Passport | Edit profile, availability, password | Delete account (cascades) |
| **Blood Requests** | Post request / SOS | List, filter, detail | Edit, change status, pledge, confirm | Delete |
| **Donations** | Log a donation | History | Edit (self-reported) | Remove |
| **Camps** | Organize camp | List (upcoming/past, nearby) | Edit, book/cancel seat | Delete |
| **Notifications** | Auto-generated | Inbox + unread count | Mark read / all read | Delete |

### ⭐ Unique features (not found in typical donor apps)
1. **Compatibility-aware matching**: an AB+ patient sees donors of *all 8* compatible groups, not just AB+.
2. **Bombay blood group (hh) support**: rare hh donors are tracked and only matched to hh patients.
3. **Eligibility engine inside the DB query**: 90-day (men) / 120-day (women) rule, age 18–65, weight ≥ 50 kg.
4. **Match Score ranking**: one `$geoNear` aggregation scores donors by distance + reliability + exact group.
5. **One-tap SOS**: a critical request alerts every eligible compatible donor within 25 km.
6. **Privacy-first contact**: donor phone numbers are hidden until the donor pledges.
7. **City Shortage Radar**: live demand vs eligible supply per blood group, per city.
8. **Donor Passport**: eligibility countdown ring, badges, levels, "lives saved", reliability score.
9. **Verified donations**: the patient's family confirms the donation, and the donor's history and next eligible date update automatically.
10. **Self-cleaning data**: TTL indexes auto-expire old requests and notifications.
11. **Atomic camp booking**: a camp can never be overbooked, even with simultaneous clicks.
12. **WhatsApp sharing** of requests, **installable PWA**, works on phones.

---

## 🏗️ Architecture

```
User (browser / phone)
   ↓
Frontend: React + Vite (client/)        ← Leaflet maps, Chart.js charts
   ↓  HTTP + JSON (REST API, JWT auth)
Backend: Node.js + Express.js (server/)  ← routes → controllers → services
   ↓  Mongoose ODM
MongoDB  (users, bloodrequests, donations, camps, notifications)
```

## 📁 Project structure

```
Database_MiniProject/
├── server/          Backend REST API (Node + Express + Mongoose)  → see server/README.md
├── client/          Frontend web app (React + Vite)               → see client/README.md
├── docs/            API reference, database design, viva notes, mobile plan
└── README.md        You are here
```
Every folder has its own `README.md` explaining what's inside.

---

## 🚀 Run it locally

**Prerequisites:** Node.js 18+ and MongoDB (local install, Docker, or a free MongoDB Atlas cluster).

```bash
# 1) Backend
cd server
cp .env.example .env        # then edit MONGO_URI if you use Atlas
npm install
npm run seed                # loads demo data (73 users, requests, camps…)
npm run dev                 # API on http://localhost:5000/api

# 2) Frontend (new terminal)
cd client
npm install
npm run dev                 # app on http://localhost:5173
```

**Demo logins** (after seeding):
| Email | Password | What to show |
|---|---|---|
| `demo@raktsetu.in` | `demo1234` | O+ donor, camp organizer, has a pledge |
| `priya@raktsetu.in` | `demo1234` | Requester view: sees pledged donor's phone, can confirm donation |
| `rare@raktsetu.in` | `demo1234` | Bombay (hh) rare donor |

> No MongoDB installed? Run one with Docker (auto-starts on boot):
> `docker run -d --name raktsetu-mongo --restart unless-stopped -p 27017:27017 mongo:7`
>
> ⚠️ On **Linux kernel 6.19+** (e.g. Ubuntu with kernel 7.x) the native MongoDB 8.0 server refuses to start
> ([SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912)). Use the Docker command above instead.
> Compass and `mongosh` installed on the host still connect normally to `127.0.0.1:27017`.

---

## 🧪 Suggested demo flow (5 minutes)
1. **Home**: live stats come from aggregation.
2. **Find Donors**: choose A+, show "All compatible" (A+, A−, O+, O−) vs "Exact", plus the map and match score.
3. Log in as **priya** → **SOS**: post a critical request, and the screen shows "N donors alerted".
4. Log in as **demo** in another browser → 🔔 notification → open the request → **I will donate**.
5. Back as **priya** → the donor's phone is now visible → **Confirm donated** → request becomes *fulfilled*.
6. As **demo** → **Passport**: the countdown ring now shows 90 days, a badge is earned, and the history row is *verified*.
7. **Insights** → Shortage Radar per city.
8. Open **MongoDB Compass** to show the documents and indexes (2dsphere, TTL).

## 📚 Docs
- [docs/API.md](docs/API.md): every REST endpoint
- [docs/DATABASE.md](docs/DATABASE.md): collections, schema design, indexes, queries
- [docs/VIVA.md](docs/VIVA.md): likely viva questions with answers
- [docs/MOBILE.md](docs/MOBILE.md): plan for converting to a mobile app

## 🛠️ Tech stack
React 18 · React Router · Axios · Leaflet (OpenStreetMap) · Chart.js · Node.js · Express 5 · MongoDB · Mongoose 8 · JWT · bcrypt · Helmet · express-rate-limit
