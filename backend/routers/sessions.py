from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from datetime import datetime
import uuid
import os
from backend.database import get_connection
from backend.services.tor_simulator import generate_demo_traffic
from backend.services.pcap_analyzer import PCAPAnalyzer

router = APIRouter(prefix="/api/sessions", tags=["Traffic Sessions"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
async def get_sessions():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM traffic_sessions ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.get("/{session_id}")
async def get_session(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM traffic_sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = dict(row)
    
    cursor.execute("SELECT * FROM packets WHERE session_id = ? ORDER BY timestamp", (session_id,))
    packets = [dict(p) for p in cursor.fetchall()]
    session['packets'] = packets
    
    conn.close()
    return session

@router.post("/generate-demo")
async def generate_demo_session(packet_count: int = 100):
    session_id = f"DEMO-{uuid.uuid4().hex[:8].upper()}"
    session_name = f"Demo Session {datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    packets = generate_demo_traffic(session_id, packet_count)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    start_time = packets[0]['timestamp'] if packets else datetime.now().isoformat()
    end_time = packets[-1]['timestamp'] if packets else datetime.now().isoformat()
    total_bytes = sum(p['size'] for p in packets)
    
    cursor.execute('''
        INSERT INTO traffic_sessions (session_id, name, description, start_time, end_time, packet_count, total_bytes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (session_id, session_name, "Auto-generated demo traffic session", start_time, end_time, len(packets), total_bytes))
    
    for packet in packets:
        cursor.execute('''
            INSERT INTO packets (session_id, timestamp, src_ip, dst_ip, protocol, size, direction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            packet['session_id'],
            packet['timestamp'],
            packet['src_ip'],
            packet['dst_ip'],
            packet['protocol'],
            packet['size'],
            packet['direction']
        ))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "Demo session created",
        "session_id": session_id,
        "packet_count": len(packets)
    }

@router.post("/upload-pcap")
async def upload_pcap(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pcap', '.pcapng', '.cap')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PCAP file.")
    
    session_id = f"PCAP-{uuid.uuid4().hex[:8].upper()}"
    
    file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{file.filename}")
    
    content = await file.read()
    with open(file_path, 'wb') as f:
        f.write(content)
    
    analyzer = PCAPAnalyzer()
    result = analyzer.analyze_pcap(file_path, session_id)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    packets = result.get('packets', [])
    start_time = packets[0]['timestamp'] if packets else datetime.now().isoformat()
    end_time = packets[-1]['timestamp'] if packets else datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO traffic_sessions (session_id, name, description, start_time, end_time, packet_count, total_bytes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        session_id,
        f"PCAP Upload: {file.filename}",
        result.get('analysis_notes', 'Uploaded PCAP file'),
        start_time,
        end_time,
        result.get('packet_count', 0),
        result.get('total_bytes', 0)
    ))
    
    for packet in packets:
        cursor.execute('''
            INSERT INTO packets (session_id, timestamp, src_ip, dst_ip, protocol, size, direction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            packet['session_id'],
            packet['timestamp'],
            packet['src_ip'],
            packet['dst_ip'],
            packet['protocol'],
            packet['size'],
            packet['direction']
        ))
    
    conn.commit()
    conn.close()
    
    return {
        "message": "PCAP file processed",
        "session_id": session_id,
        "packet_count": result.get('packet_count', 0),
        "protocol_distribution": result.get('protocol_distribution', {}),
        "burst_count": result.get('burst_count', 0)
    }

@router.get("/{session_id}/packets")
async def get_session_packets(session_id: str, limit: int = 500, offset: int = 0):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM packets WHERE session_id = ?", (session_id,))
    total = cursor.fetchone()['total']
    
    cursor.execute(
        "SELECT * FROM packets WHERE session_id = ? ORDER BY timestamp LIMIT ? OFFSET ?",
        (session_id, limit, offset)
    )
    packets = [dict(p) for p in cursor.fetchall()]
    conn.close()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "packets": packets
    }

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM packets WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM traffic_sessions WHERE session_id = ?", (session_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": f"Session {session_id} deleted"}
