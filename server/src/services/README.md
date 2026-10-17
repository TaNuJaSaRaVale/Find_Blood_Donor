# services/: reusable business logic

## `matching.js`: ⭐ the donor-matching engine
`findMatchingDonors({ point, bloodGroup, radiusKm, mode, excludeUserId, limit })`

One **aggregation pipeline** on the `users` collection:
```js
[
  { $geoNear: { near, distanceField: 'distance', maxDistance, spherical: true,
                query: { ...eligibleToday, bloodGroup: { $in: compatibleGroups } } } },
  { $addFields: { distanceKm, exactMatch } },
  { $addFields: { matchScore: distance(50) + reliability(30) + exactGroup(20) } },
  { $sort: { matchScore: -1 } },
  { $limit: 50 },
  { $project: { /* no phone, no email */ } }
]
```
Used by **Find Donors**, and by **request creation** (to alert the top 30 donors).

## `notify.js`
| Function | Purpose |
|---|---|
| `notifyMany(userIds, payload)` | Inserts many notifications with one `insertMany` |
| `notify(userId, payload)` | Single notification |
| `adjustReliability(userId, delta)` | Changes the reliability score but keeps it in 0–100 using an **update pipeline** (`$min`/`$max`), atomically inside MongoDB |
