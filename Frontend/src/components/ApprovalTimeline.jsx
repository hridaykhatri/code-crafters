import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { claimsApi } from '../services/api';

function TimelineNode({ action, performed_by_name, role, comments, timestamp, index }) {
  const isApproved = action === 'approved' || action === 'auto_approved';
  const isRejected = action === 'rejected';
  const Icon       = isApproved ? CheckCircle : isRejected ? XCircle : Clock;
  const iconColor  = isApproved ? 'text-emerald-500' : isRejected ? 'text-rose-500' : 'text-indigo-500';
  const bgColor    = isApproved ? 'bg-emerald-50 border-emerald-200'
                   : isRejected ? 'bg-rose-50 border-rose-200'
                   : 'bg-indigo-50 border-indigo-200';

  return (
    <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.1 }} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${bgColor}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="w-0.5 flex-1 bg-slate-200 mt-2 mb-2 min-h-[20px]" />
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wide ${iconColor}`}>
            {action.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 capitalize">{role}</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{performed_by_name}</p>
        {comments && <p className="text-xs text-slate-500 mt-1 italic">"{comments}"</p>}
        {timestamp && <p className="text-xs text-slate-400 mt-1">{new Date(timestamp).toLocaleString()}</p>}
      </div>
    </motion.div>
  );
}

export default function ApprovalTimeline({ claimId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!claimId) return;
    claimsApi.getHistory(claimId)
      .then(({ data }) => setHistory(data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [claimId]);

  if (loading) return (
    <div className="py-4 flex justify-center">
      <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!history.length) return <p className="text-sm text-slate-400 py-4">No history yet.</p>;

  return (
    <div className="mt-4">
      {history.map((item, i) => <TimelineNode key={item.id} {...item} index={i} />)}
    </div>
  );
}