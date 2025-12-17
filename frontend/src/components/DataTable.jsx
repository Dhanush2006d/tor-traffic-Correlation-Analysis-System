import React from 'react';

function DataTable({ columns, data, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="cyber-card rounded-xl p-8 text-center">
        <p className="text-cyber-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="cyber-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-cyber-accent/50 border-b border-cyber-accent">
              {columns.map((col, idx) => (
                <th 
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-bold text-cyber-highlight uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-accent/30">
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                className="hover:bg-cyber-accent/20 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx}
                    className="px-4 py-3 text-sm text-cyber-text whitespace-nowrap"
                  >
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
