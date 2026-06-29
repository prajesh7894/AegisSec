from pydantic import BaseModel


class TrendPoint(BaseModel):
    date: str
    risk_score: int

class DashboardStats(BaseModel):
    total_scans: int
    running_scans: int
    completed_scans: int
    failed_scans: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    low_findings: int
    historical_trend: list[TrendPoint] = []

