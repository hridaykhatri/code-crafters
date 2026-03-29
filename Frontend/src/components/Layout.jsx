import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, CheckSquare, Users, Settings, BarChart3, LogOut, ChevronLeft, Menu, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
       ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/6'}`}>
      {({ isActive }) => (
        <>
          {isActive && <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl bg-indigo-500/15 border border-indigo-500/20" transition={{ type:'spring', bounce:0.2, duration:0.4 }} />}
          <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
          {!collapsed && <span className="text-sm font-medium relative z-10">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate   = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const adminLinks    = [
    { to:'/dashboard',             icon:LayoutDashboard, label:'Dashboard' },
    { to:'/admin/users',           icon:Users,           label:'User Management' },
    { to:'/admin/approval-config', icon:Settings,        label:'Approval Config' },
    { to:'/analytics',             icon:BarChart3,       label:'Analytics' },
  ];
  const managerLinks  = [
    { to:'/dashboard', icon:LayoutDashboard, label:'Dashboard' },
    { to:'/approvals', icon:CheckSquare,     label:'Approval Queue' },
    { to:'/analytics', icon:BarChart3,       label:'Analytics' },
  ];
  const employeeLinks = [
    { to:'/dashboard',    icon:LayoutDashboard, label:'Dashboard' },
    { to:'/expenses/new', icon:Receipt,         label:'Submit Expense' },
    { to:'/expenses',     icon:CheckSquare,     label:'My Expenses' },
  ];

  const links = isAdmin ? adminLinks : isManager ? managerLinks : employeeLinks;
  const roleLabel = { admin:'Admin', manager:'Manager', director:'Director', vp_finance:'VP Finance', employee:'Employee' }[user?.role] || '';
  const roleColor = isAdmin ? 'text-amber-400' : isManager ? 'text-sky-400' : 'text-emerald-400';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <motion.aside animate={{ width: collapsed ? 72 : 240 }} transition={{ duration:0.3, ease:'easeInOut' }}
        className="flex-shrink-0 flex flex-col h-full overflow-hidden"
        style={{ background:'linear-gradient(180deg,#0F172A 0%,#0F1729 100%)' }}>

        <div className="flex items-center justify-between p-4 border-b border-white/5 min-h-[64px]">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-[15px]">ReimburseFlow</span>
              </div>
              <button onClick={() => setCollapsed(true)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="w-full flex justify-center p-2.5 text-slate-400 hover:text-slate-200 hover:bg-white/6 rounded-xl transition-all mb-2">
              <Menu className="w-5 h-5" />
            </button>
          )}
          {links.map(l => <NavItem key={l.to} {...l} collapsed={collapsed} />)}
        </nav>

        <div className="p-3 border-t border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-300 text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-slate-200 text-sm font-semibold truncate">{user?.name}</p>
                <p className={`text-xs font-medium ${roleColor}`}>{roleLabel}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed?'justify-center':''}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <span className="text-indigo-700 text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div key={location.pathname} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} className="p-8 min-h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}