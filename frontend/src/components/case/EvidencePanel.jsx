import React, { useState, useRef } from 'react';
import DataTable from '../DataTable';
import Button from '../Button';
import { Upload, FileText, Search, X } from 'lucide-react';

import axios from 'axios';
import { Loader2, Globe, Shield } from 'lucide-react';

function EvidencePanel({ sessions = [], onUpload, onAnalyze, loading }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    // OSINT State
    const [osintInput, setOsintInput] = useState("");
    const [osintResult, setOsintResult] = useState(null);
    const [osintLoading, setOsintLoading] = useState(false);

    // Fallback to mock if no sessions provided (for demo/initial load)
    const displayData = sessions.length > 0 ? sessions : [];

    const handleAnalyze = (row) => {
        if (onAnalyze) {
            onAnalyze(row.session_id || row.id);
        }
    };

    const handleOsintLookup = async () => {
        if (!osintInput.trim()) return;
        setOsintLoading(true);
        setOsintResult(null);
        try {
            const res = await axios.post('http://localhost:5000/api/osint/analyze/indicator', { indicator: osintInput });
            setOsintResult(res.data);
        } catch (e) {
            console.error(e);
            setOsintResult({ error: "Lookup failed" });
        } finally {
            setOsintLoading(false);
        }
    };

    const columns = [
        { header: 'Session Name', accessor: 'name' }, // Metadata from backend
        {
            header: 'Packets',
            accessor: 'packet_count',
            render: (val) => val || '0'
        },
        { header: 'Created', accessor: 'start_time', render: (val) => val ? new Date(val).toLocaleString() : 'N/A' },
        {
            header: 'Actions',
            accessor: 'session_id', // or id
            render: (id, row) => (
                <Button
                    size="sm"
                    variant="secondary"
                    icon={Search}
                    onClick={() => handleAnalyze(row)}
                    loading={loading}
                >
                    Analyze
                </Button>
            )
        }
    ];

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await processUpload(e.target.files[0]);
        }
    };

    const processUpload = async (file) => {
        if (onUpload) {
            try {
                await onUpload(file);
            } catch (error) {
                alert("Upload failed");
            }
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Evidence List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-cyber-highlight">Evidence Files</h3>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pcap,.pcapng,.cap"
                            />
                            <Button icon={Upload} onClick={() => fileInputRef.current.click()} loading={loading}>Upload Evidence</Button>
                        </div>
                    </div>

                    <div className="cyber-card rounded-xl p-6 border border-cyber-accent/20">
                        <div
                            className={`flex items-center gap-4 mb-4 p-8 rounded-lg border-2 border-dashed transition-colors relative ${dragActive ? 'border-cyber-accent bg-cyber-accent/10' : 'border-cyber-muted/30 bg-cyber-primary/30'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <FileText className={`w-10 h-10 ${dragActive ? 'text-cyber-accent' : 'text-cyber-muted'}`} />
                            <div>
                                <p className="text-cyber-text font-medium text-lg">
                                    {dragActive ? "Drop file to upload" : "Drag and drop files here"}
                                </p>
                                <p className="text-cyber-muted text-sm">Supported: .pcap, .pcapng, .cap</p>
                            </div>
                            <div className="absolute inset-0 z-10" />
                        </div>
                        <DataTable columns={columns} data={displayData} emptyMessage="No evidence sessions found. Upload a PCAP file." />
                    </div>
                </div>

                {/* Quick OSINT Panel */}
                <div className="cyber-card rounded-xl p-6 border border-cyber-accent/20 h-fit space-y-4">
                    <h3 className="text-lg font-bold text-cyber-highlight flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Quick OSINT Lookup
                    </h3>
                    <div className="flex gap-2">
                        <input
                            className="bg-cyber-dark/50 border border-cyber-accent/30 rounded px-3 py-2 text-sm w-full text-cyber-text focus:outline-none focus:border-cyber-accent"
                            placeholder="IP or Domain..."
                            value={osintInput}
                            onChange={(e) => setOsintInput(e.target.value)}
                        />
                        <button
                            className="bg-cyber-accent/20 hover:bg-cyber-accent/40 text-cyber-accent rounded px-3 py-2 transition-colors disabled:opacity-50"
                            onClick={handleOsintLookup}
                            disabled={osintLoading}
                        >
                            {osintLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Mini Result Display */}
                    {osintResult && (
                        <div className="bg-cyber-dark/30 rounded p-3 text-sm space-y-2 border border-cyber-accent/10 animate-in fade-in zoom-in-95 duration-200">
                            {osintResult.error ? (
                                <p className="text-red-400">{osintResult.error}</p>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 font-semibold text-cyber-highlight">
                                        {osintResult.type === 'IP' ? <Shield className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                        {osintResult.indicator}
                                    </div>
                                    {osintResult.whois?.org && (
                                        <div className="flex justify-between">
                                            <span className="text-cyber-muted">Org:</span>
                                            <span className="text-right truncate max-w-[120px]">{osintResult.whois.org}</span>
                                        </div>
                                    )}
                                    {osintResult.whois?.country && (
                                        <div className="flex justify-between">
                                            <span className="text-cyber-muted">Country:</span>
                                            <span>{osintResult.whois.country}</span>
                                        </div>
                                    )}
                                    {osintResult.reverse_dns && (
                                        <div className="flex justify-between">
                                            <span className="text-cyber-muted">PTR:</span>
                                            <span className="text-right truncate max-w-[120px]">{osintResult.reverse_dns}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EvidencePanel;
