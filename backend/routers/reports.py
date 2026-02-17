from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List
import os
from backend.database import get_connection
from backend.services.report_generator import ForensicReportGenerator

router = APIRouter(prefix="/api/reports", tags=["Forensic Reports"])

@router.get("/")
async def get_reports():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, a.overall_confidence, a.status as analysis_status
        FROM reports r
        JOIN analyses a ON r.analysis_id = a.id
        ORDER BY r.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/generate/{case_id}")
async def generate_report(case_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM analyses WHERE case_id = ?", (case_id,))
    analysis = cursor.fetchone()
    
    if not analysis:
        conn.close()
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis_dict = dict(analysis)
    
    circuit = {"entry": {}, "middle": {}, "exit": {}}
    
    if analysis_dict.get('entry_node_id'):
        cursor.execute("SELECT * FROM tor_nodes WHERE id = ?", (analysis_dict['entry_node_id'],))
        entry = cursor.fetchone()
        if entry:
            circuit['entry'] = dict(entry)
    
    if analysis_dict.get('middle_node_id'):
        cursor.execute("SELECT * FROM tor_nodes WHERE id = ?", (analysis_dict['middle_node_id'],))
        middle = cursor.fetchone()
        if middle:
            circuit['middle'] = dict(middle)
    
    if analysis_dict.get('exit_node_id'):
        cursor.execute("SELECT * FROM tor_nodes WHERE id = ?", (analysis_dict['exit_node_id'],))
        exit_node = cursor.fetchone()
        if exit_node:
            circuit['exit'] = dict(exit_node)
    
    analysis_dict['circuit'] = circuit
    
    generator = ForensicReportGenerator()
    file_path = generator.generate_report(analysis_dict)
    
    cursor.execute('''
        INSERT INTO reports (analysis_id, case_id, file_path)
        VALUES (?, ?, ?)
    ''', (analysis_dict['id'], case_id, file_path))
    
    conn.commit()
    
    cursor.execute("SELECT id FROM reports WHERE file_path = ?", (file_path,))
    report = cursor.fetchone()
    report_id = report['id'] if report else None
    
    conn.close()
    
    return {
        "message": "Report generated successfully",
        "report_id": report_id,
        "case_id": case_id,
        "file_path": file_path
    }

@router.get("/download/{report_id}")
async def download_report(report_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    report = cursor.fetchone()
    conn.close()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    file_path = report['file_path']
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")
    
    filename = os.path.basename(file_path)
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/pdf'
    )

@router.get("/download-by-case/{case_id}")
async def download_report_by_case(case_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM reports WHERE case_id = ? ORDER BY created_at DESC LIMIT 1", (case_id,))
    report = cursor.fetchone()
    conn.close()
    
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this case")
    
    file_path = report['file_path']
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")
    
    filename = os.path.basename(file_path)
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/pdf'
    )

@router.delete("/{report_id}")
async def delete_report(report_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT file_path FROM reports WHERE id = ?", (report_id,))
    report = cursor.fetchone()
    
    if not report:
        conn.close()
        raise HTTPException(status_code=404, detail="Report not found")
    
    file_path = report['file_path']
    if os.path.exists(file_path):
        os.remove(file_path)
    
    cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    conn.commit()
    conn.close()
    
    return {"message": f"Report {report_id} deleted"}
