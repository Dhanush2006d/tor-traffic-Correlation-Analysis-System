from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

from backend.database import init_db, get_connection

from backend.routers import nodes, sessions, analysis, reports, osint, threat_intel, stats
from backend.services.tor_simulator import generate_simulated_nodes, generate_demo_traffic
import uuid
from datetime import datetime

app = FastAPI(
    title="TOR Traffic Correlation Analysis System",
    description="Forensic web application for probabilistic TOR traffic correlation analysis. "
                "This system provides investigative leads through statistical pattern matching and "
                "does NOT claim to de-anonymize TOR traffic.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(nodes.router)
app.include_router(sessions.router)
app.include_router(analysis.router)
app.include_router(reports.router)
app.include_router(osint.router)
app.include_router(threat_intel.router)
app.include_router(stats.router)

@app.on_event("startup")
async def startup_event():
    init_db()
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM tor_nodes")
    node_count = cursor.fetchone()['count']
    
    if node_count == 0:
        print("Initializing demo data...")
        nodes_data = generate_simulated_nodes(30)
        for node in nodes_data:
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
            except:
                pass
        
        session_id = f"INIT-{uuid.uuid4().hex[:8].upper()}"
        packets = generate_demo_traffic(session_id, 150)
        
        start_time = packets[0]['timestamp'] if packets else datetime.now().isoformat()
        end_time = packets[-1]['timestamp'] if packets else datetime.now().isoformat()
        total_bytes = sum(p['size'] for p in packets)
        
        cursor.execute('''
            INSERT INTO traffic_sessions (session_id, name, description, start_time, end_time, packet_count, total_bytes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_id,
            "Initial Demo Session",
            "Auto-generated demo traffic for immediate functionality",
            start_time,
            end_time,
            len(packets),
            total_bytes
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
        print("Demo data initialized successfully!")
    
    conn.close()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "TOR Traffic Correlation Analysis System"}

FRONTEND_DIR = "frontend/dist"

if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIR}/assets"), name="static_assets")

@app.get("/favicon.svg")
async def favicon():
    if os.path.exists(f"{FRONTEND_DIR}/favicon.svg"):
        return FileResponse(f"{FRONTEND_DIR}/favicon.svg")
    return FileResponse(f"{FRONTEND_DIR}/index.html")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
        return None
    
    if os.path.exists(FRONTEND_DIR):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    
    return HTMLResponse(content="<h1>Frontend not built. Run npm run build in frontend/</h1>", status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
