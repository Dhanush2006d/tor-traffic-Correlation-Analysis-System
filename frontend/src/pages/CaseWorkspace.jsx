import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CaseTabs from '../components/case/CaseTabs';
import OverviewPanel from '../components/case/OverviewPanel';
import EvidencePanel from '../components/case/EvidencePanel';
import CorrelationPanel from '../components/case/CorrelationPanel';
import ThreatIntelPanel from '../components/case/ThreatIntelPanel';
import AlertsPanel from '../components/case/AlertsPanel';
import AssistantPanel from '../components/case/AssistantPanel';
import { sessionsAPI, analysisAPI, nodesAPI } from '../services/api';

function CaseWorkspace() {
    const { caseId } = useParams();
    const [activeTab, setActiveTab] = useState('overview');

    // Shared State
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [nodeCount, setNodeCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [sessionsRes, nodesRes] = await Promise.all([
                sessionsAPI.getSessions(),
                nodesAPI.getStats()
            ]);
            setSessions(sessionsRes.data);
            setNodeCount(nodesRes.data.total || 0);
        } catch (error) {
            console.error("Failed to load case data:", error);
        }
    };

    const handleUpload = async (file) => {
        try {
            setLoading(true);
            const response = await sessionsAPI.uploadPcap(file);
            await fetchInitialData(); // Refresh list
            return response.data;
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (sessionId) => {
        try {
            setLoading(true);
            setSelectedSession(sessionId); // Track active session
            const response = await analysisAPI.runAnalysis({
                session_id: sessionId,
                time_window: 5.0, // Default for now
                analyst_notes: "Auto-generated from Case Workspace"
            });
            setAnalysisResult(response.data);
            setActiveTab('correlation'); // Auto-switch to results
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analysis failed. Please check backend logs.");
        } finally {
            setLoading(false);
        }
    };

    const renderActivePanel = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewPanel caseId={caseId} />;
            case 'evidence':
                return (
                    <EvidencePanel
                        sessions={sessions}
                        onUpload={handleUpload}
                        onAnalyze={handleAnalyze}
                        loading={loading}
                    />
                );
            case 'correlation':
                return <CorrelationPanel result={analysisResult} />;
            case 'threat-intel':
                return <ThreatIntelPanel />;
            case 'alerts':
                return <AlertsPanel />;
            case 'assistant':
                return <AssistantPanel sessionId={selectedSession} onNavigate={setActiveTab} />;
            default:
                return <OverviewPanel caseId={caseId} />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-cyber-muted text-sm font-mono uppercase tracking-wider">Investigation Case</span>
                    <h1 className="text-3xl font-bold text-cyber-active mt-1">{caseId}</h1>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded bg-cyber-primary/50 text-cyber-muted text-sm border border-cyber-accent/20">
                        Tor Traffic Correlation
                    </span>
                    <span className={`px-3 py-1 rounded text-sm border ${nodeCount > 0 ? 'bg-cyber-success/20 border-cyber-success/50 text-cyber-success' : 'bg-cyber-danger/20 border-cyber-danger/50 text-cyber-danger'}`}>
                        {nodeCount} Nodes Active
                    </span>
                </div>
            </div>

            <CaseTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-6">
                {renderActivePanel()}
            </div>
        </div>
    );
}

export default CaseWorkspace;
