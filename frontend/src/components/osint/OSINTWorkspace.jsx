import React, { useState } from 'react';
import Button from '../Button';
import { Search, Globe, Shield, FileText, ExternalLink, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/osint';

const OSINTWorkspace = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("indicator");
    const [indicatorInput, setIndicatorInput] = useState("");
    const [textInput, setTextInput] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyzeIndicator = async () => {
        if (!indicatorInput.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post(`${API_BASE}/analyze/indicator`, { indicator: indicatorInput });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Analysis failed");
        } finally {
            setLoading(false);
        }
    };

    const handletextExtraction = async () => {
        if (!textInput.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post(`${API_BASE}/analyze/text`, { text: textInput });
            setResult({ type: 'Extraction', ...response.data });
        } catch (err) {
            setError(err.response?.data?.detail || "Extraction failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col space-y-1.5">
                <h1 className="text-3xl font-bold text-cyber-highlight tracking-tight">OSINT Intelligence Hub</h1>
                <p className="text-cyber-text">Cross-reference indicators and extract IOCs from raw intelligence.</p>
            </div>

            {/* Custom Tabs */}
            <div className="w-full">
                <div className="grid w-full grid-cols-2 mb-6 bg-cyber-dark/30 p-1 rounded-lg border border-cyber-accent/20">
                    <button
                        onClick={() => setActiveTab("indicator")}
                        className={`py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'indicator' ? 'bg-cyber-accent text-cyber-highlight shadow-sm' : 'text-cyber-text hover:text-cyber-highlight'}`}
                    >
                        Direct Indicator Lookup
                    </button>
                    <button
                        onClick={() => setActiveTab("text")}
                        className={`py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'text' ? 'bg-cyber-accent text-cyber-highlight shadow-sm' : 'text-cyber-text hover:text-cyber-highlight'}`}
                    >
                        Bulk Text Extraction
                    </button>
                </div>

                {/* INDICATOR TAB */}
                {activeTab === 'indicator' && (
                    <div className="cyber-card rounded-xl border border-cyber-accent/20 bg-cyber-dark/50 shadow-sm p-6 space-y-4">
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-semibold text-cyber-highlight">Analyze IP, Domain, or URL</h3>
                            <p className="text-sm text-cyber-text/80">
                                Performs active DNS resolution, WHOIS lookup, and Reputation check.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    placeholder="Enter IP (e.g. 1.2.3.4), Domain, or URL..."
                                    value={indicatorInput}
                                    onChange={(e) => setIndicatorInput(e.target.value)}
                                    className="flex-1 py-2 px-3 rounded-md border border-cyber-accent/30 bg-cyber-dark text-cyber-text focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent"
                                />
                                <Button onClick={handleAnalyzeIndicator} loading={loading} variant="primary">
                                    <Search className="mr-2 h-4 w-4" /> Analyze
                                </Button>
                            </div>
                            <div className="flex gap-4 text-xs text-cyber-text/60">
                                <span className="flex items-center"><Shield className="w-3 h-3 mr-1" /> Passive DNS</span>
                                <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> WHOIS Data</span>
                                <span className="flex items-center"><ExternalLink className="w-3 h-3 mr-1" /> Web Scraper (Tor Enabled)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TEXT TAB */}
                {activeTab === 'text' && (
                    <div className="cyber-card rounded-xl border border-cyber-accent/20 bg-cyber-dark/50 shadow-sm p-6 space-y-4">
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-semibold text-cyber-highlight">Bulk IOC Extraction</h3>
                            <p className="text-sm text-cyber-text/80">
                                Paste logs, emails, or chat transcripts to automatically extract IPs, Domains, and Onion links.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                placeholder="Paste raw text here..."
                                className="min-h-[150px] w-full py-2 px-3 rounded-md border border-cyber-accent/30 bg-cyber-dark text-cyber-text focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent resize-y"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                            <Button onClick={handletextExtraction} loading={loading} className="w-full">
                                <FileText className="mr-2 h-4 w-4" /> Extract Indicators
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="p-4 rounded-md border border-red-500/50 bg-red-900/10 text-red-500">
                    <h5 className="font-medium mb-1">Error</h5>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* RESULTS DISPLAY */}
            {result && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* ERROR HANDLING IN RESULT */}
                    {result.error && (
                        <div className="p-4 rounded-md border border-red-500/50 bg-red-900/10 text-red-500">
                            <h5 className="font-medium mb-1">Analysis Error</h5>
                            <p className="text-sm">{result.error}</p>
                        </div>
                    )}

                    {/* URL / ONION RESULT */}
                    {(result.type === 'URL' || result.type === 'Onion URL') && !result.error && (
                        <div className="space-y-6">
                            <div className="cyber-card rounded-xl border-l-4 border-l-purple-600 bg-cyber-dark/50 shadow-sm p-6">
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="h-6 w-6 text-purple-600" />
                                        <h3 className="text-xl font-bold break-all text-cyber-highlight">{result.indicator}</h3>
                                    </div>
                                    <p className="text-sm text-cyber-text">
                                        {result.type} Analysis &bull; Status: <span className={result.status === 200 ? "text-green-500 font-bold" : "text-orange-500 font-bold"}>{result.status || 'N/A'}</span>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 text-cyber-highlight">HTTP Headers</h3>
                                    <div className="bg-slate-900/50 p-3 rounded-md text-xs font-mono h-32 overflow-y-auto mb-4 text-cyber-text border border-cyber-accent/20">
                                        {result.headers ? Object.entries(result.headers).map(([k, v]) => (
                                            <div key={k}><span className="font-bold text-cyber-accent">{k}:</span> {v}</div>
                                        )) : "No headers captured"}
                                    </div>

                                    {result.scraped_data && (
                                        <>
                                            <h3 className="font-semibold mb-2 text-cyber-highlight">Scraped Intelligence</h3>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="border border-cyber-accent/20 p-2 rounded bg-cyber-dark/30">
                                                    <div className="text-xs font-bold text-cyber-text/60 uppercase">IP Addresses</div>
                                                    <div className="text-xl font-bold text-blue-500">{result.scraped_data.ips?.length || 0}</div>
                                                </div>
                                                <div className="border border-cyber-accent/20 p-2 rounded bg-cyber-dark/30">
                                                    <div className="text-xs font-bold text-cyber-text/60 uppercase">Domains</div>
                                                    <div className="text-xl font-bold text-green-500">{result.scraped_data.domains?.length || 0}</div>
                                                </div>
                                                <div className="border border-cyber-accent/20 p-2 rounded bg-cyber-dark/30">
                                                    <div className="text-xs font-bold text-cyber-text/60 uppercase">Onion Links</div>
                                                    <div className="text-xl font-bold text-purple-500">{result.scraped_data.onions?.length || 0}</div>
                                                </div>
                                            </div>

                                            {/* List Scraped Items */}
                                            {result.scraped_data.onions?.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-semibold mb-1 text-cyber-highlight">Onion Services Found:</h4>
                                                    <ul className="text-sm text-purple-400 list-disc list-inside">
                                                        {result.scraped_data.onions.map((o, i) => <li key={i}>{o}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IP/DOMAIN RESULT */}
                    {(result.type === 'IP' || result.type === 'Domain') && !result.error && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 cyber-card rounded-xl border-l-4 border-l-blue-600 bg-cyber-dark/50 shadow-sm p-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        {result.type === 'IP' ? <Shield className="h-6 w-6 text-blue-500" /> : <Globe className="h-6 w-6 text-green-500" />}
                                        <h3 className="text-xl font-bold text-cyber-highlight">{result.indicator}</h3>
                                    </div>
                                    <p className="text-sm text-cyber-text">{result.type} Intelligence Report</p>
                                </div>
                            </div>

                            {/* WHOIS DATA */}
                            <div className="cyber-card rounded-xl border border-cyber-accent/20 bg-cyber-dark/50 shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4 text-cyber-highlight">WHOIS Information</h3>
                                <div className="space-y-2 text-sm text-cyber-text">
                                    {result.whois && Object.entries(result.whois).map(([key, val]) => (
                                        <div key={key} className="flex justify-between border-b border-cyber-accent/10 pb-1 last:border-0">
                                            <span className="font-medium capitalize text-cyber-text/60">{key.replace('_', ' ')}:</span>
                                            <span className="text-cyber-highlight text-right truncate max-w-[200px]">{Array.isArray(val) ? val.join(', ') : val || 'N/A'}</span>
                                        </div>
                                    ))}
                                    {result.whois_error && <p className="text-red-500">WHOIS lookup failed: {result.whois_error}</p>}
                                </div>
                            </div>

                            {/* DNS / REVERSE DNS */}
                            <div className="cyber-card rounded-xl border border-cyber-accent/20 bg-cyber-dark/50 shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4 text-cyber-highlight">Network Resolution</h3>
                                <div className="space-y-2 text-sm text-cyber-text">
                                    {result.reverse_dns && (
                                        <div className="flex justify-between border-b border-cyber-accent/10 pb-1">
                                            <span className="font-medium text-cyber-text/60">Reverse DNS (PTR):</span>
                                            <span className="text-cyber-highlight">{result.reverse_dns}</span>
                                        </div>
                                    )}
                                    {result.dns_records && Object.entries(result.dns_records).map(([type, records]) => (
                                        <div key={type} className="block border-b border-cyber-accent/10 pb-2 last:border-0">
                                            <span className="font-medium text-blue-400 block mb-1">{type} Records:</span>
                                            <div className="pl-2 space-y-1">
                                                {records.map((r, i) => (
                                                    <div key={i} className="font-mono text-xs bg-slate-900/50 p-1 rounded border border-cyber-accent/20">{r}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EXTRACTION RESULT */}
                    {result.type === 'Extraction' && (
                        <div className="cyber-card rounded-xl border border-cyber-accent/20 bg-cyber-dark/50 shadow-sm p-6">
                            <div className="space-y-1.5 mb-4">
                                <h3 className="text-xl font-bold text-cyber-highlight">Extracted Artifacts</h3>
                                <p className="text-sm text-cyber-text">Found {result.count} unique indicators.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyber-highlight"><Globe className="h-4 w-4" /> Domains ({result.domains?.length || 0})</h3>
                                    <div className="border border-cyber-accent/20 rounded-md p-2 bg-slate-900/30 h-[200px] overflow-y-auto space-y-1">
                                        {result.domains?.map((d, i) => (
                                            <div key={i} className="text-sm font-mono text-blue-400 hover:text-blue-300 cursor-pointer" onClick={() => {
                                                setIndicatorInput(d);
                                                setActiveTab("indicator");
                                            }}>{d}</div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyber-highlight"><Shield className="h-4 w-4" /> IP Addresses ({result.ips?.length || 0})</h3>
                                    <div className="border border-cyber-accent/20 rounded-md p-2 bg-slate-900/30 h-[200px] overflow-y-auto space-y-1">
                                        {result.ips?.map((ip, i) => (
                                            <div key={i} className="text-sm font-mono text-blue-400 hover:text-blue-300 cursor-pointer" onClick={() => {
                                                setIndicatorInput(ip);
                                                setActiveTab("indicator");
                                            }}>{ip}</div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyber-highlight"><ExternalLink className="h-4 w-4" /> Onion Links ({result.onions?.length || 0})</h3>
                                    <div className="border border-cyber-accent/20 rounded-md p-2 bg-slate-900/30 h-[200px] overflow-y-auto space-y-1">
                                        {result.onions?.map((onion, i) => (
                                            <div key={i} className="text-sm font-mono text-purple-400 hover:text-purple-300 cursor-pointer" onClick={() => {
                                                setIndicatorInput(onion);
                                                setActiveTab("indicator");
                                            }}>{onion}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OSINTWorkspace;
