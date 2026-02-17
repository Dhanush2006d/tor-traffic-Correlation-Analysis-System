import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

function AlertsPanel() {
    const alerts = [
        { id: 1, title: 'High Jitter Correlation Detected', message: 'Traffic jitter pattern matches known Tor activity with 95% confidence.', type: 'danger', time: '10:45 AM' },
        { id: 2, title: 'Unusual Volume Spike', message: 'Outbound traffic volume exceeded baseline by 300%.', type: 'warning', time: '10:30 AM' },
        { id: 3, title: 'Analysis Complete', message: 'Routine pcap analysis finished successfully.', type: 'success', time: '10:15 AM' },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'danger': return AlertTriangle;
            case 'warning': return Info;
            case 'success': return CheckCircle;
            default: return Info;
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyber-highlight">System Alerts</h3>
            <div className="space-y-4">
                {alerts.map((alert) => {
                    const Icon = getIcon(alert.type);
                    const colorClass = alert.type === 'danger' ? 'text-cyber-danger border-cyber-danger/50 bg-cyber-danger/10' :
                        alert.type === 'warning' ? 'text-cyber-warning border-cyber-warning/50 bg-cyber-warning/10' :
                            'text-cyber-success border-cyber-success/50 bg-cyber-success/10';

                    return (
                        <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-lg border ${colorClass}`}>
                            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">{alert.title}</h4>
                                <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                                <span className="text-xs opacity-70 mt-2 block">{alert.time}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AlertsPanel;
