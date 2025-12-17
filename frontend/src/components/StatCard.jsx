import React from 'react';

function StatCard({ title, value, icon: Icon, color = 'highlight' }) {
  const colorClasses = {
    highlight: 'text-cyber-highlight',
    success: 'text-cyber-success',
    warning: 'text-cyber-warning',
    danger: 'text-cyber-danger',
  };

  return (
    <div className="cyber-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-cyber-muted text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-cyber-accent/50 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
