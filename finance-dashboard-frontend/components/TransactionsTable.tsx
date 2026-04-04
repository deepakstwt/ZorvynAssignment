"use client";

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import RoleBadge from './ui/RoleBadge';
import toast from 'react-hot-toast';

export interface Transaction {
  _id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  notes: string;
  date: string;
}

interface TransactionsTableProps {
  refreshTrigger?: number;
  onUpdate?: () => void;
  onEdit?: (transaction: Transaction) => void;
  userRole?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  filterType?: string;
  filterCategory?: string;
  sortBy?: string;
  showViewAll?: boolean;
}

export default function TransactionsTable({ 
  refreshTrigger, 
  onUpdate, 
  onEdit, 
  userRole, 
  startDate, 
  endDate,
  searchQuery = '',
  filterType = 'All Types',
  filterCategory = 'All Categories',
  sortBy = 'Newest First',
  showViewAll = false
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/finance', { params });
      
      // Handle paginated response: { data, total, page, limit }
      if (res.data && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
      } else if (Array.isArray(res.data)) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger, startDate, endDate]);

  const handleDelete = async (id: string) => {
    // Dismiss existing to prevent stacking
    toast.dismiss();
    
    // Custom styled toast for deletion
    toast((t) => (
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-black uppercase tracking-tight">Redact transaction?</span>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const deletePromise = api.delete(`/finance/${id}`);
                await toast.promise(deletePromise, {
                  loading: 'Processing redaction...',
                  success: 'Transaction permanently redacted',
                  error: 'Error during redaction sequence',
                });
                fetchTransactions();
                if (onUpdate) onUpdate();
              } catch (err) {
                console.error(err);
              }
            }}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors"
          >
            Confirm
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        minWidth: '350px',
        padding: '12px 16px'
      }
    });
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = transactions.filter(t => {
      const matchesSearch = 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery);
      
      const matchesType = 
        filterType === 'All Types' || 
        t.type === filterType.toLowerCase().replace('expenses', 'expense');

      const matchesCategory = 
        filterCategory === 'All Categories' || 
        t.category === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'Newest First') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'Oldest First') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'Highest Value') return b.amount - a.amount;
      return 0;
    });

    return showViewAll ? result.slice(0, 5) : result;
  }, [transactions, searchQuery, filterType, filterCategory, sortBy, showViewAll]);

  if (loading) return (
    <div className="py-12 flex justify-center items-center">
      <div className="w-6 h-6 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
      {/* Cards Header - Compacted */}
      <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">RECENT ACTIVITY</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Transaction stream</p>
        </div>
        {showViewAll && (
           <button onClick={() => window.location.href = '/dashboard/ledger'} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all">View Full Archive</button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">DATE</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">CATEGORY</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">TYPE</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">NOTES</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">AMOUNT</th>
              {userRole === 'admin' && !showViewAll && (
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">ACTIONS</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAndSortedTransactions.map((t) => (
              <tr key={t._id} className="group hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-5">
                  <p className="text-xs font-black text-slate-800 tracking-tight">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[8px] font-black text-slate-300 uppercase mt-0.5 tracking-widest">{new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.category}</span>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type}</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[10px] font-bold text-slate-500 max-w-[150px] truncate">{t.notes || '—'}</p>
                </td>
                <td className={`px-8 py-5 text-right text-xs font-black tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </td>
                {userRole?.toLowerCase() === 'admin' && !showViewAll && (
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => onEdit && onEdit(t)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(t._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Stack View */}
      <div className="lg:hidden space-y-px bg-slate-50">
        {filteredAndSortedTransactions.map((t) => (
          <div key={t._id} className="bg-white p-6 flex flex-col gap-5 active:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">{t.category}</h3>
                </div>
              </div>
              <p className={`text-sm font-black tracking-tighter ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
              </p>
            </div>
            
            {t.notes && (
              <p className="text-[10px] font-bold text-slate-500 line-clamp-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                {t.notes}
              </p>
            )}

            {userRole === 'admin' && !showViewAll && (
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => onEdit && onEdit(t)}
                  className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-indigo-100 active:scale-95 transition-all shadow-sm shadow-indigo-100"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit Record
                </button>
                <button 
                  onClick={() => handleDelete(t._id)}
                  className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 active:scale-95 transition-all shadow-sm shadow-rose-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      
      {filteredAndSortedTransactions.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero matching sequences found</p>
        </div>
      )}
    </div>
  );
}
