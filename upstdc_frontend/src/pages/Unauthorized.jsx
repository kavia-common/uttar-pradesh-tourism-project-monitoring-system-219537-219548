import React from 'react';
let RR = null;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  RR = require('react-router-dom');
} catch (e) {
  RR = null;
}

export default function Unauthorized() {
  const Link = RR ? RR.Link : (props)=> <span {...props} />;
  return (
    <div className="content" style={{maxWidth:600, margin:'60px auto'}}>
      <div className="card">
        <h2>Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
        <Link className="btn" to="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
}
