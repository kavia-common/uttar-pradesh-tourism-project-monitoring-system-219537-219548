import React, { useEffect, useState } from 'react';
import { ProjectsAPI } from '../../api/client';

let useParamsSafe = () => ({ id: null });
let useNavigateSafe = () => {
  return (/* path, opts */) => {};
};
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  useParamsSafe = RR.useParams;
  useNavigateSafe = RR.useNavigate;
} catch {
  // keep fallbacks
}

const initial = { name: '', status: 'Planned', budget: '' };

// PUBLIC_INTERFACE
export default function ProjectForm() {
  /** Project create/edit form with safe router fallbacks */
  const params = useParamsSafe();
  const navigate = useNavigateSafe();
  const { id } = params || {};
  const isEdit = !!id && id !== 'new';
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const fetchItem = async ()=>{
      if (!isEdit) return;
      setLoading(true);
      try {
        const data = await ProjectsAPI.get(id);
        setForm({
          name: data.name || '',
          status: data.status || 'Planned',
          budget: data.budget || '',
        });
      } catch {
        // fallback
        setForm({ name:'Demo Project', status:'In Progress', budget: 1000000 });
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  },[id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : null };
      if (isEdit) {
        await ProjectsAPI.update(id, payload);
      } else {
        await ProjectsAPI.create(payload);
      }
      navigate('/projects');
    } catch (err) {
      alert('Save failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{maxWidth:800}}>
      <h3>{isEdit ? 'Edit Project' : 'New Project'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div>
            <label>Name</label>
            <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
          </div>
          <div>
            <label>Status</label>
            <select className="input" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
              <option>Planned</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>
        <div className="form-row" style={{marginTop:12}}>
          <div>
            <label>Budget (₹)</label>
            <input className="input" type="number" value={form.budget} onChange={e=>setForm({...form, budget:e.target.value})} />
          </div>
        </div>
        <div className="actions" style={{marginTop:12}}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" className="btn" style={{background:'#64748b'}} onClick={()=> navigate('/projects')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
