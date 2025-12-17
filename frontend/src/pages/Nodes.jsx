import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import { nodesAPI } from '../services/api';

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState({ type: '', country: '' });
  const [countries, setCountries] = useState([]);
  const [nodeStats, setNodeStats] = useState(null);

  useEffect(() => {
    fetchNodes();
    fetchCountries();
    fetchNodeStats();
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [filter]);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.type) params.node_type = filter.type;
      if (filter.country) params.country = filter.country;
      const response = await nodesAPI.getNodes(params);
      setNodes(response.data);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await nodesAPI.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchNodeStats = async () => {
    try {
      const response = await nodesAPI.getStats();
      setNodeStats(response.data);
    } catch (error) {
      console.error('Failed to fetch node stats:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await nodesAPI.generateNodes(20);
      await fetchNodes();
      await fetchCountries();
      await fetchNodeStats();
    } catch (error) {
      console.error('Failed to generate nodes:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all TOR nodes?')) {
      try {
        await nodesAPI.clearNodes();
        await fetchNodes();
        await fetchNodeStats();
      } catch (error) {
        console.error('Failed to clear nodes:', error);
      }
    }
  };

  const columns = [
    { header: 'Nickname', accessor: 'nickname' },
    { 
      header: 'Type', 
      accessor: 'node_type',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          value === 'Guard' ? 'bg-cyber-success/20 text-cyber-success' :
          value === 'Exit' ? 'bg-cyber-warning/20 text-cyber-warning' :
          'bg-cyber-highlight/20 text-cyber-highlight'
        }`}>
          {value}
        </span>
      )
    },
    { header: 'IP (Masked)', accessor: 'ip_masked', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { header: 'Port', accessor: 'port' },
    { header: 'Bandwidth', accessor: 'bandwidth', render: (v) => `${(v/1000).toFixed(1)} KB/s` },
    { header: 'Country', accessor: 'country' },
    { header: 'Flags', accessor: 'flags', render: (v) => <span className="text-xs">{v}</span> },
    { header: 'Uptime', accessor: 'uptime', render: (v) => `${Math.floor(v/86400)}d` },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text">TOR Nodes</h1>
          <p className="text-cyber-muted mt-1">Collected TOR relay descriptors</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleGenerate} loading={generating} icon={Plus}>
            Generate Nodes
          </Button>
          <Button onClick={fetchNodes} variant="secondary" icon={RefreshCw}>
            Refresh
          </Button>
          <Button onClick={handleClear} variant="danger" icon={Trash2}>
            Clear All
          </Button>
        </div>
      </div>

      {nodeStats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="cyber-card rounded-lg p-4">
            <p className="text-cyber-muted text-sm">Total Nodes</p>
            <p className="text-2xl font-bold text-cyber-highlight">{nodeStats.total}</p>
          </div>
          <div className="cyber-card rounded-lg p-4">
            <p className="text-cyber-muted text-sm">Guard Nodes</p>
            <p className="text-2xl font-bold text-cyber-success">{nodeStats.by_type?.Guard || 0}</p>
          </div>
          <div className="cyber-card rounded-lg p-4">
            <p className="text-cyber-muted text-sm">Middle Relays</p>
            <p className="text-2xl font-bold text-cyber-highlight">{nodeStats.by_type?.Middle || 0}</p>
          </div>
          <div className="cyber-card rounded-lg p-4">
            <p className="text-cyber-muted text-sm">Exit Nodes</p>
            <p className="text-2xl font-bold text-cyber-warning">{nodeStats.by_type?.Exit || 0}</p>
          </div>
        </div>
      )}

      <div className="cyber-card rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-cyber-muted" />
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="bg-cyber-secondary border border-cyber-accent rounded-lg px-4 py-2 text-cyber-text focus:outline-none focus:border-cyber-highlight"
          >
            <option value="">All Types</option>
            <option value="Guard">Guard</option>
            <option value="Middle">Middle</option>
            <option value="Exit">Exit</option>
          </select>
          <select
            value={filter.country}
            onChange={(e) => setFilter({ ...filter, country: e.target.value })}
            className="bg-cyber-secondary border border-cyber-accent rounded-lg px-4 py-2 text-cyber-text focus:outline-none focus:border-cyber-highlight"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(filter.type || filter.country) && (
            <Button 
              onClick={() => setFilter({ type: '', country: '' })}
              variant="secondary"
              size="sm"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyber-highlight border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={nodes} 
          emptyMessage="No TOR nodes found. Click 'Generate Nodes' to create demo data."
        />
      )}
    </div>
  );
}

export default Nodes;
