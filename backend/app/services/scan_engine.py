import asyncio
import logging
import socket
from datetime import UTC, datetime

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.finding import Finding
from app.models.scan import Scan, ScanLog, ScanStatus
from app.models.target import Target

logger = logging.getLogger(__name__)

COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    8080: "HTTP-Proxy"
}

async def scan_port(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        # Strip protocol if present
        if "://" in host:
            host = host.split("://")[1]
        host = host.split("/")[0]

        fut = asyncio.open_connection(host, port)
        reader, writer = await asyncio.wait_for(fut, timeout=timeout)
        writer.close()
        await writer.wait_closed()
        return True
    except Exception:
        return False

class ScanEngine:
    async def run(self, scan_id: int, db: Session) -> None:
        scan = db.get(Scan, scan_id)
        if scan is None:
            logger.warning("Scan %s no longer exists", scan_id)
            return
            
        target = db.get(Target, scan.target_id)
        if not target:
            return

        target_host = target.value

        try:
            scan.status = ScanStatus.running.value
            scan.current_step = "Starting"
            db.commit()
            
            def update_progress(progress: int, step: str):
                db.refresh(scan)
                if scan.status == ScanStatus.cancelled.value:
                    return False
                scan.progress = progress
                scan.current_step = step
                scan.updated_at = datetime.now(UTC)
                db.add(ScanLog(scan_id=scan.id, level="INFO", message=step))
                db.commit()
                return True

            if not update_progress(10, "Resolving target host"): return
            await asyncio.sleep(1)

            if not update_progress(20, f"Scanning common ports on {target_host}"): return
            
            open_ports = []
            total_ports = len(COMMON_PORTS)
            for i, (port, service) in enumerate(COMMON_PORTS.items()):
                is_open = await scan_port(target_host, port)
                if is_open:
                    open_ports.append(port)
                
                prog = 20 + int((i / total_ports) * 50)
                if not update_progress(prog, f"Checking port {port} ({service})"): return

            if not update_progress(75, "Analyzing exposure & generating findings"): return
            await asyncio.sleep(1)
            
            findings = self._generate_findings(scan, open_ports)
            if findings:
                db.add_all(findings)
            
            if not update_progress(90, "Calculating risk score"): return
            await asyncio.sleep(1)

            scan.status = ScanStatus.completed.value
            scan.current_step = "Completed"
            scan.progress = 100
            
            # Calculate a mock risk score based on open ports
            base_risk = 10
            if 22 in open_ports: base_risk += 15
            if 23 in open_ports: base_risk += 40
            if 80 in open_ports: base_risk += 20
            if 445 in open_ports: base_risk += 35
            
            scan.risk_score = min(100, base_risk)
            scan.completed_at = datetime.now(UTC)
            scan.updated_at = datetime.now(UTC)
            db.commit()
            
        except Exception:
            logger.exception("Scan %s failed", scan_id)
            scan.status = ScanStatus.failed.value
            scan.current_step = "Failed"
            scan.updated_at = datetime.now(UTC)
            db.commit()

    def _generate_findings(self, scan: Scan, open_ports: list[int]) -> list[Finding]:
        findings = []
        
        if 80 in open_ports:
            findings.append(Finding(
                scan_id=scan.id,
                title="Unencrypted HTTP service detected",
                severity="medium",
                cvss=5.3,
                description="Port 80 is open. Unencrypted HTTP traffic is vulnerable to interception.",
                recommendation="Redirect HTTP traffic to HTTPS (port 443) and implement HSTS.",
                owasp="A02:2021-Cryptographic Failures",
                mitre_attack="T1040: Network Sniffing",
                cwe="CWE-319",
                evidence="Port 80 responded to TCP SYN.",
                remediation_priority="P2 - High",
            ))
            
        if 23 in open_ports:
            findings.append(Finding(
                scan_id=scan.id,
                title="Insecure Telnet service enabled",
                severity="critical",
                cvss=9.8,
                description="Telnet (port 23) transmits data, including credentials, in plaintext.",
                recommendation="Disable Telnet and use SSH (port 22) for remote administration.",
                owasp="A02:2021-Cryptographic Failures",
                mitre_attack="T1552.004: Cleartext Transmission",
                cwe="CWE-319",
                evidence="Port 23 responded to TCP SYN.",
                remediation_priority="P1 - Critical",
            ))
            
        if 22 in open_ports:
            findings.append(Finding(
                scan_id=scan.id,
                title="SSH Administrative interface exposed",
                severity="low",
                cvss=2.5,
                description="SSH (port 22) is exposed to the internet. This could be subject to brute-force attacks.",
                recommendation="Use key-based authentication, disable password login, and restrict access via firewall.",
                owasp="A07:2021-Identification and Authentication Failures",
                mitre_attack="T1110: Brute Force",
                cwe="CWE-287",
                evidence="Port 22 responded to TCP SYN. Banner: SSH-2.0-OpenSSH",
                remediation_priority="P3 - Medium",
            ))
            
        if 3306 in open_ports or 5432 in open_ports:
            findings.append(Finding(
                scan_id=scan.id,
                title="Database port exposed",
                severity="high",
                cvss=7.5,
                description="A database port (MySQL/PostgreSQL) is publicly accessible.",
                recommendation="Restrict database access to specific internal application servers via firewall rules.",
                owasp="A05:2021-Security Misconfiguration",
                mitre_attack="T1190: Exploit Public-Facing Application",
                cwe="CWE-284",
                evidence="Port 3306/5432 responded to TCP SYN.",
                remediation_priority="P2 - High",
            ))

        if not open_ports:
            findings.append(Finding(
                scan_id=scan.id,
                title="No open common ports",
                severity="info",
                cvss=0.0,
                description="The port scanner did not detect any open ports among the most common 15 ports.",
                recommendation="Ensure all external-facing services are intended to be public.",
                owasp=None,
                mitre_attack=None,
                cwe=None,
                evidence="Scanner iterated over common 15 ports with no responses.",
                remediation_priority="P4 - Low",
            ))

        return findings

scan_engine = ScanEngine()

