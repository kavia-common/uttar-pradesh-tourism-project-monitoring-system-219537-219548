import React, { createContext, useContext, useMemo, useRef, useCallback } from 'react';

/**
 * MapFocusContext provides a stable API to programmatically control the map
 * from anywhere within the provider subtree.
 *
 * API:
 * - focusLatLng(lat: number, lng: number, options?: { zoom?: number, openPopup?: boolean })
 * - focusProject(projectLike, options?) // extracts coordinates like MapView does
 * - registerMap(mapInstance) // internal: MapView calls this once when ready
 * - registerMarker(id, markerRef) // internal: MapView calls this on each marker
 *
 * Notes:
 * - This avoids conditional hooks by being a pure context.
 * - Consumers can import useMapFocus() and call focusProject on 'pin' click.
 */

// INTERNAL: basic extractor used both here and in MapView
function extractLatLng(p) {
  let lat = p?.lat;
  let lng = p?.lng;

  // Try GeoJSON shapes
  if ((lat == null || lng == null) && p?.location?.type === 'Point' && Array.isArray(p?.location?.coordinates)) {
    lng = p.location.coordinates[0];
    lat = p.location.coordinates[1];
  } else if ((lat == null || lng == null) && p?.location?.coordinates && p?.location?.type === 'Point') {
    const coords = p.location.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      lng = coords[0];
      lat = coords[1];
    }
  } else if ((lat == null || lng == null) && p?.location?.geometry?.type === 'Point' && Array.isArray(p?.location?.geometry?.coordinates)) {
    const coords = p.location.geometry.coordinates;
    lng = coords[0];
    lat = coords[1];
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

const MapFocusCtx = createContext(null);

// PUBLIC_INTERFACE
export function useMapFocus() {
  /** Hook to access focus API. Must be used within MapViewProvider. */
  const ctx = useContext(MapFocusCtx);
  if (!ctx) throw new Error('useMapFocus must be used within MapViewProvider');
  return ctx;
}

// PUBLIC_INTERFACE
export function MapViewProvider({ children, defaultZoom = 12 }) {
  /**
   * Provides Map focus functions and stores refs to the map and markers.
   * defaultZoom is used if consumer doesn't specify a zoom.
   */
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  const registerMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const registerMarker = useCallback((id, markerRef) => {
    if (!id) return;
    if (markerRef) {
      markersRef.current.set(String(id), markerRef);
    } else {
      markersRef.current.delete(String(id));
    }
  }, []);

  const focusLatLng = useCallback((lat, lng, options = {}) => {
    const map = mapRef.current;
    if (!map || typeof lat !== 'number' || typeof lng !== 'number') return false;

    const zoom = typeof options.zoom === 'number' ? options.zoom : Math.max(defaultZoom, 12);
    try {
      map.setView([lat, lng], zoom, { animate: true });
      return true;
    } catch {
      return false;
    }
  }, [defaultZoom]);

  const focusProject = useCallback((project, options = {}) => {
    const coords = extractLatLng(project);
    if (!coords) return false;

    const ok = focusLatLng(coords.lat, coords.lng, options);

    // Try to open marker popup if requested and marker is known
    if (ok && options.openPopup) {
      const id = project?.id || project?._id || project?.code || `${coords.lat},${coords.lng}`;
      const ref = markersRef.current.get(String(id));
      try {
        // react-leaflet v4 stores leaflet instance on ref?.leafletElement or ref?.instance depending on versions
        const m = ref?.leafletElement || ref?.instance || ref; // best effort
        m?.openPopup?.();
      } catch {
        // ignore
      }
    }
    return ok;
  }, [focusLatLng]);

  const value = useMemo(() => ({
    registerMap,
    registerMarker,
    focusLatLng,
    focusProject,
  }), [registerMap, registerMarker, focusLatLng, focusProject]);

  return <MapFocusCtx.Provider value={value}>{children}</MapFocusCtx.Provider>;
}

// PUBLIC_INTERFACE
export function extractProjectLatLng(project) {
  /** Helper to check availability of coordinates for guards (e.g., disable pin). */
  const coords = extractLatLng(project);
  return coords || null;
}
