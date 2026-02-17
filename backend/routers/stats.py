from fastapi import APIRouter
from backend.database import get_connection

router = APIRouter(prefix="/api/stats", tags=["System Statistics"])

@router.get("")
async def get_system_stats():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Total Nodes
    cursor.execute("SELECT COUNT(*) FROM tor_nodes")
    total_nodes = cursor.fetchone()[0]
    
    # Total Sessions
    cursor.execute("SELECT COUNT(*) FROM traffic_sessions")
    total_sessions = cursor.fetchone()[0]
    
    # Total Analyses
    cursor.execute("SELECT COUNT(*) FROM analyses")
    total_analyses = cursor.fetchone()[0]
    
    # Completed Analyses
    cursor.execute("SELECT COUNT(*) FROM analyses WHERE status = 'completed'")
    completed_analyses = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "total_nodes": total_nodes,
        "total_sessions": total_sessions,
        "total_analyses": total_analyses,
        "completed_analyses": completed_analyses
    }
