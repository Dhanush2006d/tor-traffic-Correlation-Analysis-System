import React, { useState, useEffect } from 'react';
import { Network, Clock, Search, FileText, Play, Database, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import { statsAPI, nodesAPI, sessionsAPI } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_nodes: 0,
    total_sessions: 0,
    total_analyses: 0,
    completed_analyses: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDemoData = async () => {
    try {
      setGenerating(true);
      await nodesAPI.generateNodes(20);
      await sessionsAPI.generateDemo(100);
      await fetchStats();
    } catch (error) {
      console.error('Failed to generate demo data:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleRunSampleInvestigation = () => {
    navigate('/analysis');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cyber-text">Dashboard</h1>
        <p className="text-cyber-muted mt-1">TOR Traffic Correlation Analysis System Overview</p>
      </div>

      <div className="cyber-card rounded-xl p-6 mb-8 border-l-4 border-cyber-warning">
        <h2 className="text-lg font-bold text-cyber-warning mb-2">FORENSIC DISCLAIMER</h2>
        <p className="text-sm text-cyber-text leading-relaxed">
          This system provides <span className="text-cyber-highlight font-semibold">probabilistic correlation analysis</span> only. 
          All results should be treated as investigative leads requiring independent verification. 
          This tool does NOT claim to de-anonymize TOR traffic or definitively identify users.
          Results must be corroborated with additional evidence before any legal action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="TOR Nodes" 
          value={loading ? '...' : stats.total_nodes} 
          icon={Network} 
          color="highlight" 
        />
        <StatCard 
          title="Traffic Sessions" 
          value={loading ? '...' : stats.total_sessions} 
          icon={Clock} 
          color="success" 
        />
        <StatCard 
          title="Total Analyses" 
          value={loading ? '...' : stats.total_analyses} 
          icon={Search} 
          color="warning" 
        />
        <StatCard 
          title="Completed" 
          value={loading ? '...' : stats.completed_analyses} 
          icon={FileText} 
          color="success" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyber-text mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateDemoData}
              loading={generating}
              icon={Database}
              className="w-full justify-center"
            >
              Generate Demo Data
            </Button>
            <Button 
              onClick={handleRunSampleInvestigation}
              variant="success"
              icon={Play}
              className="w-full justify-center"
            >
              Run Sample Investigation
            </Button>
            <Button 
              onClick={fetchStats}
              variant="secondary"
              icon={RefreshCw}
              className="w-full justify-center"
            >
              Refresh Statistics
            </Button>
          </div>
        </div>

        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyber-text mb-4">System Status</h3>
          <div className="space-y-4">
            <StatusItem label="Database" status="online" />
            <StatusItem label="Correlation Engine" status="ready" />
            <StatusItem label="Report Generator" status="ready" />
            <StatusItem label="PCAP Analyzer" status="available" />
          </div>
        </div>
      </div>

      <div className="cyber-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-cyber-text mb-4">Analysis Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <WorkflowStep number={1} title="Collect Nodes" description="Generate or collect TOR relay descriptors" />
          <WorkflowStep number={2} title="Upload Traffic" description="Upload PCAP files or generate demo traffic" />
          <WorkflowStep number={3} title="Run Analysis" description="Execute correlation engine on traffic data" />
          <WorkflowStep number={4} title="Review Results" description="Examine confidence scores and circuit paths" />
          <WorkflowStep number={5} title="Generate Report" description="Create PDF forensic report with findings" />
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }) {
  const statusColors = {
    online: 'bg-cyber-success',
    ready: 'bg-cyber-highlight',
    available: 'bg-cyber-warning',
    offline: 'bg-cyber-danger'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-cyber-text">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
        <span className="text-cyber-muted text-sm capitalize">{status}</span>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-cyber-accent border border-cyber-highlight flex items-center justify-center mx-auto mb-3">
        <span className="text-cyber-highlight font-bold">{number}</span>
      </div>
      <h4 className="text-sm font-bold text-cyber-text mb-1">{title}</h4>
      <p className="text-xs text-cyber-muted">{description}</p>
    </div>
  );
}

export default Dashboard;
