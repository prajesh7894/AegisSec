import React, { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api/client";
import { Download, FileWarning, Search, ShieldAlert } from "lucide-react";

export function Reports() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        const res = await authFetch(`${API_URL}/scans`);
        if (res.ok) {
          const data = await res.json();
          setScans(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, []);

  const handleDownloadPdf = async (scanId: number) => {
    try {
      const res = await authFetch(`${API_URL}/reports/${scanId}/pdf`);
      if (!res.ok) throw new Error("Failed to download PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aegissec_report_${scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Could not download report. Ensure the scan is completed.");
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-100 ring-red-500/30";
    if (score >= 40) return "text-amber-600 bg-amber-100 ring-amber-500/30";
    return "text-emerald-600 bg-emerald-100 ring-emerald-500/30";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-aegis-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Scan Reports
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            A comprehensive history of all vulnerability assessments. Review findings, analyze risk scores, and download executive summaries.
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search reports..."
            className="block w-full sm:w-64 rounded-xl border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-white/60 bg-white/40 backdrop-blur-md placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-aegis-accent shadow-sm sm:text-sm sm:leading-6 transition-all"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden p-1">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50 backdrop-blur-sm">
            <tr>
              <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Scan Details</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Target</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Risk Score</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
              <th scope="col" className="relative py-4 pl-3 pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-md">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-white/60 transition-colors duration-200">
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 shadow-sm">
                      <ShieldAlert className="h-5 w-5 text-aegis-accent" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{scan.name}</div>
                      <div className="text-xs text-slate-500 font-medium">ID: #{scan.id}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-700">
                  {scan.target_id || "System Default"}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset shadow-sm ${
                    scan.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/30' : 
                    scan.status === 'failed' ? 'bg-red-50 text-red-700 ring-red-500/30' :
                    'bg-amber-50 text-amber-700 ring-amber-500/30 animate-pulse'
                  }`}>
                    {scan.status === 'completed' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>}
                    {scan.status === 'failed' && <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>}
                    {scan.status === 'running' && <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>}
                    {scan.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {scan.status === 'completed' ? (
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-bold ring-1 ring-inset shadow-sm ${getRiskColor(scan.risk_score || 0)}`}>
                      {scan.risk_score || 0}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-400">--</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-600">
                  {new Date(scan.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  {scan.status === 'completed' && (
                    <button 
                      onClick={() => handleDownloadPdf(scan.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-aegis-accent shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-blue-700 hover:ring-slate-300 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aegis-accent"
                    >
                      <Download className="h-4 w-4" />
                      PDF Report
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {scans.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4 shadow-inner">
                    <FileWarning className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No reports found</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by running a new vulnerability scan.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
