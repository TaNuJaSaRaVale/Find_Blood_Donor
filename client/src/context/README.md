# context/: global state

## `AuthContext.jsx`
Holds the logged-in **user** so any component can read it with `useAuth()`.

| Value | Meaning |
|---|---|
| `user` | Current user object, or `null` |
| `loading` | `true` while restoring the session on page load |
| `login(email, password)` | Calls the API, saves the JWT to `localStorage`, sets `user` |
| `register(form)` | Same for sign-up |
| `logout()` | Clears token + user |
| `refreshUser()` / `setUser()` | Update the user after profile changes |

On startup it reads the saved token and calls `GET /api/auth/me` to restore the session.
It also listens for the `raktsetu:unauthorized` event (fired on any 401) to log out automatically.
