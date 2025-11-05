import React, { useState } from 'react';
import { UploadAPI, getApiBase } from '../api/client';
import Button from '../components/ui/Button';
import PageHeader from '../layout/PageHeader';

export default function Uploads() {
  const [files, setFiles] = useState([]);
  const [uploaded, setUploaded] = useState([]);

  const onSelect = (e) => setFiles(Array.from(e.target.files || []));

  const onUpload = async () => {
    const results = [];
    for (const f of files) {
      try {
        const res = await UploadAPI.uploadImage(f);
        results.push(res);
      } catch (e) {
        alert(`Failed to upload ${f.name}: ${e.message}`);
      }
    }
    setUploaded([...uploaded, ...results]);
    setFiles([]);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <PageHeader title="Uploads" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Uploads' }]} />
      <div className="card">
        <h3>Image Uploads</h3>
        <input type="file" multiple accept="image/*" onChange={onSelect} />
        <div className="actions" style={{ marginTop: 12 }}>
          <Button onClick={onUpload} disabled={files.length === 0}>Upload</Button>
        </div>

        {uploaded.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>Uploaded</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {uploaded.map((u, i) => (
                <div key={i} className="card">
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.filename || u.key || u.id || 'image'}</div>
                  {u.path || u.url ? (
                    <img alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} src={(u.url || `${getApiBase()}${u.path}`)} />
                  ) : <div>No preview</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
