from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TorNode(BaseModel):
    id: Optional[int] = None
    fingerprint: str
    nickname: str
    ip_masked: str
    port: int
    bandwidth: int
    flags: str
    node_type: str
    uptime: int
    country: str
    created_at: Optional[datetime] = None

class TorNodeCreate(BaseModel):
    count: int = 20

class TrafficSession(BaseModel):
    id: Optional[int] = None
    session_id: str
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    packet_count: int = 0
    total_bytes: int = 0
    created_at: Optional[datetime] = None

class Packet(BaseModel):
    id: Optional[int] = None
    session_id: str
    timestamp: datetime
    src_ip: str
    dst_ip: str
    protocol: str
    size: int
    direction: str

class AnalysisCreate(BaseModel):
    session_id: str
    time_window: float = 5.0
    analyst_notes: Optional[str] = None

class Analysis(BaseModel):
    id: Optional[int] = None
    case_id: str
    session_id: str
    status: str = "pending"
    timing_score: float = 0
    volume_score: float = 0
    pattern_score: float = 0
    overall_confidence: float = 0
    justification: Optional[str] = None
    entry_node_id: Optional[int] = None
    middle_node_id: Optional[int] = None
    exit_node_id: Optional[int] = None
    probable_origin: Optional[str] = None
    analyst_notes: Optional[str] = None
    evidence_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class AnalysisResult(BaseModel):
    case_id: str
    session_id: str
    status: str
    timing_score: float
    volume_score: float
    pattern_score: float
    overall_confidence: float
    justification: str
    circuit: dict
    probable_origin: str
    evidence_hash: str

class ConfidenceBreakdown(BaseModel):
    timing_score: float
    volume_score: float
    pattern_score: float
    overall_confidence: float
    justification: str

class Report(BaseModel):
    id: Optional[int] = None
    analysis_id: int
    case_id: str
    file_path: str
    created_at: Optional[datetime] = None

class StatsResponse(BaseModel):
    total_nodes: int
    total_sessions: int
    total_analyses: int
    completed_analyses: int

class ThreatIntel(BaseModel):
    id: Optional[int] = None
    case_id: str
    indicator: str
    type: str # IP, Domain, Hash
    category: Optional[str] = None
    confidence: int = 0
    source: str
    severity: str = "Low"
    last_updated: Optional[datetime] = None
    raw_data: Optional[str] = None
