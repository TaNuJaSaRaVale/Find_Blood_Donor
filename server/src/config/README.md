# config/: settings & database connection

| File | What it does |
|---|---|
| `env.js` | Loads `server/.env` with **dotenv**, stops the app with a clear message if `MONGO_URI` or `JWT_SECRET` is missing, and exports an `env` object with defaults |
| `db.js` | `connectDB(uri)` connects with **Mongoose**, waits until every model's indexes (2dsphere, TTL, unique) are built, and logs connect/disconnect events |

### Why wait for indexes?
`$near` and `$geoNear` queries **fail** if the `2dsphere` index does not exist yet.
`model.init()` guarantees the indexes are ready before the first request arrives.

### Connection strings
- Local: `mongodb://127.0.0.1:27017/raktsetu`
- Atlas: `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/raktsetu`
  (in Atlas → *Network Access*, allow your IP address)
