import React, { useState, useEffect, useRef } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { createScan, API_URL } from "../api/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

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
    
    const baseUrl = API_URL.startsWith("http") 
      ? API_URL.replace(/^http/, "ws") 
      : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${API_URL}`;
    
    const wsUrl = `${baseUrl}/scans/${liveScan.scan_id}/ws`;
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
    ["Total scans", stats.total_scans, Target, "text-blue-500", "bg-blue-50 border-blue-100"],
    ["Running", stats.running_scans, Activity, "text-amber-500", "bg-amber-50 border-amber-100"],
    ["Completed", stats.completed_scans, CheckCircle2, "text-emerald-500", "bg-emerald-50 border-emerald-100"],
    ["Critical findings", stats.critical_findings, AlertTriangle, "text-red-500", "bg-red-50 border-red-100"]
  ] : [
    ["Total scans", "-", Target, "text-slate-400", "bg-slate-50 border-slate-100"],
    ["Running", "-", Activity, "text-slate-400", "bg-slate-50 border-slate-100"],
    ["Completed", "-", CheckCircle2, "text-slate-400", "bg-slate-50 border-slate-100"],
    ["Critical findings", "-", AlertTriangle, "text-slate-400", "bg-slate-50 border-slate-100"]
  ];

  const pieData = [
    { name: 'Critical', value: stats?.critical_findings || 0, color: '#ef4444' },
    { name: 'High', value: stats?.high_findings || 0, color: '#f97316' },
    { name: 'Medium', value: stats?.medium_findings || 0, color: '#eab308' },
    { name: 'Low', value: stats?.low_findings || 0, color: '#3b82f6' }
  ];

  const hasFindings = pieData.reduce((acc, curr) => acc + curr.value, 0) > 0;
  const trendData = (stats as any)?.historical_trend || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          Security Operations Dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Real-time visibility into your organization's attack surface and live scan operations.
        </p>
      </div>
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 backdrop-blur p-4 text-sm font-semibold text-red-700 shadow-sm">
          Error loading dashboard: {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([label, value, Icon, iconColor, bgClass]) => (
          <article key={label as string} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150 ${(bgClass as string).split(' ')[0]}`}></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label as string}</p>
                <p className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
                  {loading ? "..." : value as string|number}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${(bgClass as string)} shadow-inner`}>
                {/* @ts-ignore */}
                <Icon className={`h-6 w-6 ${iconColor as string}`} />
              </div>
            </div>
          </article>
        ))}
      </section>
      
      <section className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="border-b border-slate-200/50 bg-white/40 px-6 py-5 backdrop-blur-sm">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-aegis-accent" /> Live Progress Tracker
              </h2>
            </div>
            <div className="p-8">
              {!liveScan ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No active scans running</p>
                  <p className="text-xs text-slate-400 mt-1">Initiate a new scan to see real-time progress.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[80px_1fr] items-center gap-6">
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-inner">
                    <span className="text-2xl font-black text-aegis-accent">{liveScan.progress}%</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-sm font-bold text-slate-900">
                        {liveScan.current_step}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 animate-pulse uppercase tracking-wider">
                        {liveScan.status}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 shadow-inner overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-aegis-accent to-blue-500 transition-all duration-700 ease-out" 
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
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="font-bold text-slate-900 mb-6">Severity Distribution</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {trendData.length > 0 && (
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="font-bold text-slate-900 mb-6">Historical Risk Trend</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="risk_score" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-fit glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aegis-accent to-blue-600"></div>
          <h2 className="font-bold text-slate-900 text-lg">Initiate New Scan</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Launch an authorized vulnerability assessment against a verified target.</p>
          
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Target Asset</label>
          <input 
            className="mt-2 w-full rounded-xl border-0 py-3 pl-4 text-slate-900 ring-1 ring-inset ring-slate-200/60 bg-white/50 backdrop-blur-sm placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-aegis-accent shadow-inner transition-all" 
            placeholder="example.com or 192.168.1.x" 
            value={target}
            onChange={e => setTarget(e.target.value)}
            disabled={submitting}
          />
          
          <label className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50/50 p-4 border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-aegis-accent focus:ring-aegis-accent transition-all cursor-pointer" 
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              disabled={submitting}
            />
            <span className="text-sm text-slate-600 leading-tight">
              I explicitly confirm that I am authorized to perform security assessments against this target.
            </span>
          </label>
          
          <button 
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3.5 text-sm font-bold text-white transition-all hover:from-slate-800 hover:to-slate-700 shadow-md hover:shadow-lg disabled:opacity-50"
            onClick={handleStartScan}
            disabled={!target || !confirmed || submitting}
          >
            {submitting ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Initializing Engine...</>
            ) : (
              <><Target className="h-4 w-4" /> Start Vulnerability Scan</>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
