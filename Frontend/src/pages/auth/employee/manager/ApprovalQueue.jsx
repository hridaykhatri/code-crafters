import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { claimsApi } from '../../services/api';

export default function ApprovalQueue() {
  const { user } = useAuth();
  const role = user?.role;

  const [claims, setClaims]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [comments, setComments] = useState({});
  const [deciding, setDeciding] = useState(null);
  const [error, setError]       = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await claimsApi.getPending(role);
      setClaims(data.pending_claims || []);
    } catch { setError('Failed to load queue.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, [role]);

  const decide = async (claimId, decision) => {
    setDeciding(`${claimId}-${decision}`);
    try {
      await claimsApi.decide(claimId, {
        approver_id: user.id,
        approver_name: user.name,
        approver_role: role,
        decision,
        comments: comments[claimId] || '',
      });
      setClaims(prev => prev.filter(c => c.claim.id !== claimId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process decision');
    } finally { setDeciding(null); }
  };

  const roleLabel = { manager:'Manager', director:'Director', vp_finance:'VP Finance' }[role] || role;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
          <p className="text-slate-500 text-sm mt-1">
            Claims awaiting your approval as{' '}
            <span className="font-semibold text-indigo-600">{roleLabel}</span>
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-center">
          <p className="text-2xl font-bold text-indigo-700">{claims.length}</p>
          <p className="text-xs text-indigo-500">Pending</p>
        </div>
      </div>

      {error && <p className="text-rose-500 text-sm mb-4">{error}</p>}

      {claims.length === 0 ? (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
          <p className="text-slate-500 mt-2">No pending approvals right now.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {claims.map(({ claim, step }) => (
              <motion.div key={claim.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, x:100 }} transition={{ duration:0.35 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                          Step {step.step_order} · {step.approver_role}
                        </span>
                        <span className="text-xs text-slate-400">#{claim.id}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{claim.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{claim.employee_name} · {claim.department}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-slate-900">${claim.converted_total_usd?.toFixed(2)}</p>
                      {claim.original_currency !== 'USD' && (
                        <p className="text-xs text-slate-400">{claim.original_total} {claim.original_currency}</p>
                      )}
                    </div>
                  </div>

                  <button onClick={() => setExpanded(expanded === claim.id ? null : claim.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                    {expanded === claim.id ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                    {expanded === claim.id ? 'Hide' : 'Show'} items ({claim.items?.length || 0})
                  </button>
                </div>

                <AnimatePresence>
                  {expanded === claim.id && (
                    <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
                      className="overflow-hidden border-t border-slate-100">
                      <div className="px-6 py-4 bg-slate-50 space-y-2">
                        {claim.items?.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              <span className="font-medium capitalize">{item.category}</span> — {item.description}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {item.amount} {item.currency}
                              {item.currency !== 'USD' && (
                                <span className="text-slate-400 text-xs ml-1">(${item.amount_usd} USD)</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-6 pb-6 pt-2">
                  <textarea value={comments[claim.id] || ''}
                    onChange={e => setComments(prev => ({ ...prev, [claim.id]: e.target.value }))}
                    placeholder="Add a comment (optional)..." rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all mb-3" />
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                      onClick={() => decide(claim.id, 'rejected')} disabled={!!deciding}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 transition-all disabled:opacity-50">
                      {deciding === `${claim.id}-rejected`
                        ? <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin"/>
                        : <><XCircle className="w-4 h-4"/> Reject</>}
                    </motion.button>
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                      onClick={() => decide(claim.id, 'approved')} disabled={!!deciding}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
                      {deciding === `${claim.id}-approved`
                        ? <div className="w-4 h-4 border-2 border-emerald-300 border-t-white rounded-full animate-spin"/>
                        : <><CheckCircle className="w-4 h-4"/> Approve</>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}