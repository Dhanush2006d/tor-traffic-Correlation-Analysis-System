from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
# Ensure backend directory is in python path or use relative imports where appropriate
from backend.database import get_connection
from backend.services.ai_assistant import SecurityAnalystAI
from backend.services.correlation_engine import CorrelationEngine

router = APIRouter(prefix="/api/analysis", tags=["Traffic Analysis"])

ai_service = SecurityAnalystAI()

@router.get("/{session_id}/insights")
async def get_session_insights(session_id: str):
    """
    Run statistical AI analysis on a specific session to find anomalies.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Fetch packets for the session
    cursor.execute("SELECT * FROM packets WHERE session_id = ? ORDER BY timestamp", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail="Session not found or empty")
        
    packets = [dict(row) for row in rows]
    
    # Run the AI engine
    try:
        insights = ai_service.analyze_session(packets)
        return ai_service.analyze_session(packets)
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run analysis")

@router.get("/")
async def get_analyses():
    """
    Get all past analyses.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/run")
async def run_correlation(data: Dict[str, Any]):
    """
    Run the full multi-factor correlation analysis on a session and save the result.
    """
    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if analysis already exists for this session to avoid duplicates (optional, but good for demo)
    # cursor.execute("SELECT * FROM analyses WHERE session_id = ?", (session_id,))
    # existing = cursor.fetchone()
    # if existing:
    #     return dict(existing)
    
    # 1. Fetch Session Packets
    cursor.execute("SELECT * FROM packets WHERE session_id = ? ORDER BY timestamp", (session_id,))
    packet_rows = cursor.fetchall()
    packets = [dict(row) for row in packet_rows]
    
    if not packets:
        conn.close()
        raise HTTPException(status_code=404, detail="No packets found for this session")

    # 2. Fetch Active Tor Nodes
    cursor.execute("SELECT * FROM tor_nodes")
    node_rows = cursor.fetchall()
    nodes = [dict(row) for row in node_rows]
    
    # 3. Run Correlation Engine
    engine = CorrelationEngine()
    result = engine.run_analysis(packets, nodes)
    
    # 4. Run AI Analysis for Narrative
    ai_narrative = ""
    try:
        # We reuse the existing AI service to get the rich narrative
        ai_result = ai_service.analyze_session(packets)
        if isinstance(ai_result, dict):
            ai_narrative = ai_result.get("narrative", "")
            # If standard key isn't there, check for alternate structure or just use str
            if not ai_narrative and "insights" in ai_result:
                 ai_narrative = "See attached insights."
        else:
            ai_narrative = str(ai_result)
            
    except Exception as e:
        print(f"AI Analysis failed during correlation run: {e}")
        ai_narrative = "AI Narrative generation unavailable."

    # Add context
    case_id = f"CASE-{session_id[-6:]}"
    result['case_id'] = case_id
    
    # Combine justifications
    statistical_justification = result.get('justification', '')
    full_justification = f"{statistical_justification}\n\n=== AI FORENSIC ANALYSIS ===\n{ai_narrative}"

    # Extract circuit IDs safely
    circuit = result.get('circuit', {})
    entry_id = circuit.get('entry', {}).get('id') if circuit.get('entry') else None
    middle_id = circuit.get('middle', {}).get('id') if circuit.get('middle') else None
    exit_id = circuit.get('exit', {}).get('id') if circuit.get('exit') else None

    # 4. Save to Database
    try:
        cursor.execute('''
            INSERT INTO analyses (
                case_id, session_id, status, 
                timing_score, volume_score, pattern_score, overall_confidence, 
                justification, entry_node_id, middle_node_id, exit_node_id, 
                probable_origin, analyst_notes, evidence_hash, completed_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            case_id,
            session_id,
            'completed',
            result.get('timing_score', 0),
            result.get('volume_score', 0),
            result.get('pattern_score', 0),
            result.get('overall_confidence', 0),
            full_justification,
            entry_id, middle_id, exit_id,
            result.get('probable_origin', 'Unknown'),
            data.get('analyst_notes', ''),
            result.get('evidence_hash', f"SHA256-{session_id}") 
        ))
        conn.commit()
    except Exception as e:
        print(f"Error saving analysis: {e}")
    finally:
        conn.close()
    
    # Return the full result including the new fields we just generated
    result['justification'] = full_justification
    result['ai_narrative'] = ai_narrative
    
    return result
