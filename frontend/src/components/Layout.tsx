import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, FileText, LayoutDashboard, PlusCircle, Settings, Shield, UserCog } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-aegis-panel text-aegis-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <Shield className="h-6 w-6 text-aegis-accent" />
          AegisSec
        </div>
        <nav className="mt-8 space-y-1 text-sm">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link 
              key={label} 
              to={path}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-slate-100 ${
                location.pathname === path ? "bg-slate-100 font-medium text-aegis-accent" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:ml-64">
        {children}
      </main>
    </div>
  );
}
