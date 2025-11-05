import React, { useState } from 'react';
import { AuthAPI } from '../api/client';
import { useAuth } from '../store/auth';

// Guard navigate at module scope with a stable fallback
let useNavigateSafe = () => {
  // no-op navigate replacement
  return (/* path, opts */) => {};
};
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  useNavigateSafe = RR.useNavigate;
} catch {
  // keep fallback
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigateSafe(); // always call a hook (real or fallback) in the same order
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const data = await AuthAPI.login(form);
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErr(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content" style={{maxWidth:420, margin:'60px auto'}}>
      <div className="card">
        <h2>Sign in</h2>
        {err && <div className="badge" style={{background:'var(--color-error)', marginBottom:8}}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div>
              <label>Email</label>
              <input className="input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
            </div>
            <div>
              <label>Password</label>
              <input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
            </div>
          </div>
          <div style={{marginTop:12}} className="actions">
            <button className="btn" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
