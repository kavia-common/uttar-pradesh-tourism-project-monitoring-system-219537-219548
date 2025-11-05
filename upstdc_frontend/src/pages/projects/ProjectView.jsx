import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProjectsAPI } from '../../api/client';

export default function ProjectView() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try {
        const data = await ProjectsAPI.get(id);
        setItem(data);
      } catch {
        setItem({ _id: id, name:'Demo Project', status:'In Progress', budget: 1000000, description:'Sample description' });
      }
    };
    load();
  },[id]);

  if (!item) return <div className="card">Loading...</div>;

  const Link = RR ? RR.Link : (props)=> <span {...props} />;

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <h3>{item.name}</h3>
        <div className="badge">{item.status}</div>
        <p style={{marginTop:8}}>Budget: {item.budget ? `₹ ${item.budget.toLocaleString()}` : '-'}</p>
        {item.description && <p>{item.description}</p>}
        <div className="actions">
          <Link className="btn" to={`/projects/${id}/edit`}>Edit</Link>
          <Link className="btn" style={{background:'#64748b'}} to="/projects">Back</Link>
        </div>
      </div>
    </div>
  );
}
