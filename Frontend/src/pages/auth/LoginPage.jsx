import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: Zap,      title: 'Instant Submission',    desc: 'Submit expenses in seconds' },
  { icon: Shield,   title: 'Multi-level Approvals', desc: 'Manager → Director → VP Finance' },
  { icon: Sparkles, title: 'Smart Analytics',       desc: 'Real-time spend insights' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();

  const [mode, setMode]       = useState('login');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', email: '', password: '', department: '' });

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup({ name: form.name, email: form.email, department: form.department });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">
      {/* LEFT */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 40%, #7C3AED 80%, #9333EA 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #A78BFA, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #38BDF8, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">ReimburseFlow</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <p className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-4">Enterprise Expense Management</p>
          <h1 className="text-white font-extrabold leading-tight mb-6 text-5xl">
            Expense reports<br />
            <span style={{ background: 'linear-gradient(90deg,#A5F3FC,#E9D5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              that don't suck.
            </span>
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
            Submit claims, track approvals in real-time, and get reimbursed faster.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/8 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-indigo-200 text-xs">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 relative">
        <div className="absolute inset-0 opacity-40"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #EDE9FE, transparent 50%), radial-gradient(circle at 80% 20%, #E0F2FE, transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">ReimburseFlow</span>
            </div>

            <div className="flex bg-slate-100 rounded-2xl p-1 mb-8 gap-1">
              {['login','signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode===m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.25 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{mode==='login' ? 'Welcome back' : 'Get started'}</h2>
                  <p className="text-slate-500 text-sm mt-1">{mode==='login' ? 'Sign in to your workspace' : 'Create your account'}</p>
                </div>

                {mode === 'login' && (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
                    <p className="font-semibold mb-1">Demo credentials:</p>
                    <p>employee@demo.com · manager@demo.com · director@demo.com</p>
                    <p>vp@demo.com · admin@demo.com — all use password: <strong>demo123</strong></p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                        className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {mode === 'signup' && (
                    <>
                      <Field label="Full Name"   type="text"  value={form.name}       onChange={set('name')}       placeholder="Jane Smith"    />
                      <Field label="Department"  type="text"  value={form.department} onChange={set('department')} placeholder="Engineering"    />
                    </>
                  )}
                  <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPw?'text':'password'} value={form.password} onChange={set('password')}
                        placeholder="••••••••" required
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
                      <button type="button" onClick={() => setShowPw(p=>!p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    className="w-full py-3.5 mt-2 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      : <>{mode==='login'?'Sign In':'Create Account'}<ArrowRight className="w-4 h-4"/></>}
                  </motion.button>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="text-center text-slate-400 text-xs mt-4">© 2026 ReimburseFlow · Hackathon Edition</p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input {...props} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
    </div>
  );
}