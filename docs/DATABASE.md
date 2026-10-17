# Database design

Database name: **`raktsetu`** · 5 collections

```
users ──< donations            (Donation.donor → User._id)        referencing
users ──< bloodrequests         (BloodRequest.requester → User._id)
bloodrequests ⊃ responses[]     (each { donor → User._id, status }) embedding
users ──< camps                 (Camp.organizer → User._id)
camps ⊃ participants[]          (array of User._id)                embedding
users ──< notifications         (Notification.user → User._id)
```

## Sample documents

**users**
```json
{
  "_id": "ObjectId(...)",
  "name": "Demo Donor", "email": "demo@raktsetu.in", "password": "$2a$10$...hashed",
  "phone": "9876543210", "gender": "male", "dateOfBirth": "2003-05-14", "weight": 68,
  "bloodGroup": "O+", "isDonor": true, "available": true,
  "lastDonationDate": "2026-06-09", "donationsCount": 3, "reliabilityScore": 72,
  "location": { "type": "Point", "coordinates": [74.6014, 16.8457] },
  "city": "Sangli", "role": "user", "createdAt": "...", "updatedAt": "..."
}
```

**bloodrequests**
```json
{
  "requester": "ObjectId(user)", "patientName": "Ramesh Patil", "bloodGroup": "O-",
  "unitsNeeded": 2, "hospital": "Bharati Hospital", "city": "Sangli",
  "location": { "type": "Point", "coordinates": [74.5795, 16.8615] },
  "urgency": "critical", "contactPhone": "98xxxxxxxx", "status": "open",
  "responses": [ { "donor": "ObjectId(user)", "status": "pledged", "respondedAt": "..." } ],
  "notifiedCount": 12, "expiresAt": "2026-10-18T06:00:00Z"
}
```

## Showcase queries (open these in Compass / mongosh)

**1. Nearest compatible, eligible donors, ranked by match score**: `services/matching.js`
```js
db.users.aggregate([
  { $geoNear: { near: { type: "Point", coordinates: [74.60, 16.85] }, distanceField: "distance",
                maxDistance: 10000, spherical: true,
                query: { isDonor: true, available: true, bloodGroup: { $in: ["A+","A-","O+","O-"] } } } },
  { $addFields: { distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 1] } } },
  { $limit: 5 }
])
```

**2. Atomic seat booking**: no overbooking even with simultaneous clicks
```js
db.camps.findOneAndUpdate(
  { _id: campId, participants: { $ne: userId }, $expr: { $lt: ["$registeredCount", "$capacity"] } },
  { $push: { participants: userId }, $inc: { registeredCount: 1 } }
)
```

**3. Positional update inside an embedded array**: withdraw a pledge
```js
db.bloodrequests.updateOne(
  { _id: reqId, responses: { $elemMatch: { donor: userId, status: "pledged" } } },
  { $set: { "responses.$.status": "withdrawn" } }
)
```

**4. Several stats in one query with `$facet`**: `statsController.overview`
```js
db.users.aggregate([{ $facet: {
  byGroup: [{ $group: { _id: "$bloodGroup", count: { $sum: 1 } } }],
  byCity:  [{ $group: { _id: "$city", count: { $sum: 1 } } }, { $sort: { count: -1 } }]
}}])
```

**5. Donations per month**
```js
db.donations.aggregate([
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, units: { $sum: "$units" } } },
  { $sort: { _id: 1 } }
])
```

**6. Clamp a score atomically with an update pipeline**
```js
db.users.updateOne({ _id: id }, [
  { $set: { reliabilityScore: { $min: [100, { $max: [0, { $add: ["$reliabilityScore", 10] }] }] } } }
])
```

## Indexes
```js
db.users.getIndexes()          // _id, email (unique), location (2dsphere), bloodGroup+isDonor+available, city
db.bloodrequests.getIndexes()  // location (2dsphere), status+bloodGroup, expiresAt (TTL, expireAfterSeconds: 0)
db.notifications.getIndexes()  // user+read+createdAt, createdAt (TTL 30 days)
db.camps.getIndexes()          // location (2dsphere), date
```
Show `explain()` to prove the index is used:
```js
db.users.find({ location: { $near: { $geometry: { type: "Point", coordinates: [74.6, 16.85] }, $maxDistance: 5000 } } }).explain("executionStats")
```
