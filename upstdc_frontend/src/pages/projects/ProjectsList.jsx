import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectsAPI } from '../../api/client';

export default function ProjectsList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

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

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <div className="actions" style={{justifyContent:'space-between'}}>
          <div style={{display:'flex', gap:8}}>
            <input className="input" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
            <button className="btn" onClick={load}>Search</button>
          </div>
          <button className="btn" onClick={()=>nav('/projects/new')}>New Project</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4}>No projects found</td></tr>
            ) : items.map(p=>(
              <tr key={p._id}>
                <td><Link to={`/projects/${p._id}`}>{p.name}</Link></td>
                <td><span className="badge">{p.status || 'N/A'}</span></td>
                <td>{p.budget ? `₹ ${p.budget.toLocaleString()}` : '-'}</td>
                <td className="actions">
                  <Link className="btn" to={`/projects/${p._id}/edit`}>Edit</Link>
                  <button className="btn" style={{background:'#EF4444'}} onClick={async ()=>{
                    if (!window.confirm('Delete project?')) return;
                    try {
                      await ProjectsAPI.remove(p._id);
                      await load();
                    } catch (e) {
                      alert('Delete failed: ' + e.message);
                    }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
