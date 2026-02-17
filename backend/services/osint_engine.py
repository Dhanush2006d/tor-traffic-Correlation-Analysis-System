import whois
import dns.resolver
import socket
import re
import requests
from typing import Dict, Any, List

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class OSINTAnalyzer:
    def __init__(self):
        self.resolver = dns.resolver.Resolver()
        self.resolver.lifetime = 2.0  # Timeout for DNS
        self.resolver.timeout = 2.0
        
        # Configure Proxies for Tor (if available)
        # Assumes Tor is running on localhost:9050
        self.proxies = {
            'http': 'socks5h://127.0.0.1:9050',
            'https': 'socks5h://127.0.0.1:9050'
        }
        self.tor_available = self._check_tor()

    def _check_tor(self):
        """Simple check to see if Tor port is open"""
        import socket
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('127.0.0.1', 9050))
            sock.close()
            return result == 0
        except:
            return False

    def analyze_indicator(self, indicator: str) -> Dict[str, Any]:
        """
        Determines if input is IP, Domain, or URL and runs appropriate analysis.
        """
        try:
            indicator = indicator.strip()
            
            # Simple Regex for classification
            ip_pattern = r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
            onion_pattern = r"[a-z2-7]{16,56}\.onion"
            
            if re.match(ip_pattern, indicator):
                return self.analyze_ip(indicator)
            elif re.search(onion_pattern, indicator):
                 # It's an onion address
                 if not indicator.startswith("http"):
                     indicator = "http://" + indicator
                 return self.analyze_url(indicator, is_onion=True)
            elif indicator.startswith("http"):
                 return self.analyze_url(indicator)
            elif "." in indicator:
                return self.analyze_domain(indicator)
            else:
                return {"error": "Unknown indicator format"}
        except Exception as e:
            return {"error": f"Internal Analysis Error: {str(e)}"}

    def analyze_url(self, url: str, is_onion: bool = False) -> Dict[str, Any]:
        result = {
            "type": "Onion URL" if is_onion else "URL",
            "indicator": url,
            "scraped_data": None,
            "status": "pending"
        }
        
        try:
            # Use proxies if onion or if user prefers (forcing for onion)
            proxies = self.proxies if (is_onion or self.tor_available) else None
            if is_onion and not self.tor_available:
                return {"error": "Tor proxy (127.0.0.1:9050) not detected. Cannot scrape .onion URL."}

            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            # Disable verify=False to prevent SSL errors on bad sites
            resp = requests.get(url, proxies=proxies, headers=headers, timeout=15, verify=False)
            
            result["status"] = resp.status_code
            result["headers"] = dict(resp.headers)
            
            # Extract IOCs from body
            iocs = self.extract_iocs(resp.text)
            result["scraped_data"] = iocs
            
        except Exception as e:
            result["error"] = str(e)
            
        return result

    def analyze_ip(self, ip: str) -> Dict[str, Any]:
        result = {
            "type": "IP",
            "indicator": ip,
            "whois": {},
            "reverse_dns": None,
            "geolocation": "Unknown" 
        }
        
        # 1. Reverse DNS
        try:
            rev_name = socket.gethostbyaddr(ip)
            result["reverse_dns"] = rev_name[0]
        except:
            result["reverse_dns"] = "No PTR record"

        # 2. WHOIS
        try:
            w = whois.whois(ip)
            result["whois"] = {
                "registrar": w.registrar,
                "org": w.org,
                "country": w.country,
                "emails": w.emails
            }
        except Exception as e:
            result["whois_error"] = str(e)

        return result

    def analyze_domain(self, domain: str, original_url: str = None) -> Dict[str, Any]:
        result = {
            "type": "Domain",
            "indicator": domain,
            "dns_records": {},
            "whois": {},
            "subdomains": []
        }
        
        if original_url:
            result["original_url"] = original_url

        # 1. DNS Records
        record_types = ['A', 'MX', 'TXT', 'NS']
        for r_type in record_types:
            try:
                answers = self.resolver.resolve(domain, r_type)
                result["dns_records"][r_type] = [str(r) for r in answers]
            except:
                pass

        # 2. WHOIS
        try:
            w = whois.whois(domain)
            result["whois"] = {
                "registrar": w.registrar,
                "creation_date": str(w.creation_date),
                "expiration_date": str(w.expiration_date),
                "emails": w.emails
            }
        except Exception as e:
             result["whois_error"] = str(e)
             
        return result

    def extract_iocs(self, text: str) -> Dict[str, List[str]]:
        """
        Extracts potential IPs, Domains, and Onion addresses from raw text.
        """
        ip_pattern = r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'
        domain_pattern = r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}\b'
        onion_pattern = r'\b[a-z2-7]{16,56}\.onion\b'
        
        ips = list(set(re.findall(ip_pattern, text)))
        domains = list(set(re.findall(domain_pattern, text)))
        onions = list(set(re.findall(onion_pattern, text)))
        
        # Basic filter: Remove onions from domains list if regex overlapped
        domains = [d for d in domains if not d.endswith('.onion')]
        
        return {
            "ips": ips,
            "domains": domains,
            "onions": onions,
            "count": len(ips) + len(domains) + len(onions)
        }
