import React, { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api/client";
import { Download } from "lucide-react";

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

  if (loading) {
    return <div className="p-4">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Scan Reports
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          History of all vulnerability assessments and their generated reports.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-300">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Scan Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Target</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Risk Score</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Date</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {scans.map((scan) => (
              <tr key={scan.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{scan.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{scan.target_id}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    scan.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                    scan.status === 'failed' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                  }`}>
                    {scan.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {scan.status === 'completed' ? scan.risk_score : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {new Date(scan.created_at).toLocaleDateString()}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  {scan.status === 'completed' && (
                    <button 
                      onClick={() => handleDownloadPdf(scan.id)}
                      className="inline-flex items-center gap-x-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {scans.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  No scan reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
