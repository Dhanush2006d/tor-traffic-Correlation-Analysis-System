from backend.database import get_connection

conn = get_connection()
cursor = conn.cursor()

try:
    cursor.execute("SELECT COUNT(*) FROM tor_nodes")
    node_count = cursor.fetchone()[0]
    print(f"Tor Nodes in DB: {node_count}")

    cursor.execute("SELECT COUNT(*) FROM traffic_sessions")
    session_count = cursor.fetchone()[0]
    print(f"Traffic Sessions in DB: {session_count}")

    cursor.execute("SELECT COUNT(*) FROM threat_intel")
    threat_count = cursor.fetchone()[0]
    print(f"Threat Intel Entries in DB: {threat_count}")

except Exception as e:
    print(f"Error querying DB: {e}")
finally:
    conn.close()
