import React from 'react';

/**
 * Simple Table component expecting columns and data.
 * columns: [{ key: 'name', header: 'Name', render?: (row) => node }]
 * data: array of objects
 */
// PUBLIC_INTERFACE
export default function Table({ columns = [], data = [], empty = 'No data', loading = false }) {
  return (
    <div className="table-wrapper card" role="region" aria-live="polite">
      <table className="table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key || c.header} scope="col">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 18, width: '70%' }} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty">{empty}</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || row._id || idx}>
                {columns.map(c => (
                  <td key={c.key || c.header}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
