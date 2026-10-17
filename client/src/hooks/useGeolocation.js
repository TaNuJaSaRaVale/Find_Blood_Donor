import { useCallback, useState } from 'react';

/** Asks the browser (or phone) for the current GPS position. */
export function useGeolocation() {
  const [locating, setLocating] = useState(false);

  const locate = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Location is not supported on this device'));
          return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocating(false);
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => {
            setLocating(false);
            reject(new Error(err.code === 1 ? 'Location permission denied - pick your city instead' : 'Could not get your location'));
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }),
    [],
  );

  return { locate, locating };
}
