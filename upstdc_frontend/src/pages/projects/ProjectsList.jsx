import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProjectsAPI } from '../../api/client';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import PageHeader from '../../layout/PageHeader';
import MapView from '../../components/MapView';

// Guard router at module scope with stable fallbacks
let Link = (props) => <span {...props} />;
let useNavigateSafe = () => {
  return (/* path, opts */) => {};
};
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  Link = RR.Link;
  useNavigateSafe = RR.useNavigate;
} catch {
  // keep fallbacks
}

// PUBLIC_INTERFACE
export default function ProjectsList() {
  /** Projects list with guarded routing utilities to avoid build-time failures */
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigateSafe();

  // Optional map wiring: store marker refs and map instance to enable pan/zoom
  const markerRefs = useRef(new Map());
  const mapRef = useRef(null);

  const onMarkerReady = (project, ref) => {
    try {
      const id = project._id || project.id || project.code;
      if (id) markerRefs.current.set(String(id), ref);
    } catch {
      // ignore
    }
  };
  const onMapReady = (map) => {
    mapRef.current = map;
  };

  const defaultCenter = useMemo(() => [parseFloat(process.env.REACT_APP_DEFAULT_LAT || '26.8467'), parseFloat(process.env.REACT_APP_DEFAULT_LNG || '80.9462')], []);
  const defaultZoom = useMemo(() => parseInt(process.env.REACT_APP_DEFAULT_ZOOM || '6', 10), []);

  const panToProject = (p) => {
    const lat = p?.lat ?? p?.location?.coordinates?.[1] ?? p?.location?.geometry?.coordinates?.[1];
    const lng = p?.lng ?? p?.location?.coordinates?.[0] ?? p?.location?.geometry?.coordinates?.[0];
    if (mapRef.current && typeof lat === 'number' && typeof lng === 'number') {
      try {
        mapRef.current.setView([lat, lng], Math.max(defaultZoom, 10), { animate: true });
      } catch {
        // ignore
      }
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await ProjectsAPI.list(q ? { q } : {});
      setItems(Array.isArray(data) ? data : (data.items || []));
    } catch (e) {
      // fall back demo data if API not ready
      setItems([
        { _id: '1', name: 'Demo Project', status: 'In Progress', budget: 1000000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  const LinkEl = Link;

  return (
    <div className="grid" style={{ gap: 16 }}>
      <PageHeader
        title="Projects"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Projects' }]}
        actions={
          <Button onClick={() => navigate('/projects/new')}>New Project</Button>
        }
      />
      <div className="card">
        <div className="actions" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="ghost" onClick={load}>Search</Button>
          </div>
        </div>
      </div>

      <Table
        loading={loading}
        columns={[
          { key: 'name', header: 'Name', render: (p) => (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <LinkEl to={`/projects/${p._id}`}>{p.name}</LinkEl>
              <button
                className="btn btn--sm btn--ghost"
                onClick={() => panToProject(p)}
                title="Locate on map"
                aria-label={`Locate ${p.name} on map`}
                type="button"
              >
                📍
              </button>
            </span>
          ) },
          { key: 'status', header: 'Status', render: (p) => <span className="badge">{p.status || 'N/A'}</span> },
          { key: 'budget', header: 'Budget', render: (p) => (p.budget ? `₹ ${p.budget.toLocaleString()}` : '-') },
          {
            key: 'actions',
            header: 'Actions',
            render: (p) => (
              <div className="actions">
                <LinkEl className="btn" to={`/projects/${p._id}/edit`}>Edit</LinkEl>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!window.confirm('Delete project?')) return;
                    try {
                      await ProjectsAPI.remove(p._id);
                      await load();
                    } catch (e) {
                      alert('Delete failed: ' + e.message);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            )
          }
        ]}
        data={items}
        empty="No projects found"
      />
    </div>
  );
}
