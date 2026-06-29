import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Target, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Assets & Targets", href: "/targets", icon: Target },
    { name: "Scan Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-mesh-light font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col glass-panel border-r border-white/50 z-10">
        <div className="flex h-20 items-center gap-3 border-b border-white/40 px-6 mt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aegis-accent to-blue-600 shadow-md">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">AegisSec</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-white/80 text-aegis-accent shadow-sm border border-white/60"
                      : "text-slate-600 hover:bg-white/50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? "text-aegis-accent" : "text-slate-400 group-hover:text-aegis-accent"
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-aegis-accent shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/40 p-4 mb-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/40 p-3 backdrop-blur-sm border border-white/50 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aegis-accentLight to-blue-200 text-sm font-bold text-aegis-accent shadow-inner">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{user?.full_name}</span>
              <span className="text-xs font-medium text-slate-500 capitalize">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="mx-auto max-w-7xl px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
