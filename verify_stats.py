import requests

try:
    resp = requests.get("http://localhost:5000/api/stats", timeout=5)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print("Response:", resp.json())
    else:
        print("Error:", resp.text)
except Exception as e:
    print(f"Request failed: {e}")
