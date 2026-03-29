import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage     from './pages/auth/LoginPage';
import Layout        from './components/Layout';
import SubmitExpense from './pages/employee/SubmitExpense';
import ApprovalQueue from './pages/manager/ApprovalQueue';

function ComingSoon({ title, emoji }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl mb-4">{emoji}</div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">Coming up next...</p>
      </div>
    </div>
  );
}

const Dashboard  = () => <ComingSoon title="Dashboard"       emoji="📊" />;
const MyExpenses = () => <ComingSoon title="My Expenses"     emoji="🧾" />;
const UserMgmt   = () => <ComingSoon title="User Management" emoji="👥" />;
const ApprConfig = () => <ComingSoon title="Approval Config" emoji="⚙️" />;
const Analytics  = () => <ComingSoon title="Analytics"       emoji="📈" />;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"             element={<Dashboard />} />
        <Route path="expenses"              element={<MyExpenses />} />
        <Route path="expenses/new"          element={<SubmitExpense />} />
        <Route path="approvals"             element={
          <RoleRoute roles={['manager','director','vp_finance','admin']}>
            <ApprovalQueue />
          </RoleRoute>
        } />
        <Route path="admin/users"           element={<RoleRoute roles={['admin']}><UserMgmt /></RoleRoute>} />
        <Route path="admin/approval-config" element={<RoleRoute roles={['admin']}><ApprConfig /></RoleRoute>} />
        <Route path="analytics"             element={
          <RoleRoute roles={['admin','manager','director','vp_finance']}>
            <Analytics />
          </RoleRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
