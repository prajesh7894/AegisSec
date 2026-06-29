import React, { useEffect, useState } from "react";
import { API_URL } from "../api/client";
import { Trash2, Plus } from "lucide-react";

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
      let token = localStorage.getItem("aegis_access_token");
      const res = await fetch(`${API_URL}/targets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      let token = localStorage.getItem("aegis_access_token");
      const res = await fetch(`${API_URL}/targets`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
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
      let token = localStorage.getItem("aegis_access_token");
      const res = await fetch(`${API_URL}/targets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTargets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Asset Management
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage and verify the ownership of targets prior to scanning.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium">Add New Asset</h3>
        <form onSubmit={handleAddTarget} className="mt-4 flex gap-4">
          <input
            type="text"
            className="flex-1 rounded-md border border-slate-300 px-4 py-2"
            placeholder="example.com or 192.168.1.10"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newTarget.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-aegis-accent px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Add Asset
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-300">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">Asset Value</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Type</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Added On</th>
              <th className="relative py-3.5 pl-3 pr-6 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500">Loading...</td></tr>
            ) : targets.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500">No assets managed yet.</td></tr>
            ) : (
              targets.map(target => (
                <tr key={target.id}>
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 font-medium text-slate-900">{target.value}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {target.target_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                    {new Date(target.created_at).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
                    <button onClick={() => handleDelete(target.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5 inline" />
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
