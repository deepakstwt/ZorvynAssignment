"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Transaction | null;
}

export default function AddTransactionModal({ isOpen, onClose, onSuccess, initialData }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        type: initialData.type,
        category: initialData.category,
        date: new Date(initialData.date).toISOString().split('T')[0],
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (initialData?._id) {
        await api.patch(`/finance/${initialData._id}`, payload);
      } else {
        await api.post('/finance', payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Insufficient permissions. Admin required.');
      } else {
        setError('Validation failed. Please verify inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative border border-slate-100 overflow-hidden">
        <button 
           onClick={onClose} 
           className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all cursor-pointer group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <header className="mb-10">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">{initialData ? 'Update Record' : 'New Transaction'}</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fill in the details below</p>
        </header>

        {error && (
            <div className="mb-8 p-4 bg-rose-50 text-rose-500 border border-rose-100 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center gap-3">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
               {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
              <div className="relative">
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none font-bold text-slate-900 transition-all placeholder-slate-300"
                placeholder="$ 0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none font-bold text-slate-900 transition-all placeholder-slate-300"
                    placeholder="e.g. Payroll, Food, Marketing"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none font-bold text-slate-900 transition-all"
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none font-bold text-slate-900 transition-all placeholder-slate-300 min-h-[100px] resize-none"
              placeholder="Provide context for this record..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : initialData ? 'Update Record' : 'Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
}
