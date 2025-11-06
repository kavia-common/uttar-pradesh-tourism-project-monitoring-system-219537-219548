import React, { useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import PageHeader from '../layout/PageHeader';
import KPIStat from '../components/ui/KPIStat';
import Table from '../components/ui/Table';

/**
 * Static Reports page: renders sample KPIs, a simple utilization trend (last 12 months),
 * and a projects list table using in-file static data. Provides CSV/JSON export buttons that
 * generate files client-side. No API import/usage.
 *
 * Guards (loading/error) exist but are inert since data is static.
 */

// PUBLIC_INTERFACE
export default function Reports() {
  /** Static Reports page for guest mode (no backend calls). */

  // 1) Static sample data (edit here to tweak the demo)
  const sampleProjects = useMemo(() => ([
    { code: 'PJT-001', name: 'Riverfront Beautification', district: 'Lucknow', status: 'In Progress', budget: 45000000 },
    { code: 'PJT-002', name: 'Fort Restoration',          district: 'Agra',    status: 'Planned',     budget: 18000000 },
    { code: 'PJT-003', name: 'Eco-Trail Development',     district: 'Varanasi',status: 'On Hold',     budget:  7500000 },
    { code: 'PJT-004', name: 'Museum Revamp',              district: 'Jhansi',  status: 'Completed',   budget: 12500000 },
    { code: 'PJT-005', name: 'Heritage Walk Signage',      district: 'Ayodhya', status: 'In Progress', budget:  5200000 },
  ]), []);

  const utilization12m = useMemo(() => (
    // last 12 months utilization (₹ in crores)
    [12, 18, 10, 22, 28, 35, 30, 40, 38, 44, 48, 52]
  ), []);

  // KPI calculations
  const kpiTotalProjects = sampleProjects.length;
  const kpiByStatus = sampleProjects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const kpiTotalBudget = sampleProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

  // Inert guards (kept for parity with dynamic pages)
  const [loading] = useState(false);
  const [error] = useState('');

  // 2) Rendering helpers (no external libs)
  function UtilizationSparkline({ data }) {
    const points = Array.isArray(data) ? data : [];
    const w = 520;
    const h = 220;
    const pad = 16;

    if (!points.length) {
      return <div className="chart-block" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 12 }}>No data</div>;
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = Math.max(1, max - min);
    const stepX = (w - pad * 2) / Math.max(1, points.length - 1);
    const toX = (i) => pad + i * stepX;
    const toY = (v) => {
      const norm = (v - min) / range;
      return h - pad - norm * (h - pad * 2);
    };
    const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');

    return (
      <div className="chart-block" style={{ padding: 8 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Utilization trend (last 12 months)">
          {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
            <line key={i} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2)} y2={pad + g * (h - pad * 2)} stroke="var(--border)" strokeWidth="1" />
          ))}
          <path d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="rgba(59,130,246,0.10)" />
          <path d={d} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1])} r="3.5" fill="var(--color-accent)" />
        </svg>
      </div>
    );
  }

  function Bars({ data }) {
    const arr = Array.isArray(data) ? data : [];
    if (!arr.length) {
      return <div className="chart-block" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 12 }}>No data</div>;
    }
    const max = Math.max(...arr, 1);
    return (
      <div className="chart-block" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 12px 8px' }}>
        {arr.map((v, i) => {
          const hPct = Math.max(8, Math.round((v / max) * 100));
          return (
            <div
              key={i}
              className="skeleton"
              style={{ width: 18, height: `${hPct}%`, minHeight: 10, borderRadius: 8, flexShrink: 0 }}
              title={`${v}`}
              aria-label={`Bar ${i + 1}: ${v}`}
            />
          );
        })}
      </div>
    );
  }

  // 3) Export helpers
  const exportJSON = () => {
    const payload = {
      summary: {
        total_projects: kpiTotalProjects,
        by_status: kpiByStatus,
        total_budget_inr: kpiTotalBudget,
      },
      utilization_last12m_cr: utilization12m,
      projects: sampleProjects,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports_sample.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    // CSV for project list
    const headers = ['code', 'name', 'district', 'status', 'budget'];
    const rows = sampleProjects.map(p => [
      p.code,
      p.name,
      p.district,
      p.status,
      Number(p.budget || 0)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => {
      const s = String(v ?? '');
      // Escape if comma/quote/newline
      if (/[",\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_list.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // 4) Columns for table (using in-file Table component)
  const columns = [
    { key: 'name', header: 'Name', render: (p) => <span><strong>{p.name}</strong><div className="text-muted" style={{ fontSize: 12 }}>{p.code}</div></span> },
    { key: 'code', header: 'Code', render: (p) => <span className="badge" title={p.code}>{p.code}</span> },
    { key: 'district', header: 'District' },
    { key: 'status', header: 'Status', render: (p) => <span className="badge">{p.status}</span> },
    { key: 'budget', header: 'Budget (₹)', render: (p) => (p.budget ? `₹ ${Number(p.budget).toLocaleString()}` : '-') },
  ];

  // 5) Render
  return (
    <div className="grid" style={{ gap: 16 }}>
      <PageHeader
        title="Reports"
        subtitle="Static project reports (demo). Exports are generated on the client."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="actions">
            <Button variant="ghost" onClick={exportCSV}>Export CSV</Button>
            <Button onClick={exportJSON}>Export JSON</Button>
          </div>
        }
      />

      {/* Summary KPIs */}
      <div className="grid kpi">
        <KPIStat label="Total Projects" value={kpiTotalProjects} color="var(--color-primary)" />
        <KPIStat label="Total Budget (₹)" value={`₹ ${kpiTotalBudget.toLocaleString()}`} color="var(--color-accent)" />
        <KPIStat label="Completed" value={kpiByStatus['Completed'] || 0} color="var(--color-success)" />
        <KPIStat label="In Progress" value={kpiByStatus['In Progress'] || 0} color="var(--color-warning)" />
      </div>

      {/* Utilization trend + simple bars as companion */}
      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
        <div className="card">
          <h3 style={{ marginBottom: 8 }}>Utilization Trend (last 12 months)</h3>
          <UtilizationSparkline data={utilization12m} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 8 }}>Monthly Bars</h3>
          <Bars data={utilization12m} />
        </div>
      </div>

      {/* Projects table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3>Projects List</h3>
          <div className="actions">
            <Button variant="ghost" onClick={exportCSV}>Export CSV</Button>
            <Button onClick={exportJSON}>Export JSON</Button>
          </div>
        </div>
        {error && <div className="badge" style={{ background: 'var(--color-error)', marginBottom: 8 }}>{error}</div>}
        <Table columns={columns} data={sampleProjects} loading={loading} empty="No projects" />
      </div>
    </div>
  );
}
