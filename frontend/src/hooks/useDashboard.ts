import { useState, useEffect } from "react";
import { fetchDashboardStats, loginOrRegisterAuto } from "../api/client";

export function useDashboard() {
  const [stats, setStats] = useState<{
    total_scans: number;
    running_scans: number;
    completed_scans: number;
    failed_scans: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
    low_findings: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        await loginOrRegisterAuto();
        if (mounted) await refreshStats();
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, error, refreshStats };
}
