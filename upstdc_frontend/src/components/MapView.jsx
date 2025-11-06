import React, { useEffect, useMemo } from 'react';
import { useMapFocus } from './MapFocusContext';

/**
 * Lightweight Map wrapper that attempts to use react-leaflet if available.
 * Falls back to a graceful message when libraries are missing.
 *
 * markers: array of project-like objects. Supports fields:
 * - id/_id/code
 * - name/title
 * - status
 * - budget
 * - district
 * - description
 * - lat/lng (preferred) OR location.geojson with Point [lng,lat]
 *
 * Optional props:
 * - onMarkerReady?(project, leafletMarker): callback for future pan/zoom wiring from lists
 * - onMapReady?(leafletMap): expose map instance to parent for programmatic control if needed
 */
// Attempt to require react-leaflet dynamically to avoid build/runtime crashes (outside component)
let RL = null;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  RL = require('react-leaflet');
  // eslint-disable-next-line global-require
  require('leaflet');
} catch {
  RL = null;
}

// PUBLIC_INTERFACE
export default function MapView({
  center = [26.8467, 80.9462],
  zoom = 6,
  markers = [],
  style = { height: 400, width: '100%' },
  onMarkerReady,
  onMapReady,
}) {
  /** Ensure hooks are always called; do not early-return before hooks. */

  const mapFocus = useMapFocus?.() || null;

  // Normalize incoming markers and gracefully skip those without coordinates
  const normalized = useMemo(() => {
    return (markers || [])
      .map((m) => {
        // Prefer explicit lat/lng
        let lat = m?.lat;
        let lng = m?.lng;
        // If not present, try GeoJSON Point in location
        if ((lat == null || lng == null) && m?.location?.type === 'Point' && Array.isArray(m.location.coordinates)) {
          // GeoJSON order: [lng, lat]
          lng = m.location.coordinates[0];
          lat = m.location.coordinates[1];
        } else if ((lat == null || lng == null) && m?.location?.coordinates && m?.location?.type === 'Point') {
          const coords = m.location.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            lng = coords[0];
            lat = coords[1];
          }
        } else if ((lat == null || lng == null) && m?.location?.geometry?.type === 'Point' && Array.isArray(m.location.geometry.coordinates)) {
          const coords = m.location.geometry.coordinates;
          lng = coords[0];
          lat = coords[1];
        }

        if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
          return null; // gracefully skip missing/invalid coordinates
        }

        const id = m.id || m._id || m.code || `${lat},${lng}`;
        const name = m.name || m.title || 'Untitled Project';
        const status = m.status || m.current_status || 'N/A';
        const budget = m.budget != null ? m.budget : m.estimated_budget;
        const district = m.district || m.location_name || m.city || null;
        const description = m.description || m.summary || '';

        return { raw: m, id, name, status, budget, district, description, lat, lng, code: m.code || m._id || m.id };
      })
      .filter(Boolean);
  }, [markers]);

  // If libraries are unavailable, render fallback (after hooks executed)
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

  const { MapContainer, TileLayer, Marker, Popup, useMap } = RL;

  // Helper component to expose map instance when ready
  function MapReadyInner() {
    const map = useMap();
    useEffect(() => {
      if (onMapReady) onMapReady(map);
      if (mapFocus?.registerMap) mapFocus.registerMap(map);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  }

  return (
    <div style={{ ...style }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          // OpenStreetMap standard tiles
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapReadyInner />
        {normalized.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            ref={(ref) => {
              // Let parent capture marker refs to enable pan/zoom on list click (optional)
              if (ref && onMarkerReady) onMarkerReady(m.raw, ref);
              // Also register for global focus API (id -> markerRef)
              try {
                const id = m.raw?.id || m.raw?._id || m.raw?.code || m.id;
                if (mapFocus?.registerMarker && id) {
                  mapFocus.registerMarker(String(id), ref);
                }
              } catch {
                // ignore
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{m.name}</div>
                <div style={{ display: 'grid', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
                  {m.code && <div><strong style={{ color: 'var(--text)' }}>Code:</strong> {m.code}</div>}
                  <div>
                    <strong style={{ color: 'var(--text)' }}>Status:</strong>{' '}
                    <span className="badge" style={{ padding: '2px 8px' }}>{m.status}</span>
                  </div>
                  <div><strong style={{ color: 'var(--text)' }}>Budget:</strong> {m.budget != null ? `₹ ${Number(m.budget).toLocaleString()}` : '-'}</div>
                  {m.district && <div><strong style={{ color: 'var(--text)' }}>District:</strong> {m.district}</div>}
                  {m.description && <div style={{ marginTop: 4, color: 'var(--text)' }}>{String(m.description).slice(0, 120)}{String(m.description).length > 120 ? '…' : ''}</div>}
                </div>
                {/* Link to detail page (uses traditional anchor to avoid hard router dependency here) */}
                {m.code ? (
                  <a
                    href={`/projects/${encodeURIComponent(m.code)}`}
                    style={{ display: 'inline-flex', marginTop: 8, fontWeight: 700, color: 'var(--color-primary)' }}
                    aria-label={`Open details for ${m.name}`}
                  >
                    View details →
                  </a>
                ) : (
                  (m.id || m.raw?._id) && (
                    <a
                      href={`/projects/${encodeURIComponent(m.id || m.raw?._id)}`}
                      style={{ display: 'inline-flex', marginTop: 8, fontWeight: 700, color: 'var(--color-primary)' }}
                      aria-label={`Open details for ${m.name}`}
                    >
                      View details →
                    </a>
                  )
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
