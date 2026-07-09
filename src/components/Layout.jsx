import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, User, ArrowLeftRight, Activity } from 'lucide-react';
import { useEffect } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/compare', label: 'Team Comparison', icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── HEADER / NAVIGATION ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/60 px-8 py-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <Link to="/" className="flex items-center gap-3 w-1/4">
          <div className="p-2 bg-brand-500/10 border border-brand-500/30 rounded-xl hover:shadow-glow-orange transition-all duration-300">
            <Activity className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-extrabold text-base text-slate-900 tracking-wider leading-none uppercase">
              NBA Scout
            </h1>
            <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
              AI Analytics
            </span>
          </div>
        </Link>

        <nav className="flex items-center justify-center gap-8 w-1/2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`font-mono text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-brand-500 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {isActive ? `[ ${item.label} ]` : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="w-1/4"></div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 page-enter">
        <RoutesOutlet />
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-mono bg-white mt-auto">
        NBA Scout AI © 2026 • Basketball Tactical Analysis Powered by Machine Learning & AI
      </footer>
    </div>
  );
}

// Simple outlet wrapper to handle page structure in Layout.jsx
import { Outlet } from 'react-router-dom';
function RoutesOutlet() {
  return <Outlet />;
}
