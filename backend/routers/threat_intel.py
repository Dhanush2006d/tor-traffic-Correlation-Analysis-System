from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any
from backend.database import get_connection
from backend.models.schemas import ThreatIntel as ThreatIntelSchema
from backend.services.osint_scanner import OSINTScanner
import json
import sqlite3

router = APIRouter(prefix="/api/threat-intel", tags=["Threat Intelligence"])

def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()

async def background_scan(case_id: str, indicators: List[str]):
    """
    Background task to scan indicators and save to DB.
    """
    try:
        with open("backend_debug.log", "a") as f:
            f.write(f"DEBUG: Starting background scan for Case {case_id} with indicators: {indicators}\n")
    except:
        pass

    conn = get_connection()
    cursor = conn.cursor()
    
    # Instantiate scanner locally to ensure correct event loop binding
    scanner = OSINTScanner()
    
    try:
        for indicator in indicators:
            print(f"DEBUG: Processing indicator: {indicator}")

            result = {}
            # Determine type
            if len(indicator) > 30:
                 # Likely a Hash
                 result = await scanner.scan_hash(indicator)
            else:
                 # Default to IP/Domain/Text (Demo Mode handles all strings)
                 # We don't enforce strict IP regex so "google.com" or "test" also works
                 result = await scanner.scan_ip(indicator)
                 
                 # Adjust type if it doesn't look like an IP
                 import re
                 if not re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", indicator):
                     result["type"] = "Domain/Text"
            
            if result:
                # Handle error case
                if "error" in result:
                    result["indicator"] = indicator
                    result["type"] = "Unknown"
                    result["category"] = "Error"
                    result["confidence"] = 0
                    result["source"] = "System"
                    result["severity"] = "High"
                    result["raw_data"] = {"error": result["error"]}

                cursor.execute('''
                    INSERT INTO threat_intel (case_id, indicator, type, category, confidence, source, severity, raw_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    case_id,
                    result.get("indicator"),
                    result.get("type"),
                    result.get("category"),
                    result.get("confidence"),
                    result.get("source"),
                    result.get("severity"),
                    json.dumps(result.get("raw_data"))
                ))
                conn.commit()
    except Exception as e:
        try:
            with open("backend_debug.log", "a") as f:
                f.write(f"ERROR: Background scan failed: {e}\n")
        except:
            pass
    finally:
        await scanner.close()
        conn.close()

@router.post("/scan/{case_id}")
async def trigger_scan(case_id: str, background_tasks: BackgroundTasks, payload: Dict[str, List[str]]):
    """
    Triggers an OSINT scan for a list of indicators in a case.
    Payload: {"indicators": ["1.1.1.1", "bad_hash"]}
    """
    indicators = payload.get("indicators", [])
    if not indicators:
        raise HTTPException(status_code=400, detail="No indicators provided")
    
    background_tasks.add_task(background_scan, case_id, indicators)
    return {"status": "Scan initiated", "count": len(indicators)}

@router.get("/matches/{case_id}", response_model=List[ThreatIntelSchema])
def get_matches(case_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM threat_intel WHERE case_id = ?", (case_id,))
    rows = cursor.fetchall()
    
    results = []
    for row in rows:
        results.append(ThreatIntelSchema(
            id=row["id"],
            case_id=row["case_id"],
            indicator=row["indicator"],
            type=row["type"],
            category=row["category"],
            confidence=row["confidence"],
            source=row["source"],
            severity=row["severity"],
            raw_data=row["raw_data"]
        ))
    
    conn.close()
    return results
