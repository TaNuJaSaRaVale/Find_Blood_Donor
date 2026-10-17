# api/: talking to the backend

| File | What it does |
|---|---|
| `client.js` | Creates one **axios** instance with `baseURL = VITE_API_URL or /api`. A request interceptor adds `Authorization: Bearer <token>`. A response interceptor turns failures into a friendly `error.message` and fires a logout event on **401** |
| `endpoints.js` | One function per REST endpoint, grouped as `authApi`, `userApi`, `donorApi`, `requestApi`, `donationApi`, `campApi`, `notificationApi`, `statsApi`. Each returns the JSON body |

Usage in a page:
```js
import { requestApi } from '../api/endpoints';
const { request } = await requestApi.get(id);
```
Pages never call axios directly, so changing the API (or reusing it in React Native) only touches this folder.
