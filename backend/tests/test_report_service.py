from app.models.finding import Finding
from app.models.scan import Scan
from app.services.report_service import build_json_report


def test_build_json_report_contains_required_sections() -> None:
    scan = Scan(id=1, owner_id=1, target_id=1, name="Demo Scan", risk_score=42)
    scan.findings = [
        Finding(
            title="Finding",
            severity="medium",
            cvss=5.0,
            description="Description",
            recommendation="Recommendation",
        )
    ]

    report = build_json_report(scan)

    assert "executive_summary" in report
    assert "technical_details" in report
    assert "authorized_use_only" in report

