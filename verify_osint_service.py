import requests
import json
import time

BASE_URL = "http://localhost:5000/api/threat-intel"
CASE_ID = "test-case-123"

def test_scan():
    print(f"Testing POST {BASE_URL}/scan/{CASE_ID}...")
    headers = {'Content-Type': 'application/json'}
    # Use a dummy IP so we don't spam real APIs too much, or use one we know works.
    payload = {"indicators": ["8.8.8.8"]} 
    
    try:
        resp = requests.post(f"{BASE_URL}/scan/{CASE_ID}", json=payload, headers=headers)
        print(f"Scan Status: {resp.status_code}")
        print(f"Scan Response: {resp.text}")
        
        # Poll for results
        print("Waiting for background scan to complete...")
        for i in range(5):
            time.sleep(1)
            resp = requests.get(f"{BASE_URL}/matches/{CASE_ID}")
            data = resp.json()
            print(f"Poll {i+1}: Found {len(data)} matches")
            if len(data) > 0:
                print("Results found:", data)
                break
    except Exception as e:
        print(f"Scan Request Failed: {e}")

def test_get():
    # Wait a bit for background task (even if it fails fast)
    time.sleep(2)
    print(f"Testing GET {BASE_URL}/matches/{CASE_ID}...")
    try:
        resp = requests.get(f"{BASE_URL}/matches/{CASE_ID}")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Get Request Failed: {e}")

if __name__ == "__main__":
    test_scan()
    test_get()
