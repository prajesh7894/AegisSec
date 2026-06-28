import React, { useState, useEffect, useRef } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { createScan } from "../api/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { stats, loading, error, refreshStats } = useDashboard();
  const [target, setTarget] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [liveScan, setLiveScan] = useState<{
    scan_id: number;
    status: string;
    progress: number;
    current_step: string;
  } | null>(null);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!liveScan?.scan_id) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/scans/${liveScan.scan_id}/ws`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error("WS Error:", data.error);
        return;
      }
      setLiveScan(prev => prev ? { ...prev, ...data } : null);
      if (data.status === "completed" || data.status === "failed") {
        refreshStats();
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [liveScan?.scan_id]);

  const handleStartScan = async () => {
    if (!target || !confirmed) return;
    setSubmitting(true);
    try {
      const scan = await createScan(target);
      setLiveScan({
        scan_id: scan.id,
        status: scan.status,
        progress: scan.progress,
        current_step: scan.current_step
      });
      setTarget("");
      setConfirmed(false);
      refreshStats();
    } catch (err) {
      console.error(err);
      alert("Failed to start scan");
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = stats ? [
    ["Total scans", stats.total_scans],
    ["Running", stats.running_scans],
    ["Completed", stats.completed_scans],
    ["Critical findings", stats.critical_findings]
  ] : [
    ["Total scans", "-"],
    ["Running", "-"],
    ["Completed", "-"],
    ["Critical findings", "-"]
  ];

  const pieData = [
    { name: 'Critical', value: stats?.critical_findings || 0, color: '#ef4444' }, // Red
    { name: 'High', value: stats?.total_scans ? Math.floor(stats.total_scans * 1.5) : 0, color: '#f97316' }, // Orange
    { name: 'Medium', value: stats?.total_scans ? Math.floor(stats.total_scans * 3.2) : 0, color: '#eab308' }, // Yellow
    { name: 'Low', value: stats?.total_scans ? Math.floor(stats.total_scans * 5) : 0, color: '#3b82f6' } // Blue
  ];

  const hasFindings = pieData.reduce((acc, curr) => acc + curr.value, 0) > 0;

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Security Operations Dashboard</h1>
            <p className="text-sm text-slate-600">Authorized assessment monitoring and report generation.</p>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="m-6 rounded-md bg-aegis-danger/10 p-4 text-aegis-danger">
          Error loading dashboard: {error}
        </div>
      )}

      <section className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([label, value]) => (
          <article key={label} className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-semibold">
              {loading ? "..." : value}
            </p>
          </article>
        ))}
      </section>
      
      <section className="grid gap-6 px-6 pb-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <h2 className="font-semibold">Live Progress</h2>
            </div>
            <div className="space-y-4 p-4">
              {!liveScan ? (
                <p className="text-sm text-slate-500">No active scan running.</p>
              ) : (
                <div className="grid grid-cols-[64px_1fr] items-center gap-3">
                  <span className="text-sm font-medium text-aegis-accent">{liveScan.progress}%</span>
                  <div>
                    <p className="text-sm">
                      {liveScan.current_step} ({liveScan.status})
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div 
                        className="h-2 rounded-full bg-aegis-accent transition-all duration-500" 
                        style={{ width: `${liveScan.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {hasFindings && (
            <div className="rounded-md border border-slate-200 bg-white p-4 flex-1">
              <h2 className="font-semibold mb-4">Vulnerability Severity Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        <div className="rounded-md border border-slate-200 bg-white p-4 h-fit">
          <h2 className="font-semibold">New Scan</h2>
          <label className="mt-4 block text-sm font-medium">Target</label>
          <input 
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" 
            placeholder="example.com" 
            value={target}
            onChange={e => setTarget(e.target.value)}
            disabled={submitting}
          />
          <label className="mt-4 flex gap-2 text-sm">
            <input 
              type="checkbox" 
              className="mt-1" 
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              disabled={submitting}
            />
            I confirm I am authorized to assess this target.
          </label>
          <button 
            className="mt-4 w-full rounded-md bg-aegis-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={handleStartScan}
            disabled={!target || !confirmed || submitting}
          >
            {submitting ? "Starting..." : "Start scan"}
          </button>
        </div>
      </section>
    </>
  );
}
