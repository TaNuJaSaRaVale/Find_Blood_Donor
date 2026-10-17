# controllers/: what each API endpoint does

A controller receives `req` (input) and sends `res.json(...)` (output).
Errors are thrown as `new HttpError(status, message)` and turned into JSON by the error handler.

| File | Handles | Interesting MongoDB features used |
|---|---|---|
| `authController.js` | register, login, me | bcrypt compare, unique email |
| `userController.js` | profile CRUD, availability, password, delete account, **Donor Passport** | cascade cleanup with `deleteMany`/`updateMany`/`$pull`; aggregation for totals |
| `donorController.js` | donor search, compatibility lookup | `$geoNear` pipeline (see `services/matching.js`) |
| `requestController.js` | request CRUD, SOS alerts, pledge/withdraw, confirm donation | `$near`, atomic `findOneAndUpdate` with `$push`, positional `$` update, TTL `expiresAt` |
| `donationController.js` | donation history CRUD | `$group` + `$max` to recompute last donation date |
| `campController.js` | camp CRUD, book/cancel seat | **atomic booking** with `$expr` + `$inc` + `$push` |
| `notificationController.js` | inbox, unread count, mark read, delete | `updateMany`, compound index |
| `statsController.js` | Insights page, **Shortage Radar** | `$facet`, `$group`, `$dateToString`, `distinct` |

## Privacy rules enforced here
- Search results never include phone/email (`$project`).
- Only the requester sees who pledged and their phone (`present()` in `requestController.js`).
- Only the organizer sees a camp's participant list.
- Users can only edit/delete their **own** requests, donations and camps (403 otherwise).
