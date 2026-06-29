import React, { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api/client";
import { Trash2, Plus, Target, Server } from "lucide-react";

export function Targets() {
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTarget, setNewTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTargets();
  }, []);

  async function fetchTargets() {
    try {
      const res = await authFetch(`${API_URL}/targets`);
      if (res.ok) {
        const data = await res.json();
        setTargets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim()) return;
    setSubmitting(true);
    
    try {
      const res = await authFetch(`${API_URL}/targets`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ value: newTarget.trim() })
      });
      if (res.ok) {
        setNewTarget("");
        fetchTargets();
      } else {
        alert("Failed to add target.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    
    try {
      const res = await authFetch(`${API_URL}/targets/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchTargets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
          Asset Management
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Manage and verify the ownership of targets prior to scanning. Only authorized domains and IPs are permitted.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-aegis-accent" /> Add New Asset
        </h3>
        <form onSubmit={handleAddTarget} className="mt-4 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="flex-1 rounded-xl border-0 py-3 pl-4 text-slate-900 ring-1 ring-inset ring-slate-200/60 bg-white/50 backdrop-blur-md placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-aegis-accent shadow-inner transition-all"
            placeholder="e.g. example.com or 192.168.1.10"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newTarget.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aegis-accent to-blue-600 px-6 py-3 font-bold text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Add Asset
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden p-1">
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50 backdrop-blur-sm">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Asset Value</th>
              <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Added On</th>
              <th className="relative py-4 pl-3 pr-6 text-right font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-md">
            {loading ? (
              <tr><td colSpan={4} className="py-16 text-center text-sm font-medium text-slate-500">Loading assets...</td></tr>
            ) : targets.length === 0 ? (
              <tr><td colSpan={4} className="py-16 text-center text-sm font-medium text-slate-500">No assets managed yet.</td></tr>
            ) : (
              targets.map(target => (
                <tr key={target.id} className="hover:bg-white/60 transition-colors duration-200">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 font-bold text-slate-900 flex items-center gap-3">
                    <Server className="h-5 w-5 text-slate-400" />
                    {target.value}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-sm">
                      {target.target_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-600">
                    {new Date(target.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
                    <button onClick={() => handleDelete(target.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
