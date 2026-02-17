import React from 'react';
import ConfidenceGauge from '../ConfidenceGauge';
import Button from '../Button';
import { Network, HelpCircle, AlertCircle } from 'lucide-react';



function CorrelationPanel({ result }) {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full cyber-card rounded-xl border border-cyber-accent/20">
                <Network className="w-16 h-16 text-cyber-muted mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-cyber-text mb-2">No Analysis Results</h3>
                <p className="text-cyber-muted max-w-md">
                    Select a session from the <strong>Evidence</strong> tab and click "Analyze" to generate a correlation report.
                </p>
            </div>
        );
    }

    const correlationData = {
        score: result.overall_confidence,
        matchDetails: [
            { factor: 'Traffic Volume', score: result.volume_score, weight: 'High' },
            { factor: 'Packet Timing (Jitter)', score: result.timing_score, weight: 'Critical' },
            { factor: 'Pattern Similarity', score: result.pattern_score, weight: 'Medium' },
        ]
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <div className="cyber-card rounded-xl p-6 h-full flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-cyber-highlight mb-6">Aggregate Correlation Score</h3>
                    <ConfidenceGauge value={correlationData.score} size={250} />
                    <p className="mt-6 text-cyber-text text-sm max-w-xs">
                        Probability that the Exit Node traffic corresponds to the Suspect's ISP traffic based on multi-factor analysis.
                    </p>
                    {result.probable_origin && (
                        <div className="mt-4 p-3 bg-cyber-primary/50 rounded border border-cyber-accent/30 w-full">
                            <p className="text-xs text-cyber-muted uppercase">Probable Origin</p>
                            <p className="text-cyber-warning font-mono font-bold truncate" title={result.probable_origin}>
                                {result.probable_origin}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="cyber-card rounded-xl p-6 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-cyber-highlight flex items-center gap-2">
                            <Network className="w-5 h-5" />
                            Correlation Factors
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-xs text-cyber-muted py-1">Case ID: {result.case_id}</span>
                            <Button variant="secondary" size="sm" icon={HelpCircle}>Explain Analysis</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {correlationData.matchDetails.map((item, idx) => (
                            <div key={idx} className="bg-cyber-primary/30 p-4 rounded-lg border border-cyber-accent/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-cyber-highlight font-medium">{item.factor}</span>
                                    <span className={`text-sm font-bold ${item.score > 80 ? 'text-cyber-success' : item.score > 50 ? 'text-cyber-warning' : 'text-cyber-danger'
                                        }`}>{item.score.toFixed(1)}% Match</span>
                                </div>
                                <div className="w-full bg-cyber-primary rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${item.score > 80 ? 'bg-cyber-success' : item.score > 50 ? 'bg-cyber-warning' : 'bg-cyber-danger'
                                            }`}
                                        style={{ width: `${item.score}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-cyber-muted mt-2 text-right">Weight: {item.weight}</p>
                            </div>
                        ))}

                        {result.justification && (
                            <div className="mt-6 pt-4 border-t border-cyber-accent/20">
                                <h4 className="text-sm font-bold text-cyber-text mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-cyber-accent" />
                                    AI Analysis Justification
                                </h4>
                                <p className="text-sm text-cyber-muted leading-relaxed">
                                    {result.justification}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CorrelationPanel;
