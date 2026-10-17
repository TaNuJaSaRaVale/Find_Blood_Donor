# hooks/: reusable React hooks

| Hook | Returns | Use |
|---|---|---|
| `useAsync(loader, deps)` | `{ data, loading, error, reload, setData }` | Runs an API call when `deps` change. `reload()` refetches after create/update/delete |
| `useGeolocation()` | `{ locate, locating }` | `await locate()` → `{ lat, lng }` from the browser/phone GPS, with friendly errors if permission is denied |

Example:
```js
const { data, loading, error, reload } = useAsync(() => campApi.list({ when }), [when]);
```
