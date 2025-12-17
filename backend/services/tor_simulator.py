import random
import hashlib
import string
from datetime import datetime, timedelta
from typing import List, Dict

COUNTRIES = ["US", "DE", "NL", "FR", "GB", "CA", "SE", "CH", "RO", "RU", "UA", "PL", "CZ", "AT", "FI"]
NICKNAMES_PREFIX = ["Relay", "Guard", "Exit", "Node", "Tor", "Anon", "Privacy", "Freedom", "Secure", "Fast"]
NICKNAMES_SUFFIX = ["Alpha", "Beta", "Gamma", "Delta", "Omega", "Prime", "Core", "Net", "Hub", "Link"]

def generate_fingerprint() -> str:
    random_bytes = ''.join(random.choices(string.hexdigits.upper(), k=40))
    return random_bytes

def generate_nickname() -> str:
    prefix = random.choice(NICKNAMES_PREFIX)
    suffix = random.choice(NICKNAMES_SUFFIX)
    number = random.randint(1, 999)
    return f"{prefix}{suffix}{number}"

def mask_ip(ip: str) -> str:
    parts = ip.split('.')
    return f"{parts[0]}.{parts[1]}.xxx.xxx"

def generate_simulated_nodes(count: int = 20) -> List[Dict]:
    nodes = []
    
    guard_count = max(1, count // 4)
    exit_count = max(1, count // 4)
    middle_count = count - guard_count - exit_count
    
    for i in range(guard_count):
        ip = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
        node = {
            "fingerprint": generate_fingerprint(),
            "nickname": generate_nickname(),
            "ip_masked": mask_ip(ip),
            "port": random.choice([443, 9001, 9030, 9050, 9051]),
            "bandwidth": random.randint(5000, 100000),
            "flags": "Guard,Stable,Valid,Running",
            "node_type": "Guard",
            "uptime": random.randint(86400, 31536000),
            "country": random.choice(COUNTRIES)
        }
        nodes.append(node)
    
    for i in range(middle_count):
        ip = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
        node = {
            "fingerprint": generate_fingerprint(),
            "nickname": generate_nickname(),
            "ip_masked": mask_ip(ip),
            "port": random.choice([443, 9001, 9030]),
            "bandwidth": random.randint(3000, 80000),
            "flags": "Stable,Valid,Running",
            "node_type": "Middle",
            "uptime": random.randint(43200, 15768000),
            "country": random.choice(COUNTRIES)
        }
        nodes.append(node)
    
    for i in range(exit_count):
        ip = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
        node = {
            "fingerprint": generate_fingerprint(),
            "nickname": generate_nickname(),
            "ip_masked": mask_ip(ip),
            "port": random.choice([80, 443, 9001]),
            "bandwidth": random.randint(10000, 150000),
            "flags": "Exit,Stable,Valid,Running",
            "node_type": "Exit",
            "uptime": random.randint(86400, 31536000),
            "country": random.choice(COUNTRIES)
        }
        nodes.append(node)
    
    return nodes

def generate_demo_traffic(session_id: str, packet_count: int = 100) -> List[Dict]:
    packets = []
    base_time = datetime.now() - timedelta(hours=1)
    
    src_ips = [f"192.168.1.{random.randint(10, 50)}" for _ in range(3)]
    dst_ips = [f"10.0.0.{random.randint(1, 254)}" for _ in range(5)]
    
    protocols = ["TCP", "UDP", "TLS", "HTTP", "HTTPS"]
    protocol_weights = [0.4, 0.15, 0.25, 0.1, 0.1]
    
    current_time = base_time
    for i in range(packet_count):
        time_delta = random.expovariate(1/0.5)
        current_time = current_time + timedelta(seconds=time_delta)
        
        direction = random.choice(["inbound", "outbound"])
        if direction == "inbound":
            src_ip = random.choice(dst_ips)
            dst_ip = random.choice(src_ips)
        else:
            src_ip = random.choice(src_ips)
            dst_ip = random.choice(dst_ips)
        
        protocol = random.choices(protocols, weights=protocol_weights)[0]
        
        if protocol in ["HTTP", "HTTPS"]:
            size = random.randint(500, 15000)
        elif protocol == "TLS":
            size = random.randint(100, 5000)
        else:
            size = random.randint(40, 1500)
        
        packet = {
            "session_id": session_id,
            "timestamp": current_time.isoformat(),
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "protocol": protocol,
            "size": size,
            "direction": direction
        }
        packets.append(packet)
    
    return packets
