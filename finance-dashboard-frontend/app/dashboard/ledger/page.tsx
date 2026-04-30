"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import TransactionsTable, { Transaction } from '@/components/TransactionsTable';
import Sidebar from '@/components/Sidebar';
import RoleBadge from '@/components/ui/RoleBadge';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function LedgerPage() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0, count: 0 });
  const [userRole, setUserRole] = useState('viewer');
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');
  const router = useRouter();

  const fetchLedgerData = useCallback(async () => {
    try {
      const [summaryRes, profileRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/auth/profile')
      ]);
      setSummary(summaryRes.data);
      setUserRole(profileRes.data.role);
      setUserInfo({ name: profileRes.data.name, email: profileRes.data.email });
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login');
      } else {
        console.error('Failed to fetch ledger data', err);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLedgerData();
    // Persist sidebar state
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, [fetchLedgerData, refreshCounter]);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (typeFilter !== 'All Types') params.type = typeFilter.toLowerCase().replace('expenses', 'expense');
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;

      const response = await api.get('/finance', {
        params: { ...params, export: true },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledger-export-${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export data', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold tracking-tight mt-4">Opening Transactions Archive...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex overflow-hidden">
      <Sidebar 
        userName={userInfo?.name || 'User'} 
        userRole={userRole} 
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        onNewEntry={() => setIsModalOpen(true)}
      />

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }} 
        onSuccess={() => setRefreshCounter(c => c + 1)} 
        initialData={editingTransaction}
      />

      <div className={`flex-1 flex flex-col h-screen transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20 ml-0' : 'lg:ml-72 ml-0'}`}>
        
        <header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md flex items-center px-6 md:px-8 py-3 gap-4 md:gap-8">
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
           </button>

           <div className="hidden lg:block w-48">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Transactions</h1>
           </div>

           <div className="flex items-center gap-3 ml-auto">
              <div className="hidden md:flex items-center gap-2.5 bg-white border border-slate-100 px-4 py-1.5 rounded-full shadow-sm">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 whitespace-nowrap">
                   {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                 </span>
              </div>
              <div className="h-8 px-4 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[9px] font-black text-slate-900 cursor-pointer hover:border-indigo-200 transition-all uppercase tracking-widest leading-none">
                {userRole}
              </div>
           </div>
        </header>

        <main className="flex-1 mr-4 mb-4 ml-4 lg:ml-6 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col overflow-hidden">
          
          {/* Highly Compacted Metric Bar */}
          <div className="px-4 md:px-8 py-6 bg-[#fdfdfd]/30">
             <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-1.5 flex flex-col md:flex-row items-stretch gap-1 md:gap-0">
                {[
                  { label: 'TOTAL INCOME', value: summary.totalIncome, color: 'text-emerald-600', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> },
                  { label: 'TOTAL EXPENSE', value: summary.totalExpense, color: 'text-rose-500', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg> },
                  { label: 'NET SURPLUS', value: summary.netBalance, color: 'text-indigo-600', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1V23M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> }
                ].map((m, idx) => (
                  <div key={idx} className={`flex-1 flex items-center justify-between px-6 py-4 md:py-3 transition-colors hover:bg-slate-50/50 rounded-xl group ${idx < 2 ? 'md:border-r md:border-slate-50' : ''}`}>
                    <div className="space-y-0.5 md:space-y-0">
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 leading-none">{m.label}</p>
                      <p className={`text-lg md:text-xl font-black ${m.color} tracking-tighter`}>${m.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-50 flex items-center justify-center ${m.color} group-hover:rotate-12 transition-transform`}>
                      {m.icon}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Compact Filtering Controls */}
          <div className="px-8 py-4 border-y border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/20">
             <div className="flex items-center gap-3">
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white border border-slate-100 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 focus:outline-none hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                >
                   <option>All Types</option>
                   <option>Income</option>
                   <option>Expenses</option>
                </select>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-100 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 focus:outline-none hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                >
                   <option>All Categories</option>
                   <option>Rent</option>
                   <option>Salary</option>
                   <option>Food</option>
                   <option>Freelance</option>
                   <option>Investment</option>
                   <option>Shopping</option>
                   <option>Travel</option>
                   <option>Healthcare</option>
                   <option>Utilities</option>
                   <option>Entertainment</option>
                </select>

                <div className="relative md:ml-2 w-full md:min-w-[280px] group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-600 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-5 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
                  />
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-100 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 focus:outline-none hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                >
                   <option>Newest First</option>
                   <option>Oldest First</option>
                   <option>Highest Value</option>
                </select>

                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Export CSV
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 pt-0">
             <div className="mt-6 mb-12">
               <TransactionsTable 
                  refreshTrigger={refreshCounter} 
                  onUpdate={() => setRefreshCounter(c => c + 1)} 
                  onEdit={(t: Transaction) => {
                    setEditingTransaction(t);
                    setIsModalOpen(true);
                  }}
                  onAdd={() => setIsModalOpen(true)}
                  userRole={userRole}
                  startDate=""
                  endDate=""
                  searchQuery={searchQuery}
                  filterType={typeFilter}
                  filterCategory={categoryFilter}
                  sortBy={sortBy}
               />
             </div>
          </div>

        </main>
      </div>
    </div>
  );
}
