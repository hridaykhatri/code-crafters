import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, name: 'Alice Manager',   email: 'manager@demo.com',  password: 'demo123', role: 'manager',    department: 'Engineering' },
  { id: 2, name: 'Bob Employee',    email: 'employee@demo.com', password: 'demo123', role: 'employee',   department: 'Engineering' },
  { id: 3, name: 'Carol Director',  email: 'director@demo.com', password: 'demo123', role: 'director',   department: 'Finance' },
  { id: 4, name: 'Dave VP Finance', email: 'vp@demo.com',       password: 'demo123', role: 'vp_finance', department: 'Finance' },
  { id: 5, name: 'Eve Admin',       email: 'admin@demo.com',    password: 'demo123', role: 'admin',      department: 'IT' },
];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rf_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = found;
    localStorage.setItem('rf_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  };

  const signup = async ({ name, email, department = 'General' }) => {
    const newUser = { id: Date.now(), name, email, department, role: 'employee' };
    localStorage.setItem('rf_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => { localStorage.removeItem('rf_user'); setUser(null); };

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout,
      isAdmin:    user?.role === 'admin',
      isManager:  ['manager','director','vp_finance'].includes(user?.role),
      isEmployee: user?.role === 'employee',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};