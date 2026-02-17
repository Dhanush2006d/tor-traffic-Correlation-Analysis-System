import requests
import json

def test_api():
    url = "http://localhost:5000/api/osint/analyze/indicator"
    payload = {"indicator": "https://google.com"}
    
    print(f"Testing {url} with {payload}")
    try:
        resp = requests.post(url, json=payload, timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_api()
