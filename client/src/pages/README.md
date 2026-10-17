# pages/: one file per screen

| Page | CRUD / feature | API calls |
|---|---|---|
| `Home.jsx` | Landing page, live stats, feature list | `GET /stats/overview` |
| `Login.jsx` | Log in (+ "use demo account" button) | `POST /auth/login` |
| `Register.jsx` | **Create** user: blood group, location, eligibility info | `POST /auth/register` |
| `FindDonors.jsx` | Search compatible + eligible donors on a map, ranked by match score | `GET /donors/search` |
| `Requests.jsx` | **Read** requests: "I can help", all (filters), mine | `GET /requests`, `GET /requests/for-me` |
| `RequestForm.jsx` | **Create / Update** a request. `?sos=1` = emergency mode. Success screen shows how many donors were alerted | `POST /requests`, `PUT /requests/:id` |
| `RequestDetail.jsx` | Detail + map. Donor: pledge / withdraw. Owner: see donors' phones, confirm donation, mark fulfilled/cancel/re-open, **Delete**. WhatsApp share | `GET`, `POST respond`, `POST confirm`, `PATCH status`, `DELETE` |
| `Passport.jsx` | Eligibility ring, level, badges, stats, donation history **CRUD**, availability toggle, profile edit, delete account | `GET /users/me/passport`, `/donations`, `PUT /users/me`, … |
| `Camps.jsx` | Camps **CRUD**, map, book/cancel seat | `/camps` endpoints |
| `Insights.jsx` | Charts + **Shortage Radar** by city | `GET /stats/overview`, `GET /stats/shortage` |
| `Notifications.jsx` | Inbox: open, mark read, mark all, delete | `/notifications` endpoints |
| `NotFound.jsx` | 404 page | – |
