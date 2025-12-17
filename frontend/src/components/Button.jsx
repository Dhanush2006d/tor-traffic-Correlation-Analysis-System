import React from 'react';

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon: Icon,
  className = ''
}) {
  const variants = {
    primary: 'bg-cyber-accent hover:bg-cyber-accent/80 text-cyber-highlight border border-cyber-highlight/30',
    secondary: 'bg-cyber-secondary hover:bg-cyber-secondary/80 text-cyber-text border border-cyber-accent',
    success: 'bg-cyber-success/20 hover:bg-cyber-success/30 text-cyber-success border border-cyber-success/50',
    danger: 'bg-cyber-danger/20 hover:bg-cyber-danger/30 text-cyber-danger border border-cyber-danger/50',
    warning: 'bg-cyber-warning/20 hover:bg-cyber-warning/30 text-cyber-warning border border-cyber-warning/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-medium rounded-lg transition-all
        flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
