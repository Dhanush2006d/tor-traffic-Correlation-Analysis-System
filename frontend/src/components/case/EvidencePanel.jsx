import React, { useState, useRef } from 'react';
import DataTable from '../DataTable';
import Button from '../Button';
import { Upload, FileText, Search, X } from 'lucide-react';

function EvidencePanel({ sessions = [], onUpload, onAnalyze, loading }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    // Fallback to mock if no sessions provided (for demo/initial load)
    const displayData = sessions.length > 0 ? sessions : [];

    const handleAnalyze = (row) => {
        if (onAnalyze) {
            onAnalyze(row.session_id || row.id);
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
    );
}

export default EvidencePanel;
