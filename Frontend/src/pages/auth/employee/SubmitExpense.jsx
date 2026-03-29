import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Plus, Trash2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { claimsApi, currencyApi } from '../../services/api';

const CATEGORIES = [
  { value: 'travel',          label: '✈️  Travel' },
  { value: 'meals',           label: '🍽️  Meals' },
  { value: 'accommodation',   label: '🏨  Accommodation' },
  { value: 'transport',       label: '🚗  Transport' },
  { value: 'office_supplies', label: '📎  Office Supplies' },
  { value: 'software',        label: '💻  Software' },
  { value: 'training',        label: '📚  Training' },
  { value: 'medical',         label: '🏥  Medical' },
  { value: 'other',           label: '📦  Other' },
];

const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD','SGD','CHF','CNY'];

const emptyItem = () => ({
  id: Date.now(),
  category: 'travel',
  description: '',
  amount: '',
  currency: 'USD',
  expense_date: new Date().toISOString().split('T')[0],
  receipt_url: '',
  convertedUSD: null,
});

export default function SubmitExpense() {
  const { user } = useAuth();
  const [title, setTitle]           = useState('');
  const [department, setDepartment] = useState(user?.department || '');
  const [items, setItems]           = useState([emptyItem()]);
  const [errors, setErrors]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(null);

  useEffect(() => {
    const key = items.map(i => `${i.amount}${i.currency}`).join(',');
    const timer = setTimeout(() => {
      items.forEach(async (item, i) => {
        if (!item.amount) return;
        if (item.currency === 'USD') {
          setItems(prev => prev.map((it, idx) =>
            idx === i ? { ...it, convertedUSD: parseFloat(item.amount) || null } : it
          ));
          return;
        }
        try {
          const { data } = await currencyApi.convert(parseFloat(item.amount), item.currency, 'USD');
          setItems(prev => prev.map((it, idx) =>
            idx === i ? { ...it, convertedUSD: data.converted_amount } : it
          ));
        } catch {}
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [items.map(i => `${i.amount}${i.currency}`).join(',')]);

  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));

  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));

  const handleSubmit = async () => {
    setLoading(true); setErrors([]); setSuccess(null);
    try {
      const claimData = {
        title,
        description: title,
        employee_id: user.id,
        employee_name: user.name,
        department: department || user.department,
        original_currency: items[0]?.currency || 'USD',
      };
      const itemsData = items.map(it => ({
        category: it.category,
        description: it.description,
        amount: parseFloat(it.amount),
        currency: it.currency,
        expense_date: it.expense_date,
        receipt_url: it.receipt_url || null,
      }));
      const { data } = await claimsApi.submit(claimData, itemsData);
      setSuccess(data);
      setTitle(''); setItems([emptyItem()]);
    } catch (err) {
      const e = err.response?.data;
      setErrors(e?.errors || [e?.error || 'Submission failed.']);
    } finally { setLoading(false); }
  };

  const totalUSD = items.reduce((sum, it) => sum + (it.convertedUSD || 0), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit Expense</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details to submit your reimbursement claim</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800">
                {success.auto_approved ? '✅ Auto-approved!' : '🎉 Claim submitted!'}
              </p>
              <p className="text-emerald-700 text-sm mt-1">
                {success.auto_approved
                  ? 'Your claim was automatically approved (under $1,000).'
                  : `Pending approval from: ${success.approval_chain?.join(' → ')}`}
              </p>
              <p className="text-emerald-600 text-xs mt-1">Claim ID: #{success.claim?.id}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <p className="font-semibold text-rose-800">Please fix these issues:</p>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((e, i) => <li key={i} className="text-rose-700 text-sm">{e}</li>)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4">Claim Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Claim Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Business trip to Mumbai"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department *</label>
            <input value={department} onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex flex-col justify-center">
            <p className="text-xs text-indigo-500 font-medium">Estimated Total (USD)</p>
            <p className="text-xl font-bold text-indigo-700">${totalUSD.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-4">
        {items.map((item, idx) => (
          <motion.div key={item.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 text-sm">Item #{idx + 1}</h3>
              {items.length > 1 && (
                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                <select value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                <input type="date" value={item.expense_date}
                  onChange={e => updateItem(item.id, 'expense_date', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Description *</label>
                <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="What was this expense for?"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount</label>
                <div className="flex gap-2">
                  <select value={item.currency} onChange={e => updateItem(item.id, 'currency', e.target.value)}
                    className="w-24 px-2 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="number" value={item.amount}
                    onChange={e => updateItem(item.id, 'amount', e.target.value)}
                    placeholder="0.00" min="0" step="0.01"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
                {item.convertedUSD && item.currency !== 'USD' && (
                  <p className="text-xs text-indigo-500 mt-1 font-medium">≈ ${item.convertedUSD.toFixed(2)} USD</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Receipt URL (optional)</label>
                <input value={item.receipt_url} onChange={e => updateItem(item.id, 'receipt_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => setItems(prev => [...prev, emptyItem()])}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Item
        </button>
        <motion.button onClick={handleSubmit} disabled={loading || !title}
          whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all"
          style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Send className="w-4 h-4" /> Submit Claim</>}
        </motion.button>
      </div>

      {/* Thresholds info */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Approval Thresholds</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
          <span>🟢 Under $1,000 → Auto-approved</span>
          <span>🟡 $1K–$5K → Manager approval</span>
          <span>🟠 $5K–$15K → Manager + Director</span>
          <span>🔴 $15K+ → + VP Finance</span>
        </div>
      </div>
    </div>
  );
}