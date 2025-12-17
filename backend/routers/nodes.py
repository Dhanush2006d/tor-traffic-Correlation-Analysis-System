from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.database import get_connection
from backend.models.schemas import TorNode, TorNodeCreate
from backend.services.tor_simulator import generate_simulated_nodes

router = APIRouter(prefix="/api/nodes", tags=["TOR Nodes"])

@router.get("/", response_model=List[dict])
async def get_nodes(
    node_type: Optional[str] = Query(None, description="Filter by node type: Guard, Middle, Exit"),
    country: Optional[str] = Query(None, description="Filter by country code")
):
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM tor_nodes WHERE 1=1"
    params = []
    
    if node_type:
        query += " AND node_type = ?"
        params.append(node_type)
    
    if country:
        query += " AND country = ?"
        params.append(country)
    
    query += " ORDER BY bandwidth DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

@router.get("/countries")
async def get_countries():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT country FROM tor_nodes ORDER BY country")
    rows = cursor.fetchall()
    conn.close()
    return [row['country'] for row in rows]

@router.post("/generate")
async def generate_nodes(request: TorNodeCreate):
    nodes = generate_simulated_nodes(request.count)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    inserted_count = 0
    for node in nodes:
        try:
            cursor.execute('''
                INSERT INTO tor_nodes (fingerprint, nickname, ip_masked, port, bandwidth, flags, node_type, uptime, country)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                node['fingerprint'],
                node['nickname'],
                node['ip_masked'],
                node['port'],
                node['bandwidth'],
                node['flags'],
                node['node_type'],
                node['uptime'],
                node['country']
            ))
            inserted_count += 1
        except Exception:
            continue
    
    conn.commit()
    conn.close()
    
    return {"message": f"Generated {inserted_count} TOR nodes", "count": inserted_count}

@router.delete("/clear")
async def clear_nodes():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tor_nodes")
    conn.commit()
    conn.close()
    return {"message": "All TOR nodes cleared"}

@router.get("/stats")
async def get_node_stats():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM tor_nodes")
    total = cursor.fetchone()['total']
    
    cursor.execute("SELECT node_type, COUNT(*) as count FROM tor_nodes GROUP BY node_type")
    by_type = {row['node_type']: row['count'] for row in cursor.fetchall()}
    
    cursor.execute("SELECT country, COUNT(*) as count FROM tor_nodes GROUP BY country ORDER BY count DESC LIMIT 10")
    by_country = {row['country']: row['count'] for row in cursor.fetchall()}
    
    conn.close()
    
    return {
        "total": total,
        "by_type": by_type,
        "by_country": by_country
    }
