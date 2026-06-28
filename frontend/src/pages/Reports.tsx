import React, { useEffect, useState } from "react";
import { API_URL, loginOrRegisterAuto } from "../api/client";

export function Reports() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        let token = localStorage.getItem("aegis_access_token");
        if (!token) token = await loginOrRegisterAuto();

        const res = await fetch(`${API_URL}/scans`, {
          headers: { Authorization: `Bearer ${token}` }
        });

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

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold">Scan Reports & History</h1>
        <p className="text-sm text-slate-600">Review historical scan results.</p>
      </header>
      
      <div className="p-6">
        <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4">Target</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Risk Score</th>
                <th scope="col" className="px-6 py-4">Started At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : scans.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No scans found.</td></tr>
              ) : (
                scans.map((scan) => (
                  <tr key={scan.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{scan.target?.value || `Scan #${scan.id}`}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        scan.status === 'completed' ? 'bg-green-100 text-green-700' :
                        scan.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        scan.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{scan.risk_score !== null ? scan.risk_score : '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(scan.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
