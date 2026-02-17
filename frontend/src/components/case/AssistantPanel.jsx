import React, { useState, useEffect } from 'react';
import { Bot, Lightbulb, ArrowRight, Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import Button from '../Button';
import { analysisAPI } from '../../services/api';
import { useParams } from 'react-router-dom';

function AssistantPanel({ sessionId, onNavigate }) {
    const { caseId } = useParams();

    // State now holds the full hybrid response object { insights: [], narrative: "", source: "" }
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!sessionId && caseId !== 'demo-case') {
                setData(null);
                return;
            }
            const targetSessionId = sessionId || (caseId === 'demo-case' ? 'DEMO-SESSION-001' : null);

            if (!targetSessionId) return;

            const response = await analysisAPI.getInsights(targetSessionId);
            setData(response.data || {});
        } catch (err) {
            if (caseId === 'demo-case') {
                setData({
                    narrative: "**Analysis Summary**\n\nHigh confidence correlation detected...",
                    source: "Simulation",
                    insights: [
                        { title: "High Volume Data Burst", type: "danger", confidence: 0.89, description: "Abnormal data spike..." }
                    ]
                });
            } else {
                setError("No active traffic session found to analyze. Please upload and select a session in the Evidence tab.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [caseId, sessionId]);

    const insightsList = data?.insights || [];
    const narrative = data?.narrative;
    const source = data?.source;

    const handleExport = () => {
        if (!narrative) return;
        const blob = new Blob([narrative], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic_Report_${sessionId || 'Demo'}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNavigateToEvidence = () => {
        if (onNavigate) onNavigate('evidence');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analysis Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="cyber-card rounded-xl p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-cyber-accent/20 pb-4">
                        <div className="p-2 bg-cyber-accent/20 rounded-lg">
                            <Bot className="w-6 h-6 text-cyber-accent" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-cyber-highlight">AI Investigation Assistant</h3>
                            <p className="text-xs text-cyber-muted">
                                {source ? source : 'Powered by Statistical Anomaly Detection Engine'}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">

                        {/* AI Narrative Section */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyber-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-5 h-5 text-cyber-accent" />
                            </div>
                            <div className="bg-cyber-primary/50 p-6 rounded-r-xl rounded-bl-xl border border-cyber-accent/10 max-w-[90%]">
                                <h4 className="text-cyber-highlight font-bold mb-2 flex items-center gap-2">
                                    Case Analysis Report
                                </h4>

                                {loading ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-4 w-3/4 bg-cyber-accent/10 rounded" />
                                        <div className="h-4 w-full bg-cyber-accent/10 rounded" />
                                        <div className="h-4 w-5/6 bg-cyber-accent/10 rounded" />
                                    </div>
                                ) : narrative ? (
                                    <div className="prose prose-invert prose-sm max-w-none text-cyber-text leading-relaxed whitespace-pre-wrap">
                                        {narrative}
                                    </div>
                                ) : (
                                    <p className="text-sm text-cyber-text italic">
                                        {error ? "Analysis pending..." : "Select a session to generate AI insights."}
                                    </p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-cyber-danger/20 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-cyber-danger" />
                                </div>
                                <div className="bg-cyber-danger/10 p-4 rounded-r-xl rounded-bl-xl border border-cyber-danger/20">
                                    <p className="text-sm text-cyber-danger">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Statistical Alerts (Visual Cards) */}
                        {insightsList.length > 0 && (
                            <div className="border-t border-cyber-accent/20 pt-4 mt-4">
                                <h4 className="text-sm font-bold text-cyber-muted uppercase mb-4 ml-12">Detailed Anomalies</h4>
                                <div className="space-y-4">
                                    {insightsList.map((insight, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-cyber-accent/20 flex items-center justify-center flex-shrink-0">
                                                <Activity className="w-5 h-5 text-cyber-accent" />
                                            </div>
                                            <div className={`p-4 rounded-r-xl rounded-bl-xl border max-w-[80%] ${insight.type === 'danger' ? 'bg-cyber-danger/10 border-cyber-danger/30' :
                                                'bg-cyber-warning/10 border-cyber-warning/30'
                                                }`}>
                                                <h4 className={`text-sm font-bold mb-1 flex items-center gap-2 ${insight.type === 'danger' ? 'text-cyber-danger' : 'text-cyber-warning'
                                                    }`}>
                                                    {insight.type === 'danger' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                                    {insight.title}
                                                </h4>
                                                <p className="text-sm text-cyber-text mb-2">{insight.description}</p>
                                                <div className="bg-black/20 rounded p-2 text-xs text-cyber-muted font-mono inline-block">
                                                    Confidence: {(insight.confidence * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="mt-4 pt-4 border-t border-cyber-accent/20 flex justify-center">
                        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchInsights} loading={loading}>
                            Re-run Hybrid Analysis
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-cyber-highlight">Recommended Actions</h3>
                <div className="cyber-card rounded-xl p-4 border border-cyber-accent/20 space-y-3">
                    {/* Dynamic Actions */}
                    <Suggestion
                        icon={CheckCircle}
                        title="Review Traffic Evidence"
                        desc="Inspect raw packet details and timestamps in the Evidence tab."
                        onClick={handleNavigateToEvidence}
                    />
                    <Suggestion
                        icon={ArrowRight}
                        title="Export AI Report"
                        desc="Download the full forensic narrative as a Markdown file."
                        onClick={handleExport}
                        disabled={!narrative}
                    />
                    <Suggestion
                        icon={Lightbulb}
                        title="Verify Source IP"
                        desc="Check if the source IP matches known internal hosts."
                        onClick={() => alert("Action: Suggestion to verify Source IP logged.")}
                    />
                </div>
            </div>
        </div>
    );
}

function Suggestion({ icon: Icon, title, desc, onClick, disabled }) {
    return (
        <button
            className={`w-full text-left p-3 rounded-lg border transition-all group ${disabled
                    ? "bg-cyber-primary/10 border-transparent opacity-50 cursor-not-allowed"
                    : "bg-cyber-primary/30 hover:bg-cyber-primary/50 border-cyber-accent/10 hover:border-cyber-accent/30"
                }`}
            onClick={onClick}
            disabled={disabled}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 transition-colors ${disabled ? "text-cyber-muted" : "text-cyber-muted group-hover:text-cyber-accent"
                    }`} />
                <div>
                    <h4 className={`text-sm font-bold transition-colors ${disabled ? "text-cyber-muted" : "text-cyber-text group-hover:text-cyber-highlight"
                        }`}>
                        {title}
                    </h4>
                    <p className="text-xs text-cyber-muted leading-relaxed">{desc}</p>
                </div>
            </div>
        </button>
    );
}

export default AssistantPanel;
