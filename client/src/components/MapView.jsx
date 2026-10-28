import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';

/** Re-centres the map when the `center` prop changes. */
function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom());
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

function ClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/**
 * OpenStreetMap map (free, no API key).
 * markers: [{ id, lat, lng, color, radius, popup }]
 */
export default function MapView({ center, zoom = 12, markers = [], radiusKm, onClick, height = 360, you }) {
  return (
    <div className="map" style={{ height }}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <Recenter center={center} />
        <ClickHandler onClick={onClick} />
        {radiusKm && (
          <Circle center={[center.lat, center.lng]} radius={radiusKm * 1000} pathOptions={{ color: '#c81e3a', weight: 1, fillOpacity: 0.05 }} />
        )}
        {you && (
          <CircleMarker center={[you.lat, you.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}>
            <Popup>{you.label || 'You are here'}</Popup>
          </CircleMarker>
        )}
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={m.radius || 8}
            pathOptions={{ color: '#fff', weight: 2, fillColor: m.color || '#c81e3a', fillOpacity: 0.9 }}
          >
            {m.popup && <Popup>{m.popup}</Popup>}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
