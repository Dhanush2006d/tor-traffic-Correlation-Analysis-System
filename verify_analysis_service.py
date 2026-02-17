import requests
import json
import time

BASE_URL = "http://localhost:5000/api/analysis"
SESSION_ID = "INIT-TEST" 

def test_run_analysis():
    print(f"Testing POST {BASE_URL}/run...")
    headers = {'Content-Type': 'application/json'}
    # Assuming 'INIT-TEST' probably doesn't exist, we might get 404, but that's better than a crash.
    # To properly test, we first need a session. 
    # Let's try to get existing sessions first.
    try:
        sessions_resp = requests.get("http://localhost:5000/api/sessions/")
        sessions = sessions_resp.json()
        if not sessions:
            print("No sessions found to analyze.")
            return

        session_id = sessions[0]['session_id']
        print(f"Using Session ID: {session_id}")
        
        payload = {
            "session_id": session_id,
            "analyst_notes": "Automated verification test"
        }
        
        resp = requests.post(f"{BASE_URL}/run", json=payload, headers=headers)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        
    except Exception as e:
        print(f"Analysis Run Failed: {e}")

if __name__ == "__main__":
    test_run_analysis()
