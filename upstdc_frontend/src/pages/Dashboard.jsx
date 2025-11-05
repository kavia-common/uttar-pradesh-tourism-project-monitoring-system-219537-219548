import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const defaultLat = parseFloat(process.env.REACT_APP_DEFAULT_LAT || '26.8467');
const defaultLng = parseFloat(process.env.REACT_APP_DEFAULT_LNG || '80.9462');
const defaultZoom = parseInt(process.env.REACT_APP_DEFAULT_ZOOM || '6', 10);

export default function Dashboard() {
  const kpis = [
    { title: 'Active Projects', value: 24 },
    { title: 'Funds Utilized', value: '₹ 12.4 Cr' },
    { title: 'Inspections Pending', value: 7 },
    { title: 'Milestones Achieved', value: 132 },
  ];

  const demoProjects = [
    { id: 1, name: 'Riverfront Beautification', lat: 26.8467, lng: 80.9462 },
    { id: 2, name: 'Fort Restoration', lat: 27.1767, lng: 78.0081 },
  ];

  return (
    <div className="grid" style={{gap:16}}>
      <div className="grid kpi">
        {kpis.map((k)=>(
          <div key={k.title} className="card">
            <div style={{fontSize:12, color:'var(--muted)'}}>{k.title}</div>
            <div style={{fontSize:24, fontWeight:700}}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Project Locations</h3>
        <div style={{height:400}}>
          <MapContainer center={[defaultLat, defaultLng]} zoom={defaultZoom} style={{height:'100%', width:'100%'}}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {demoProjects.map(p=>(
              <Marker key={p.id} position={[p.lat, p.lng]}>
                <Popup>{p.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
