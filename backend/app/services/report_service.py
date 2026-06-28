import json

from app.models.scan import Scan


def build_json_report(scan: Scan) -> str:
    payload = {
        "executive_summary": f"Assessment for {scan.name} completed with risk score {scan.risk_score}.",
        "risk_rating": scan.risk_score,
        "finding_summary": [
            {"title": finding.title, "severity": finding.severity, "cvss": finding.cvss}
            for finding in scan.findings
        ],
        "technical_details": [
            {
                "title": finding.title,
                "description": finding.description,
                "recommendation": finding.recommendation,
            }
            for finding in scan.findings
        ],
        "appendix": {"platform": "AegisSec", "authorized_use_only": True},
    }
    return json.dumps(payload, indent=2)


def build_html_report(scan: Scan) -> str:
    findings = "".join(
        f"<li><strong>{finding.severity.upper()}</strong>: {finding.title} - {finding.recommendation}</li>"
        for finding in scan.findings
    )
    return (
        "<html><body>"
        f"<h1>AegisSec Report: {scan.name}</h1>"
        f"<h2>Executive Summary</h2><p>Risk score: {scan.risk_score}</p>"
        f"<h2>Finding Summary</h2><ul>{findings}</ul>"
        "<h2>Recommendations</h2><p>Prioritize remediation by severity and exposure.</p>"
        "<h2>Appendix</h2><p>Authorized security assessment report.</p>"
        "</body></html>"
    )

