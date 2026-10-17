import toast from 'react-hot-toast';
import MapView from './MapView';
import { CITIES, DEFAULT_CENTER, nearestCity } from '../utils/cities';
import { useGeolocation } from '../hooks/useGeolocation';

/**
 * Lets the user set a location 3 ways: GPS button, city quick-pick, or clicking the map.
 * value = { lat, lng, city }
 */
export default function LocationPicker({ value, onChange, height = 220 }) {
  const { locate, locating } = useGeolocation();
  const center = value?.lat ? value : DEFAULT_CENTER;

  const set = (lat, lng, city) => onChange({ lat, lng, city: city ?? (nearestCity(lat, lng) || value?.city || '') });

  const useMyLocation = async () => {
    try {
      const { lat, lng } = await locate();
      set(lat, lng);
      toast.success('Location detected');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="location-picker">
      <div className="location-picker__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={useMyLocation} disabled={locating}>
          {locating ? 'Locating…' : '📍 Use my location'}
        </button>
        <select
          className="input input--sm"
          value=""
          onChange={(e) => {
            const c = CITIES.find((x) => x.city === e.target.value);
            if (c) set(c.lat, c.lng, c.city);
          }}
        >
          <option value="">or pick a city…</option>
          {CITIES.map((c) => (
            <option key={c.city} value={c.city}>{c.city}</option>
          ))}
        </select>
      </div>
      <MapView center={center} zoom={13} height={height} onClick={({ lat, lng }) => set(lat, lng)} you={value?.lat ? { ...value, label: 'Selected location' } : null} />
      <p className="field__hint">
        {value?.lat ? `📌 ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)} – tap the map to fine-tune` : 'Tap the map to drop a pin'}
      </p>
    </div>
  );
}
