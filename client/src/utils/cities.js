/** Quick-pick city centres (used when the browser cannot give a GPS location). */
export const CITIES = [
  { city: 'Sangli', lat: 16.8524, lng: 74.5815 },
  { city: 'Miraj', lat: 16.8222, lng: 74.645 },
  { city: 'Kolhapur', lat: 16.705, lng: 74.2433 },
  { city: 'Islampur', lat: 17.05, lng: 74.2667 },
  { city: 'Karad', lat: 17.289, lng: 74.1817 },
  { city: 'Satara', lat: 17.6805, lng: 74.0183 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
];

export const DEFAULT_CENTER = { lat: 16.8457, lng: 74.6014 }; // Walchand College of Engineering, Sangli

/** Nearest preset city name for a coordinate - used to auto-fill the "city" field. */
export function nearestCity(lat, lng) {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < bestD) [best, bestD] = [c, d];
  }
  return bestD < 0.15 ? best.city : '';
}
