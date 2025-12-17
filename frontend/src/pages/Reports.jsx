import React, { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Trash2, Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import { reportsAPI, analysisAPI } from '../services/api';

function Reports() {
  const [reports, setReports] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');

  useEffect(() => {
    fetchReports();
    fetchAnalyses();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports();
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await analysisAPI.getAnalyses();
      setAnalyses(response.data.filter(a => a.status === 'completed'));
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedCaseId) {
      alert('Please select a completed analysis first.');
      return;
    }

    try {
      setGenerating(true);
      await reportsAPI.generateReport(selectedCaseId);
      await fetchReports();
      setSelectedCaseId('');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (reportId) => {
    const url = reportsAPI.downloadReport(reportId);
    window.open(url, '_blank');
  };

  const handleDelete = async (reportId) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsAPI.deleteReport(reportId);
        await fetchReports();
      } catch (error) {
        console.error('Failed to delete report:', error);
      }
    }
  };

  const columns = [
    { 
      header: 'Case ID', 
      accessor: 'case_id',
      render: (v) => <span className="font-mono text-cyber-highlight">{v}</span>
    },
    { 
      header: 'Confidence', 
      accessor: 'overall_confidence',
      render: (v) => {
        const color = v >= 70 ? 'text-cyber-success' : v >= 40 ? 'text-cyber-warning' : 'text-cyber-danger';
        return <span className={`font-bold ${color}`}>{v?.toFixed(1) || 0}%</span>;
      }
    },
    { 
      header: 'Status', 
      accessor: 'analysis_status',
      render: (v) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          v === 'completed' ? 'bg-cyber-success/20 text-cyber-success' : 'bg-cyber-warning/20 text-cyber-warning'
        }`}>
          {v?.toUpperCase() || 'UNKNOWN'}
        </span>
      )
    },
    { 
      header: 'Created', 
      accessor: 'created_at',
      render: (v) => new Date(v).toLocaleString()
    },
    { 
      header: 'Actions', 
      accessor: 'id',
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload(id)}
            className="p-2 rounded-lg bg-cyber-accent hover:bg-cyber-accent/80 text-cyber-highlight transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(id)}
            className="p-2 rounded-lg bg-cyber-danger/20 hover:bg-cyber-danger/30 text-cyber-danger transition-colors"
            title="Delete Report"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text">Forensic Reports</h1>
          <p className="text-cyber-muted mt-1">Generated PDF forensic analysis reports</p>
        </div>
        <Button onClick={fetchReports} variant="secondary" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      <div className="cyber-card rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-cyber-text mb-4">Generate New Report</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-cyber-muted mb-2">
              Select Completed Analysis
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full bg-cyber-secondary border border-cyber-accent rounded-lg px-4 py-2 text-cyber-text focus:outline-none focus:border-cyber-highlight"
            >
              <option value="">Select an analysis...</option>
              {analyses.map((a) => (
                <option key={a.case_id} value={a.case_id}>
                  {a.case_id} - Confidence: {a.overall_confidence?.toFixed(1)}%
                </option>
              ))}
            </select>
          </div>
          <Button 
            onClick={handleGenerateReport}
            loading={generating}
            icon={Plus}
            disabled={!selectedCaseId}
          >
            Generate PDF Report
          </Button>
        </div>
        {analyses.length === 0 && (
          <p className="text-cyber-muted text-sm mt-4">
            No completed analyses available. Run an analysis first from the Analysis page.
          </p>
        )}
      </div>

      <div className="cyber-card rounded-xl p-4 mb-6 border-l-4 border-cyber-warning">
        <p className="text-sm text-cyber-text">
          <span className="font-bold text-cyber-warning">Report Contents:</span> Each PDF includes case details, 
          TOR circuit path visualization, confidence score breakdown with justification, timeline reconstruction, 
          SHA-256 evidence hash, and legal disclaimers stating probabilistic correlation only.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyber-highlight border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={reports} 
          emptyMessage="No reports generated yet. Generate a report from a completed analysis."
        />
      )}

      {reports.length > 0 && (
        <div className="mt-6 cyber-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyber-text mb-4">Report Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-cyber-muted text-sm">Total Reports</p>
              <p className="text-2xl font-bold text-cyber-highlight">{reports.length}</p>
            </div>
            <div>
              <p className="text-cyber-muted text-sm">High Confidence (70%+)</p>
              <p className="text-2xl font-bold text-cyber-success">
                {reports.filter(r => r.overall_confidence >= 70).length}
              </p>
            </div>
            <div>
              <p className="text-cyber-muted text-sm">Medium Confidence (40-70%)</p>
              <p className="text-2xl font-bold text-cyber-warning">
                {reports.filter(r => r.overall_confidence >= 40 && r.overall_confidence < 70).length}
              </p>
            </div>
            <div>
              <p className="text-cyber-muted text-sm">Low Confidence (&lt;40%)</p>
              <p className="text-2xl font-bold text-cyber-danger">
                {reports.filter(r => r.overall_confidence < 40).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
