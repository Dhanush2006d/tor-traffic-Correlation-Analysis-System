import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import { sessionsAPI } from '../services/api';

function Timeline() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchPackets(selectedSession.session_id);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getSessions();
      setSessions(response.data);
      if (response.data.length > 0 && !selectedSession) {
        setSelectedSession(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackets = async (sessionId) => {
    try {
      const response = await sessionsAPI.getPackets(sessionId, 500);
      setPackets(response.data.packets || []);
      processChartData(response.data.packets || []);
    } catch (error) {
      console.error('Failed to fetch packets:', error);
    }
  };

  const processChartData = (packets) => {
    const timeGroups = {};
    packets.forEach(p => {
      const time = new Date(p.timestamp);
      const minute = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
      if (!timeGroups[minute]) {
        timeGroups[minute] = { time: minute, inbound: 0, outbound: 0, total: 0 };
      }
      if (p.direction === 'inbound') {
        timeGroups[minute].inbound += p.size;
      } else {
        timeGroups[minute].outbound += p.size;
      }
      timeGroups[minute].total += p.size;
    });
    
    const data = Object.values(timeGroups).sort((a, b) => a.time.localeCompare(b.time));
    setChartData(data);
  };

  const handleGenerateDemo = async () => {
    try {
      setGenerating(true);
      const response = await sessionsAPI.generateDemo(100);
      await fetchSessions();
      const newSession = sessions.find(s => s.session_id === response.data.session_id);
      if (newSession) setSelectedSession(newSession);
    } catch (error) {
      console.error('Failed to generate demo session:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionsAPI.deleteSession(sessionId);
        await fetchSessions();
        if (selectedSession?.session_id === sessionId) {
          setSelectedSession(sessions[0] || null);
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const packetColumns = [
    { header: 'Timestamp', accessor: 'timestamp', render: (v) => new Date(v).toLocaleTimeString() },
    { header: 'Source IP', accessor: 'src_ip', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { header: 'Destination IP', accessor: 'dst_ip', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { header: 'Protocol', accessor: 'protocol', render: (v) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        v === 'TLS' ? 'bg-cyber-success/20 text-cyber-success' :
        v === 'TCP' ? 'bg-cyber-highlight/20 text-cyber-highlight' :
        'bg-cyber-warning/20 text-cyber-warning'
      }`}>{v}</span>
    )},
    { header: 'Size', accessor: 'size', render: (v) => `${v} B` },
    { 
      header: 'Direction', 
      accessor: 'direction',
      render: (v) => (
        <span className={v === 'inbound' ? 'text-cyber-success' : 'text-cyber-warning'}>
          {v === 'inbound' ? '↓' : '↑'} {v}
        </span>
      )
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyber-text">Traffic Timeline</h1>
          <p className="text-cyber-muted mt-1">Traffic session analysis and packet data</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleGenerateDemo} loading={generating} icon={Plus}>
            Generate Demo Session
          </Button>
          <Button onClick={fetchSessions} variant="secondary" icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="cyber-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-cyber-text mb-4">Sessions</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                onClick={() => setSelectedSession(session)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSession?.session_id === session.session_id
                    ? 'bg-cyber-accent border border-cyber-highlight'
                    : 'bg-cyber-secondary hover:bg-cyber-accent/50'
                }`}
              >
                <p className="text-sm font-bold text-cyber-text truncate">{session.name}</p>
                <p className="text-xs text-cyber-muted">{session.session_id}</p>
                <p className="text-xs text-cyber-highlight mt-1">{session.packet_count} packets</p>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-cyber-muted text-sm text-center py-4">No sessions found</p>
            )}
          </div>
        </div>

        <div className="col-span-3 space-y-6">
          {selectedSession && (
            <>
              <div className="cyber-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-cyber-text">{selectedSession.name}</h3>
                    <p className="text-sm text-cyber-muted font-mono">{selectedSession.session_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDeleteSession(selectedSession.session_id)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-cyber-muted text-sm">Packets</p>
                    <p className="text-xl font-bold text-cyber-highlight">{selectedSession.packet_count}</p>
                  </div>
                  <div>
                    <p className="text-cyber-muted text-sm">Total Bytes</p>
                    <p className="text-xl font-bold text-cyber-success">{(selectedSession.total_bytes / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="text-cyber-muted text-sm">Duration</p>
                    <p className="text-xl font-bold text-cyber-warning">
                      {selectedSession.start_time && selectedSession.end_time
                        ? `${Math.round((new Date(selectedSession.end_time) - new Date(selectedSession.start_time)) / 1000)}s`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="cyber-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyber-text mb-4">Traffic Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#16213e" />
                      <XAxis dataKey="time" stroke="#8888aa" fontSize={10} />
                      <YAxis stroke="#8888aa" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #0f3460',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="inbound" stackId="1" stroke="#00ff88" fill="#00ff88" fillOpacity={0.3} name="Inbound" />
                      <Area type="monotone" dataKey="outbound" stackId="1" stroke="#ffaa00" fill="#ffaa00" fillOpacity={0.3} name="Outbound" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-cyber-text mb-4">Packet Data</h3>
                <DataTable 
                  columns={packetColumns} 
                  data={packets.slice(0, 100)} 
                  emptyMessage="No packet data available"
                />
                {packets.length > 100 && (
                  <p className="text-cyber-muted text-sm text-center mt-4">
                    Showing first 100 of {packets.length} packets
                  </p>
                )}
              </div>
            </>
          )}

          {!selectedSession && (
            <div className="cyber-card rounded-xl p-12 text-center">
              <Eye className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
              <p className="text-cyber-muted">Select a session to view traffic data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
