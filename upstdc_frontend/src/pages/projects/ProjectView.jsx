import React, { useEffect, useState } from 'react';
import { ProjectsAPI } from '../../api/client';

let useParamsSafe = () => ({ id: null });
let LinkSafe = (props) => <span {...props} />;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  useParamsSafe = RR.useParams;
  LinkSafe = RR.Link;
} catch {
  // keep fallbacks
}

// PUBLIC_INTERFACE
export default function ProjectView() {
  /** Project detail view with safe router guards */
  const params = useParamsSafe();
  const { id } = params || {};
  const [item, setItem] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      const pid = id || '1';
      try {
        const data = await ProjectsAPI.get(pid);
        setItem(data);
      } catch {
        setItem({ _id: pid, name:'Demo Project', status:'In Progress', budget: 1000000, description:'Sample description' });
      }
    };
    load();
  },[id]);

  if (!item) return <div className="card">Loading...</div>;

  const LinkEl = LinkSafe;

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <h3>{item.name}</h3>
        <div className="badge">{item.status}</div>
        <p style={{marginTop:8}}>Budget: {item.budget ? `₹ ${item.budget.toLocaleString()}` : '-'}</p>
        {item.description && <p>{item.description}</p>}
        <div className="actions">
          <LinkEl className="btn" to={`/projects/${id || item._id}/edit`}>Edit</LinkEl>
          <LinkEl className="btn" style={{background:'#64748b'}} to="/projects">Back</LinkEl>
        </div>
      </div>
    </div>
  );
}
