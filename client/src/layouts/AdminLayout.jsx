import React from 'react';
import { Link, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logoImg from '../assets/logo.png';
import { 
  ShieldAlert, 
  Users, 
  Map, 
  Sprout, 
  TrendingUp, 
  History, 
  Settings, 
  LogOut, 
  Home 
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route protection
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldAlert },
    { name: 'Farmers List', href: '/admin/users', icon: Users },
    { name: 'Farms Registry', href: '/admin/farms', icon: Map },
    { name: 'Crops Registry', href: '/admin/crops', icon: Sprout },
    { name: 'Mandi Management', href: '/admin/market', icon: TrendingUp },
    { name: 'System Logs', href: '/admin/analytics', icon: History },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-900 px-4 text-white shadow-sm md:px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="KrishiSakhi Admin Logo" className="h-9 w-9 rounded-lg object-cover shadow-md shadow-teal-700/50" />
          <span className="text-xl font-bold tracking-tight">
            KrishiSakhi <span className="text-teal-400">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/dashboard/home" className="text-xs text-slate-300 hover:text-white flex items-center gap-1">
            <Home size={14} /> Farmer View
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-semibold shadow-inner">
            A
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex flex-col overflow-y-auto flex-shrink-0">
          <nav className="flex flex-col gap-1 p-4">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Control Panel
            </div>
            {navItems.map(item => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive 
                      ? 'bg-teal-700 text-white font-semibold shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="mt-8 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
