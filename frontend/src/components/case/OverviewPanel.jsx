import React from 'react';
import StatCard from '../StatCard';
import { ShieldCheck, Activity, BrainCircuit } from 'lucide-react';

function OverviewPanel({ caseId }) {
    // Mock data - in a real app this would fetch based on caseId
    const caseData = {
        riskScore: 85,
        matchConfidence: 'High',
        activeLeads: 12,
        status: 'Active Investigation'
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Risk Score"
                    value={caseData.riskScore}
                    icon={ShieldCheck}
                    color="danger"
                />
                <StatCard
                    title="Match Confidence"
                    value={caseData.matchConfidence}
                    icon={Activity}
                    color="warning"
                />
                <StatCard
                    title="Active Leads"
                    value={caseData.activeLeads}
                    icon={BrainCircuit}
                    color="highlight"
                />
                <div className="cyber-card rounded-xl p-6 bg-cyber-primary/50 border border-cyber-accent/20 flex flex-col justify-center">
                    <p className="text-cyber-muted text-sm font-medium mb-1">Case Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-xl font-bold text-cyber-text">{caseData.status}</p>
                    </div>
                </div>
            </div>

            <div className="cyber-card rounded-xl p-6 border border-cyber-accent/20">
                <h3 className="text-lg font-bold text-cyber-highlight mb-4">Case Summary</h3>
                <p className="text-cyber-text text-sm leading-relaxed">
                    Investigation {caseId}: Detected high-confidence correlation pattern (Score: {caseData.riskScore})
                    between Target A (Exit Node) and Suspect B (ISP Log). Temporal analysis suggests
                    direct traffic relay with 95% jitter match.
                </p>
            </div>
        </div>
    );
}

export default OverviewPanel;
