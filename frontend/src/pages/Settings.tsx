import React from "react";

export function Settings() {
  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-600">Configure your platform preferences.</p>
      </header>
      
      <div className="p-6">
        <div className="rounded-md border border-slate-200 bg-white p-6 max-w-2xl">
          <h2 className="text-lg font-medium mb-4">Scanner Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nmap Path</label>
              <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="/usr/bin/nmap" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nikto API Key</label>
              <input type="password" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="********" />
            </div>
            <button className="mt-4 rounded-md bg-aegis-ink px-4 py-2 text-sm font-medium text-white">Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
}
