import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Network,
    ShieldAlert,
    Bell,
    Bot
} from 'lucide-react';

const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'correlation', label: 'Correlation', icon: Network },
    { id: 'threat-intel', label: 'Threat Intel', icon: ShieldAlert },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
];

function CaseTabs({ activeTab, onTabChange }) {
    return (
        <div className="border-b border-cyber-accent/20 mb-6 overflow-x-auto">
            <div className="flex space-x-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${isActive
                                    ? 'border-cyber-accent text-cyber-accent'
                                    : 'border-transparent text-cyber-muted hover:text-cyber-text hover:border-cyber-muted/50'}
              `}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default CaseTabs;
