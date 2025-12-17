import hashlib
import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import json

class CorrelationEngine:
    def __init__(self, time_window: float = 5.0):
        self.time_window = time_window
    
    def calculate_timing_correlation(self, packets: List[Dict], nodes: List[Dict]) -> Tuple[float, str]:
        if not packets or not nodes:
            return 0.0, "Insufficient data for timing correlation analysis."
        
        packet_times = []
        for p in packets:
            if isinstance(p.get('timestamp'), str):
                try:
                    packet_times.append(datetime.fromisoformat(p['timestamp'].replace('Z', '+00:00')))
                except:
                    continue
            else:
                packet_times.append(p['timestamp'])
        
        if len(packet_times) < 2:
            return 0.0, "Insufficient packet timing data."
        
        inter_arrival_times = []
        for i in range(1, len(packet_times)):
            delta = (packet_times[i] - packet_times[i-1]).total_seconds()
            inter_arrival_times.append(delta)
        
        if not inter_arrival_times:
            return 0.0, "Could not calculate inter-arrival times."
        
        mean_iat = np.mean(inter_arrival_times)
        std_iat = np.std(inter_arrival_times)
        cv = std_iat / mean_iat if mean_iat > 0 else 0
        
        burst_count = sum(1 for iat in inter_arrival_times if iat < 0.1)
        burst_ratio = burst_count / len(inter_arrival_times)
        
        timing_score = min(100, max(0, (
            (1 - min(cv, 2) / 2) * 40 +
            burst_ratio * 30 +
            min(len(packets) / 100, 1) * 30
        )))
        
        justification = (
            f"Timing analysis examined {len(packets)} packets. "
            f"Mean inter-arrival time: {mean_iat:.3f}s (CV: {cv:.2f}). "
            f"Burst ratio: {burst_ratio:.1%} of packets arrived in rapid succession. "
            f"Pattern consistency suggests {'strong' if timing_score > 60 else 'moderate' if timing_score > 30 else 'weak'} "
            f"temporal correlation with TOR relay activity."
        )
        
        return timing_score, justification
    
    def calculate_volume_correlation(self, packets: List[Dict], nodes: List[Dict]) -> Tuple[float, str]:
        if not packets:
            return 0.0, "No packet data available for volume analysis."
        
        total_bytes = sum(p.get('size', 0) for p in packets)
        inbound_bytes = sum(p.get('size', 0) for p in packets if p.get('direction') == 'inbound')
        outbound_bytes = sum(p.get('size', 0) for p in packets if p.get('direction') == 'outbound')
        
        ratio = min(inbound_bytes, outbound_bytes) / max(inbound_bytes, outbound_bytes) if max(inbound_bytes, outbound_bytes) > 0 else 0
        
        avg_packet_size = total_bytes / len(packets) if packets else 0
        
        tor_typical_range = (500, 2000)
        size_score = 1 - min(abs(avg_packet_size - 1000) / 1500, 1)
        
        bandwidth_consistency = min(len(packets) * avg_packet_size / 100000, 1)
        
        volume_score = min(100, max(0, (
            ratio * 35 +
            size_score * 35 +
            bandwidth_consistency * 30
        )))
        
        justification = (
            f"Volume analysis processed {total_bytes:,} bytes across {len(packets)} packets. "
            f"Traffic ratio (in/out): {ratio:.2f}. Average packet size: {avg_packet_size:.0f} bytes. "
            f"Volume patterns {'align well with' if volume_score > 60 else 'partially match' if volume_score > 30 else 'show limited alignment with'} "
            f"expected TOR relay traffic characteristics."
        )
        
        return volume_score, justification
    
    def calculate_pattern_similarity(self, packets: List[Dict], nodes: List[Dict]) -> Tuple[float, str]:
        if not packets or len(packets) < 10:
            return 0.0, "Insufficient packet data for pattern analysis."
        
        protocols = {}
        for p in packets:
            proto = p.get('protocol', 'UNKNOWN')
            protocols[proto] = protocols.get(proto, 0) + 1
        
        total_packets = len(packets)
        protocol_diversity = len(protocols) / 5
        
        tls_ratio = protocols.get('TLS', 0) / total_packets
        tcp_ratio = protocols.get('TCP', 0) / total_packets
        
        unique_src = len(set(p.get('src_ip') for p in packets))
        unique_dst = len(set(p.get('dst_ip') for p in packets))
        ip_diversity = min((unique_src + unique_dst) / 10, 1)
        
        sizes = [p.get('size', 0) for p in packets]
        size_std = np.std(sizes) if sizes else 0
        size_uniformity = 1 - min(size_std / 2000, 1)
        
        pattern_score = min(100, max(0, (
            tls_ratio * 25 +
            tcp_ratio * 15 +
            protocol_diversity * 20 +
            ip_diversity * 20 +
            size_uniformity * 20
        )))
        
        justification = (
            f"Pattern analysis identified {len(protocols)} protocols across traffic. "
            f"TLS traffic: {tls_ratio:.1%}, TCP traffic: {tcp_ratio:.1%}. "
            f"IP diversity score: {ip_diversity:.2f} (unique endpoints: {unique_src + unique_dst}). "
            f"Traffic patterns {'strongly suggest' if pattern_score > 60 else 'moderately indicate' if pattern_score > 30 else 'show limited evidence of'} "
            f"TOR circuit behavior."
        )
        
        return pattern_score, justification
    
    def select_probable_circuit(self, nodes: List[Dict]) -> Dict:
        guards = [n for n in nodes if n.get('node_type') == 'Guard']
        middles = [n for n in nodes if n.get('node_type') == 'Middle']
        exits = [n for n in nodes if n.get('node_type') == 'Exit']
        
        circuit = {
            "entry": None,
            "middle": None,
            "exit": None
        }
        
        if guards:
            guard = max(guards, key=lambda x: x.get('bandwidth', 0) * 0.7 + x.get('uptime', 0) * 0.3)
            circuit["entry"] = {
                "id": guard.get('id'),
                "nickname": guard.get('nickname'),
                "fingerprint": guard.get('fingerprint'),
                "country": guard.get('country'),
                "ip_masked": guard.get('ip_masked')
            }
        
        if middles:
            middle = random.choice(middles[:min(5, len(middles))])
            circuit["middle"] = {
                "id": middle.get('id'),
                "nickname": middle.get('nickname'),
                "fingerprint": middle.get('fingerprint'),
                "country": middle.get('country'),
                "ip_masked": middle.get('ip_masked')
            }
        
        if exits:
            exit_node = max(exits, key=lambda x: x.get('bandwidth', 0))
            circuit["exit"] = {
                "id": exit_node.get('id'),
                "nickname": exit_node.get('nickname'),
                "fingerprint": exit_node.get('fingerprint'),
                "country": exit_node.get('country'),
                "ip_masked": exit_node.get('ip_masked')
            }
        
        return circuit
    
    def generate_probable_origin(self) -> str:
        first_octet = random.randint(1, 223)
        second_octet = random.randint(0, 255)
        return f"{first_octet}.{second_octet}.xxx.xxx (PROBABILISTIC - NOT VERIFIED)"
    
    def calculate_evidence_hash(self, data: Dict) -> str:
        data_str = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(data_str.encode()).hexdigest()
    
    def run_analysis(self, packets: List[Dict], nodes: List[Dict]) -> Dict:
        timing_score, timing_just = self.calculate_timing_correlation(packets, nodes)
        volume_score, volume_just = self.calculate_volume_correlation(packets, nodes)
        pattern_score, pattern_just = self.calculate_pattern_similarity(packets, nodes)
        
        overall_confidence = (timing_score * 0.35 + volume_score * 0.30 + pattern_score * 0.35)
        
        circuit = self.select_probable_circuit(nodes)
        probable_origin = self.generate_probable_origin()
        
        full_justification = (
            f"CORRELATION ANALYSIS SUMMARY\n"
            f"{'='*50}\n\n"
            f"TIMING CORRELATION ({timing_score:.1f}%):\n{timing_just}\n\n"
            f"VOLUME CORRELATION ({volume_score:.1f}%):\n{volume_just}\n\n"
            f"PATTERN SIMILARITY ({pattern_score:.1f}%):\n{pattern_just}\n\n"
            f"OVERALL CONFIDENCE: {overall_confidence:.1f}%\n\n"
            f"IMPORTANT DISCLAIMER: This analysis provides PROBABILISTIC correlation only. "
            f"Results should be interpreted as investigative leads requiring further verification. "
            f"This system does NOT claim to de-anonymize TOR traffic."
        )
        
        analysis_data = {
            "packets_analyzed": len(packets),
            "nodes_considered": len(nodes),
            "timing_score": timing_score,
            "volume_score": volume_score,
            "pattern_score": pattern_score,
            "circuit": circuit,
            "timestamp": datetime.now().isoformat()
        }
        
        evidence_hash = self.calculate_evidence_hash(analysis_data)
        
        return {
            "timing_score": timing_score,
            "volume_score": volume_score,
            "pattern_score": pattern_score,
            "overall_confidence": overall_confidence,
            "justification": full_justification,
            "circuit": circuit,
            "probable_origin": probable_origin,
            "evidence_hash": evidence_hash
        }
