import React, { useState, useEffect, useRef } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { createScan } from "../api/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

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
    { name: 'High', value: stats?.high_findings || 0, color: '#f97316' }, // Orange
    { name: 'Medium', value: stats?.medium_findings || 0, color: '#eab308' }, // Yellow
    { name: 'Low', value: stats?.low_findings || 0, color: '#3b82f6' } // Blue
  ];

  const hasFindings = pieData.reduce((acc, curr) => acc + curr.value, 0) > 0;
  const trendData = stats?.historical_trend || [];

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Security Operations Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your organization's attack surface and risk posture.
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          Error loading dashboard: {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([label, value]) => (
          <article key={label} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : value}
            </p>
          </article>
        ))}
      </section>
      
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Live Progress</h2>
            </div>
            <div className="p-6">
              {!liveScan ? (
                <p className="text-sm text-slate-500">No active scan running.</p>
              ) : (
                <div className="grid grid-cols-[64px_1fr] items-center gap-4">
                  <span className="text-lg font-bold text-aegis-accent">{liveScan.progress}%</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {liveScan.current_step} <span className="text-slate-500">({liveScan.status})</span>
                    </p>
                    <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                      <div 
                        className="h-2.5 rounded-full bg-aegis-accent transition-all duration-500" 
                        style={{ width: `${liveScan.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {hasFindings && (
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-6">Severity Distribution</h2>
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

            {trendData.length > 0 && (
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-6">Historical Risk Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12}} />
                      <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="risk_score" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-fit rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">New Scan</h2>
          <label className="mt-6 block text-sm font-medium text-slate-700">Target</label>
          <input 
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-aegis-accent focus:outline-none focus:ring-1 focus:ring-aegis-accent" 
            placeholder="example.com" 
            value={target}
            onChange={e => setTarget(e.target.value)}
            disabled={submitting}
          />
          <label className="mt-4 flex gap-3 text-sm text-slate-600">
            <input 
              type="checkbox" 
              className="mt-1 flex-shrink-0" 
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              disabled={submitting}
            />
            <span>I confirm I am authorized to assess this target.</span>
          </label>
          <button 
            className="mt-6 w-full rounded-md bg-aegis-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            onClick={handleStartScan}
            disabled={!target || !confirmed || submitting}
          >
            {submitting ? "Starting..." : "Start scan"}
          </button>
        </div>
      </section>
    </div>
  );
}
