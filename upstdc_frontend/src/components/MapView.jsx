import React from 'react';

/**
 * Lightweight Map wrapper that attempts to use react-leaflet if available.
 * Falls back to a graceful message when libraries are missing.
 */
let RL = null;
try {
  // Attempt to require react-leaflet dynamically to avoid build/runtime crashes
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  RL = require('react-leaflet');
} catch (e) {
  RL = null;
}

// PUBLIC_INTERFACE
export default function MapView({ center = [26.8467, 80.9462], zoom = 6, markers = [], style = { height: 400, width: '100%' } }) {
  /** Renders a Leaflet map if react-leaflet is available; otherwise renders a helpful fallback. */
  if (!RL) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Map unavailable</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Map libraries are not loaded. Please run: npm install
          </div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = RL;

  return (
    <div style={{ ...style }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          // OpenStreetMap standard tiles
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id || `${m.lat},${m.lng}`} position={[m.lat, m.lng]}>
            {m.name ? <Popup>{m.name}</Popup> : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
