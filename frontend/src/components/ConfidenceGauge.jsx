import React from 'react';

function ConfidenceGauge({ value, size = 200 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const getColor = (val) => {
    if (val >= 70) return '#00ff88';
    if (val >= 40) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="text-4xl font-bold"
          style={{ color: getColor(value) }}
        >
          {value.toFixed(1)}%
        </span>
        <span className="text-cyber-muted text-sm">Confidence</span>
      </div>
    </div>
  );
}

export default ConfidenceGauge;
