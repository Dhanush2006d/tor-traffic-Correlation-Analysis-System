import React, { useState, useEffect, useRef } from 'react';
import { Play, Upload, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import ConfidenceGauge from '../components/ConfidenceGauge';
import NetworkGraph from '../components/NetworkGraph';
import Button from '../components/Button';
import { sessionsAPI, analysisAPI, nodesAPI } from '../services/api';

function Analysis() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [timeWindow, setTimeWindow] = useState(5.0);
  const [analystNotes, setAnalystNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [nodeCount, setNodeCount] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchNodeCount();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionsAPI.getSessions();
      setSessions(response.data);
      if (response.data.length > 0 && !selectedSession) {
        setSelectedSession(response.data[0].session_id);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchNodeCount = async () => {
    try {
      const response = await nodesAPI.getStats();
      setNodeCount(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch node count:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await sessionsAPI.uploadPcap(file);
      await fetchSessions();
      setSelectedSession(response.data.session_id);
    } catch (error) {
      console.error('Failed to upload PCAP:', error);
      alert('Failed to upload PCAP file. Simulated analysis will be used.');
    } finally {
      setUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedSession) {
      alert('Please select a traffic session first.');
      return;
    }

    if (nodeCount === 0) {
      alert('No TOR nodes available. Please generate nodes first from the TOR Nodes page.');
      return;
    }

    try {
      setLoading(true);
      const response = await analysisAPI.runAnalysis({
        session_id: selectedSession,
        time_window: timeWindow,
        analyst_notes: analystNotes
      });
      setResult(response.data);
    } catch (error) {
      console.error('Failed to run analysis:', error);
      alert('Analysis failed. Please ensure you have TOR nodes and traffic data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text">Correlation Analysis</h1>
          <p className="text-cyber-muted mt-1">Run traffic correlation analysis on captured sessions</p>
        </div>
        <Button onClick={fetchSessions} variant="secondary" icon={RefreshCw}>
          Refresh Sessions
        </Button>
      </div>

      <div className="cyber-card rounded-xl p-4 mb-6 border-l-4 border-cyber-warning">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-cyber-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-cyber-warning font-bold">IMPORTANT NOTICE</p>
            <p className="text-sm text-cyber-text">
              This analysis provides probabilistic correlation only. Results should be treated as 
              investigative leads requiring verification. This does NOT constitute de-anonymization.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyber-text mb-4">1. Data Source</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-cyber-muted mb-2">
              Upload PCAP File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pcap,.pcapng,.cap"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              icon={Upload}
              variant="secondary"
              className="w-full justify-center"
            >
              {uploading ? 'Uploading...' : 'Upload PCAP'}
            </Button>
          </div>

          <div className="border-t border-cyber-accent/30 my-4" />

          <div>
            <label className="block text-sm font-medium text-cyber-muted mb-2">
              Select Traffic Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-cyber-secondary border border-cyber-accent rounded-lg px-4 py-2 text-cyber-text focus:outline-none focus:border-cyber-highlight"
            >
              <option value="">Select a session...</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.name} ({s.packet_count} packets)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyber-text mb-4">2. Parameters</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-cyber-muted mb-2">
              Time Window (seconds)
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={timeWindow}
              onChange={(e) => setTimeWindow(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-cyber-muted mt-1">
              <span>1s (Strict)</span>
              <span className="text-cyber-highlight font-bold">{timeWindow}s</span>
              <span>30s (Loose)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-muted mb-2">
              Analyst Notes
            </label>
            <textarea
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Add investigation notes..."
              rows={3}
              className="w-full bg-cyber-secondary border border-cyber-accent rounded-lg px-4 py-2 text-cyber-text focus:outline-none focus:border-cyber-highlight resize-none"
            />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyber-text mb-4">3. Execute Analysis</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-cyber-muted">Selected Session:</span>
              <span className={selectedSession ? 'text-cyber-success' : 'text-cyber-danger'}>
                {selectedSession ? 'Ready' : 'None'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cyber-muted">TOR Nodes Available:</span>
              <span className={nodeCount > 0 ? 'text-cyber-success' : 'text-cyber-danger'}>
                {nodeCount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cyber-muted">Time Window:</span>
              <span className="text-cyber-highlight">{timeWindow}s</span>
            </div>
          </div>

          <Button 
            onClick={handleRunAnalysis}
            loading={loading}
            icon={Play}
            variant="success"
            className="w-full justify-center"
            disabled={!selectedSession || nodeCount === 0}
          >
            {loading ? 'Analyzing...' : 'Run Correlation Analysis'}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="cyber-card rounded-xl p-6 flex flex-col items-center">
              <ConfidenceGauge value={result.overall_confidence} size={180} />
              <p className="text-sm text-cyber-muted mt-4">Overall Confidence Score</p>
            </div>

            <div className="cyber-card rounded-xl p-6 col-span-2">
              <h3 className="text-lg font-bold text-cyber-text mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                <ScoreBar label="Timing Correlation" value={result.timing_score} />
                <ScoreBar label="Volume Correlation" value={result.volume_score} />
                <ScoreBar label="Pattern Similarity" value={result.pattern_score} />
              </div>
              
              <div className="mt-6 pt-4 border-t border-cyber-accent/30">
                <p className="text-sm text-cyber-muted mb-2">Probable Origin Association:</p>
                <p className="text-lg font-mono text-cyber-warning">{result.probable_origin}</p>
              </div>
            </div>
          </div>

          <NetworkGraph circuit={result.circuit} />

          <div className="cyber-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyber-text mb-4">Analysis Justification</h3>
            <pre className="text-sm text-cyber-text whitespace-pre-wrap font-mono bg-cyber-darker rounded-lg p-4 max-h-64 overflow-y-auto">
              {result.justification}
            </pre>
          </div>

          <div className="cyber-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cyber-text">Evidence Integrity</h3>
              <span className="text-xs text-cyber-muted">Case ID: {result.case_id}</span>
            </div>
            <div className="bg-cyber-darker rounded-lg p-4">
              <p className="text-xs text-cyber-muted mb-1">SHA-256 Hash:</p>
              <p className="text-sm font-mono text-cyber-highlight break-all">{result.evidence_hash}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }) {
  const getColor = (val) => {
    if (val >= 70) return 'bg-cyber-success';
    if (val >= 40) return 'bg-cyber-warning';
    return 'bg-cyber-danger';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-cyber-text">{label}</span>
        <span className="text-cyber-highlight font-bold">{value.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-cyber-darker rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(value)} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default Analysis;
