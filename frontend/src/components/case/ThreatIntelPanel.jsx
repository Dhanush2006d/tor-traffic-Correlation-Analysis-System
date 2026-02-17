import React from 'react';
import DataTable from '../DataTable';
import { Lock } from 'lucide-react';

function ThreatIntelPanel() {
    const threatData = [
        { indicator: '192.168.1.105', type: 'IP Address', source: 'Internal Logs', seen: '2 mins ago', severity: 'High' },
        { indicator: 'tor-exit-node-443.onion', type: 'Domain', source: 'Tor Consensus', seen: '5 mins ago', severity: 'Medium' },
        { indicator: 'User-Agent: Mozilla/5.0 (Tor)', type: 'Metadata', source: 'Packet Capture', seen: '10 mins ago', severity: 'Low' },
    ];

    // Robust deterministic hash generator (simulating SHA-256 visual style)
    const generateHash = (str) => {
        let hash = 0x811c9dc5; // FNV-1a offset basis
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }

        // Seed a pseudo-random generator with the hash
        let seed = hash;
        const mulberry32 = () => {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0);
        };

        // Generate 64 characters of hex (32 bytes)
        let hex = '';
        for (let i = 0; i < 8; i++) {
            hex += mulberry32().toString(16).padStart(8, '0');
        }
        return hex;
    };

    const maskIP = (ip) => {
        // Check if valid IPV4 format roughly
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
            const parts = ip.split('.');
            return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        return ip;
    };

    const columns = [
        {
            header: 'Indicator (Masked)',
            accessor: 'indicator',
            render: (val, row) => {
                const isIP = row.type === 'IP Address';
                return isIP ? (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-cyber-muted">{maskIP(val)}</span>
                        <Lock className="w-3 h-3 text-cyber-accent" title="Masked for Privacy" />
                    </div>
                ) : val;
            }
        },
        {
            header: 'Anonymized Hash',
            accessor: 'indicator',
            render: (val) => <span className="font-mono text-xs text-cyber-muted">{generateHash(val)}</span>
        },
        { header: 'Type', accessor: 'type' },
        { header: 'Source', accessor: 'source' },
        { header: 'First Seen', accessor: 'seen' },
        {
            header: 'Severity',
            accessor: 'severity',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'High' ? 'bg-cyber-danger/20 text-cyber-danger' :
                    val === 'Medium' ? 'bg-cyber-warning/20 text-cyber-warning' :
                        'bg-cyber-success/20 text-cyber-success'
                    }`}>
                    {val}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyber-highlight">Threat Intelligence</h3>
            <div className="cyber-card rounded-xl p-6 border border-cyber-accent/20">
                <DataTable columns={columns} data={threatData} />
            </div>
        </div>
    );
}

export default ThreatIntelPanel;
