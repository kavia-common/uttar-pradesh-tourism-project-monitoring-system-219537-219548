import React, { useState } from 'react';
import { ReportsAPI } from '../api/client';

export default function Reports() {
  const [key, setKey] = useState('projects-summary');
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await ReportsAPI.download(key);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card" style={{maxWidth:600}}>
      <h3>Reports</h3>
      <label>Report Type</label>
      <select className="input" value={key} onChange={e=>setKey(e.target.value)}>
        <option value="projects-summary">Projects Summary</option>
        <option value="funds-utilization">Funds Utilization</option>
        <option value="inspections">Inspections</option>
      </select>
      <div className="actions" style={{marginTop:12}}>
        <button className="btn" disabled={downloading} onClick={download}>
          {downloading ? 'Preparing...' : 'Download'}
        </button>
      </div>
    </div>
  );
}
