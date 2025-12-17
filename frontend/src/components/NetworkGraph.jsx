import React from 'react';
import { Shield, Server, Globe } from 'lucide-react';

function NetworkGraph({ circuit }) {
  const entry = circuit?.entry;
  const middle = circuit?.middle;
  const exit = circuit?.exit;

  return (
    <div className="cyber-card rounded-xl p-6">
      <h3 className="text-lg font-bold text-cyber-text mb-6">Probable TOR Circuit Path</h3>
      <p className="text-xs text-cyber-warning mb-4">
        Note: This is a probabilistic reconstruction, not verified path data.
      </p>
      
      <div className="flex items-center justify-between">
        <NodeBox 
          icon={Shield}
          label="ENTRY / GUARD"
          node={entry}
          color="text-cyber-success"
        />
        
        <ConnectionLine />
        
        <NodeBox 
          icon={Server}
          label="MIDDLE RELAY"
          node={middle}
          color="text-cyber-highlight"
        />
        
        <ConnectionLine />
        
        <NodeBox 
          icon={Globe}
          label="EXIT NODE"
          node={exit}
          color="text-cyber-warning"
        />
      </div>
    </div>
  );
}

function NodeBox({ icon: Icon, label, node, color }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-20 h-20 rounded-xl bg-cyber-accent/50 flex items-center justify-center border border-cyber-accent cyber-glow`}>
        <Icon className={`w-10 h-10 ${color}`} />
      </div>
      <p className="text-xs font-bold text-cyber-text mt-3">{label}</p>
      {node ? (
        <div className="text-center mt-2">
          <p className="text-sm text-cyber-highlight font-mono">{node.nickname || 'Unknown'}</p>
          <p className="text-xs text-cyber-muted">{node.country || 'N/A'}</p>
          <p className="text-xs text-cyber-muted font-mono">{node.ip_masked || 'xxx.xxx.xxx.xxx'}</p>
        </div>
      ) : (
        <p className="text-xs text-cyber-muted mt-2">Not detected</p>
      )}
    </div>
  );
}

function ConnectionLine() {
  return (
    <div className="flex-1 mx-4 flex items-center">
      <div className="w-full h-0.5 bg-gradient-to-r from-cyber-accent via-cyber-highlight to-cyber-accent relative">
        <div className="absolute inset-0 bg-cyber-highlight/50 animate-pulse" />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="w-0 h-0 border-l-8 border-l-cyber-highlight border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph;
