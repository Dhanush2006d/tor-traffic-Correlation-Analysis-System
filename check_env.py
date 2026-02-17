from dotenv import load_dotenv
import os

# Load env variables
success = load_dotenv()
print(f"load_dotenv returned: {success}")

keys = ["ABUSEIPDB_API_KEY", "VIRUSTOTAL_API_KEY", "OPENAI_API_KEY"]
for key in keys:
    val = os.getenv(key)
    if val:
        print(f"{key}: Loaded (Length: {len(val)})")
    else:
        print(f"{key}: MISSING")
