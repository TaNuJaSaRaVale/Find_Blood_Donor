# seed/: demo data generator

```bash
npm run seed
```
⚠️ **Deletes all existing data** in the configured database, then inserts:

| Data | Count | Details |
|---|---|---|
| Users | 73 | 3 demo accounts + 70 random donors around Sangli, Miraj, Kolhapur, Islampur, Karad, Satara, Pune with a realistic Indian blood-group distribution |
| Donations | ~230 | History matching each donor's `donationsCount` |
| Blood requests | 8 | Critical / urgent / planned, including a rare AB− and a Bombay (hh) request |
| Camps | 4 | One at WCE, one almost full (to demo the "full" check), one in the past |
| Notifications | 3 | So the 🔔 bell has something to show |

Random numbers use a fixed seed, so **you get the same data every time** (handy before a demo).

### Demo accounts
| Email | Password |
|---|---|
| demo@raktsetu.in | demo1234 |
| priya@raktsetu.in | demo1234 |
| rare@raktsetu.in | demo1234 |
| donor1@raktsetu.in … donor70@raktsetu.in | password123 |

Note: `insertMany` skips Mongoose `save` hooks, so passwords are hashed with bcrypt in the script itself.
