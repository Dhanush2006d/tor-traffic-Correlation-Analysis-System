import sqlite3
import os
from datetime import datetime

DATABASE_PATH = "forensics.db"

def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tor_nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fingerprint TEXT UNIQUE NOT NULL,
            nickname TEXT NOT NULL,
            ip_masked TEXT NOT NULL,
            port INTEGER NOT NULL,
            bandwidth INTEGER NOT NULL,
            flags TEXT NOT NULL,
            node_type TEXT NOT NULL,
            uptime INTEGER NOT NULL,
            country TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS traffic_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            packet_count INTEGER DEFAULT 0,
            total_bytes INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS packets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            src_ip TEXT NOT NULL,
            dst_ip TEXT NOT NULL,
            protocol TEXT NOT NULL,
            size INTEGER NOT NULL,
            direction TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES traffic_sessions(session_id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT UNIQUE NOT NULL,
            session_id TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            timing_score REAL DEFAULT 0,
            volume_score REAL DEFAULT 0,
            pattern_score REAL DEFAULT 0,
            overall_confidence REAL DEFAULT 0,
            justification TEXT,
            entry_node_id INTEGER,
            middle_node_id INTEGER,
            exit_node_id INTEGER,
            probable_origin TEXT,
            analyst_notes TEXT,
            evidence_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES traffic_sessions(session_id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id INTEGER NOT NULL,
            case_id TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id)
        )
    ''')
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully")
