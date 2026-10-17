# routes/: all API URLs

`index.js` maps every **HTTP method + URL** to a controller function. Everything is mounted under `/api`.

| Middleware | Meaning |
|---|---|
| `protect` | Must be logged in (valid JWT), otherwise **401** |
| `optionalAuth` | Works for guests, but personalises the response if logged in |
| `authLimiter` | Max 30 login/register attempts per 15 min per IP |

REST conventions used:
| Method | Used for | Example |
|---|---|---|
| `GET` | Read | `GET /api/requests/:id` |
| `POST` | Create / action | `POST /api/requests`, `POST /api/requests/:id/respond` |
| `PUT` | Update a whole resource | `PUT /api/camps/:id` |
| `PATCH` | Update one field | `PATCH /api/requests/:id/status` |
| `DELETE` | Delete | `DELETE /api/donations/:id` |

Full list with request/response examples: [../../../docs/API.md](../../../docs/API.md)
