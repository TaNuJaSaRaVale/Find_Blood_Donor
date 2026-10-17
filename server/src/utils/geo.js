import { HttpError } from './httpError.js';

/** Builds a GeoJSON Point. GeoJSON order is [longitude, latitude]! */
export function toPoint(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new HttpError(400, 'A valid location (lat, lng) is required');
  }
  return { type: 'Point', coordinates: [longitude, latitude] };
}

/** Reads ?lat=&lng= from a query string; returns null if absent. */
export function pointFromQuery(query) {
  if (query.lat === undefined || query.lng === undefined || query.lat === '' || query.lng === '') return null;
  return toPoint(query.lat, query.lng);
}

/** Straight-line distance between two GeoJSON points in km (haversine formula). */
export function distanceKm(a, b) {
  const [lng1, lat1] = a.coordinates;
  const [lng2, lat2] = b.coordinates;
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const clampRadiusKm = (value, fallback = 10) =>
  Math.min(Math.max(Number(value) || fallback, 1), 200);
