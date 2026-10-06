import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext.jsx';
import logoImg from '../assets/logo.png';
import { 
  LayoutDashboard, 
  Home, 
  Map, 
  Sprout, 
  BrainCircuit, 
  ScanLine, 
  CloudSun, 
  Award, 
  Bug, 
  Warehouse, 
  Coins, 
  BellRing, 
  LogOut, 
  User, 
  Menu, 
  X,
  Wrench
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard/home', icon: Home },
    { name: 'My Farms', href: '/dashboard/my-farms', icon: Map },
    { name: 'Crop Catalog', href: '/dashboard/crops', icon: Sprout },
    { name: 'AI Crop Planner', href: '/dashboard/crop-advisor', icon: BrainCircuit },
    { name: 'Disease & Pest Scanner', href: '/dashboard/disease', icon: ScanLine },
    { name: 'Weather Forecast', href: '/dashboard/weather', icon: CloudSun },
    { name: 'Fertilizer Planner', href: '/dashboard/fertilizer', icon: Award },
    { name: 'Harvest & Storage Planner', href: '/dashboard/storage', icon: Warehouse },
    { name: 'Market Prices', href: '/dashboard/market', icon: Coins },
    { name: 'Equipment Rental', href: '/dashboard/equipment-rental', icon: Wrench },
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <Menu size={20} />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="KrishiSakhi Logo" className="h-9 w-9 rounded-lg object-cover shadow-md shadow-green-150" />
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Krishi<span className="text-green-600">Sakhi</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <BellRing size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                  <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                  {unreadCount > 0 && <span className="text-xs text-green-600 font-medium">{unreadCount} New</span>}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-400">No alerts today</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer text-left transition ${
                          !notif.is_read ? 'bg-green-50/40' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className={`text-xs font-semibold ${!notif.is_read ? 'text-green-800' : 'text-slate-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && <span className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1 flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="hidden text-right md:block">
              <p className="text-xs font-bold text-slate-800">{user?.full_name || 'Farmer Account'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Farmer'}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold shadow-inner">
              {user?.full_name?.charAt(0) || <User size={16} />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex flex-col overflow-y-auto flex-shrink-0">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive 
                      ? 'bg-green-600 text-white font-semibold shadow-md shadow-green-100' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            
            <aside className="fixed bottom-0 top-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white p-4 shadow-2xl z-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <span className="text-lg font-bold text-slate-800">Navigation</span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
                {navigation.map(item => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive 
                          ? 'bg-green-600 text-white font-semibold shadow-md' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </aside>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
