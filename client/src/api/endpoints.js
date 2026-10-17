import api from './client';

/** Every REST endpoint the app uses, in one place. Each returns the response JSON. */
const data = (promise) => promise.then((res) => res.data);

export const authApi = {
  register: (body) => data(api.post('/auth/register', body)),
  login: (body) => data(api.post('/auth/login', body)),
  me: () => data(api.get('/auth/me')),
};

export const userApi = {
  update: (body) => data(api.put('/users/me', body)),
  setAvailability: (available) => data(api.patch('/users/me/availability', { available })),
  changePassword: (body) => data(api.patch('/users/me/password', body)),
  deleteAccount: () => data(api.delete('/users/me')),
  passport: () => data(api.get('/users/me/passport')),
};

export const donorApi = {
  search: (params) => data(api.get('/donors/search', { params })),
  compatibility: (group) => data(api.get('/donors/compatibility', { params: { group } })),
};

export const requestApi = {
  list: (params) => data(api.get('/requests', { params })),
  forMe: () => data(api.get('/requests/for-me')),
  get: (id) => data(api.get(`/requests/${id}`)),
  create: (body) => data(api.post('/requests', body)),
  update: (id, body) => data(api.put(`/requests/${id}`, body)),
  setStatus: (id, status) => data(api.patch(`/requests/${id}/status`, { status })),
  remove: (id) => data(api.delete(`/requests/${id}`)),
  respond: (id, action) => data(api.post(`/requests/${id}/respond`, { action })),
  confirm: (id, donorId) => data(api.post(`/requests/${id}/confirm/${donorId}`)),
};

export const donationApi = {
  mine: () => data(api.get('/donations/me')),
  create: (body) => data(api.post('/donations', body)),
  update: (id, body) => data(api.put(`/donations/${id}`, body)),
  remove: (id) => data(api.delete(`/donations/${id}`)),
};

export const campApi = {
  list: (params) => data(api.get('/camps', { params })),
  get: (id) => data(api.get(`/camps/${id}`)),
  create: (body) => data(api.post('/camps', body)),
  update: (id, body) => data(api.put(`/camps/${id}`, body)),
  remove: (id) => data(api.delete(`/camps/${id}`)),
  register: (id) => data(api.post(`/camps/${id}/register`)),
  unregister: (id) => data(api.delete(`/camps/${id}/register`)),
};

export const notificationApi = {
  list: () => data(api.get('/notifications')),
  unreadCount: () => data(api.get('/notifications/unread-count')),
  markRead: (id) => data(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => data(api.patch('/notifications/read-all')),
  remove: (id) => data(api.delete(`/notifications/${id}`)),
};

export const statsApi = {
  overview: () => data(api.get('/stats/overview')),
  shortage: (city) => data(api.get('/stats/shortage', { params: { city: city || undefined } })),
};
