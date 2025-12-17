from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
import uuid
from backend.database import get_connection
from backend.models.schemas import AnalysisCreate, Analysis
from backend.services.correlation_engine import CorrelationEngine

router = APIRouter(prefix="/api/analysis", tags=["Correlation Analysis"])

@router.get("/")
async def get_analyses():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.get("/{case_id}")
async def get_analysis(case_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE case_id = ?", (case_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis = dict(row)
    
    if analysis.get('entry_node_id'):
        cursor.execute("SELECT * FROM tor_nodes WHERE id = ?", (analysis['entry_node_id'],))
        entry = cursor.fetchone()
        analysis['entry_node'] = dict(entry) if entry else None
    
    if analysis.get('middle_node_id'):
        cursor.execute("SELECT * FROM tor_nodes WHERE id = ?", (analysis['middle_node_id'],))
        middle = cursor.fetchone()
        analysis['middle_node'] = dict(middle) if middle else None
    
    if analysis.get('exit_node_id'):
        cursor.execute("SELECT * FROM tor_nodes WHERE id = ?", (analysis['exit_node_id'],))
        exit_node = cursor.fetchone()
        analysis['exit_node'] = dict(exit_node) if exit_node else None
    
    conn.close()
    return analysis

@router.post("/run")
async def run_analysis(request: AnalysisCreate):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM traffic_sessions WHERE session_id = ?", (request.session_id,))
    session = cursor.fetchone()
    
    if not session:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
    
    cursor.execute("SELECT * FROM packets WHERE session_id = ?", (request.session_id,))
    packets = [dict(p) for p in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM tor_nodes")
    nodes = [dict(n) for n in cursor.fetchall()]
    
    if not nodes:
        conn.close()
        raise HTTPException(status_code=400, detail="No TOR nodes available. Please generate nodes first.")
    
    engine = CorrelationEngine(time_window=request.time_window)
    result = engine.run_analysis(packets, nodes)
    
    case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
    
    circuit = result.get('circuit', {})
    entry_node_id = circuit.get('entry', {}).get('id')
    middle_node_id = circuit.get('middle', {}).get('id')
    exit_node_id = circuit.get('exit', {}).get('id')
    
    cursor.execute('''
        INSERT INTO analyses (
            case_id, session_id, status, timing_score, volume_score, pattern_score,
            overall_confidence, justification, entry_node_id, middle_node_id, exit_node_id,
            probable_origin, analyst_notes, evidence_hash, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        case_id,
        request.session_id,
        'completed',
        result['timing_score'],
        result['volume_score'],
        result['pattern_score'],
        result['overall_confidence'],
        result['justification'],
        entry_node_id,
        middle_node_id,
        exit_node_id,
        result['probable_origin'],
        request.analyst_notes,
        result['evidence_hash'],
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "case_id": case_id,
        "session_id": request.session_id,
        "status": "completed",
        "timing_score": result['timing_score'],
        "volume_score": result['volume_score'],
        "pattern_score": result['pattern_score'],
        "overall_confidence": result['overall_confidence'],
        "justification": result['justification'],
        "circuit": result['circuit'],
        "probable_origin": result['probable_origin'],
        "evidence_hash": result['evidence_hash']
    }

@router.post("/{case_id}/notes")
async def update_analyst_notes(case_id: str, notes: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE analyses SET analyst_notes = ? WHERE case_id = ?", (notes, case_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    conn.commit()
    conn.close()
    
    return {"message": "Notes updated", "case_id": case_id}

@router.delete("/{case_id}")
async def delete_analysis(case_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM reports WHERE case_id = ?", (case_id,))
    cursor.execute("DELETE FROM analyses WHERE case_id = ?", (case_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": f"Analysis {case_id} deleted"}
