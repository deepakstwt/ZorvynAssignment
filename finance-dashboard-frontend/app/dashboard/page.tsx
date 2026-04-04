"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import MonthlyTrendsChart from '@/components/charts/MonthlyTrendsChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import TopSpendingBarChart from '@/components/charts/TopSpendingBarChart';
import AddTransactionModal from '@/components/AddTransactionModal';
import TransactionsTable from '@/components/TransactionsTable';
import Sidebar from '@/components/Sidebar';
import RoleBadge from '@/components/ui/RoleBadge';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState('viewer');
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('6M');
  const [activeChartSegment, setActiveChartSegment] = useState('performance');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      const params: Record<string, string> = { range: timeRange };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [dashboardAllRes, profileRes] = await Promise.all([
        api.get('/dashboard/all', { params }),
        api.get('/auth/profile')
      ]);

      const { summary, trends, categories } = dashboardAllRes.data;
      
      setSummary(summary);
      setTrends(trends);
      setCategories(categories);
      setUserRole(profileRes.data.role);
      setUserInfo({ name: profileRes.data.name, email: profileRes.data.email });
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login');
      } else {
        console.error('Failed to fetch dashboard data', err);
      }
    } finally {
      setLoading(false);
    }
  }, [router, startDate, endDate, timeRange]);

  useEffect(() => {
    fetchDashboardData();
    // Persist sidebar state
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, [fetchDashboardData]);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold tracking-tight">Syncing workspace...</p>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-100 flex overflow-hidden">
      {/* Heritage Collapsible Sidebar */}
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
        
        {/* Compact Header */}
        <header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md flex items-center px-6 md:px-8 py-3.5 gap-4 md:gap-8">
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
           </button>

           <div className="hidden lg:block w-48">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Overview</h1>
           </div>

           <div className="flex items-center gap-4 ml-auto">
              <div className="hidden md:flex items-center gap-2.5 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-sm">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 whitespace-nowrap">
                   {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                 </span>
              </div>
              <div className="h-8 px-4 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[9px] font-black text-slate-900 cursor-pointer hover:border-indigo-200 transition-all uppercase tracking-widest">
                {userRole}
              </div>
           </div>
        </header>

        {/* Compact Main Canvas */}
        <main className="flex-1 lg:mr-6 lg:mb-6 lg:ml-6 lg:ml-6 bg-white lg:rounded-[2rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-8 md:space-y-10">
            
            {/* Highly Compact Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { 
                  label: 'TOTAL INCOME', 
                  amount: summary.totalIncome, 
                  color: 'text-emerald-700',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
                  bgColor: 'bg-emerald-50/40'
                },
                { 
                  label: 'TOTAL EXPENSES', 
                  amount: summary.totalExpense, 
                  color: 'text-rose-600',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
                  bgColor: 'bg-rose-50/40'
                },
                { 
                  label: 'NET SURPLUS', 
                  amount: summary.netBalance, 
                  color: summary.netBalance >= 0 ? 'text-indigo-700' : 'text-rose-700',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1V23M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
                  bgColor: 'bg-indigo-50/40'
                },
              ].map((card, i) => (
                <div 
                  key={i} 
                  className={`group relative p-5 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 transition-all duration-300 ${card.bgColor} hover:bg-white hover:shadow-xl shadow-sm`}
                >
                   <div className="flex items-center justify-between mb-4 md:mb-5">
                     <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{card.label}</span>
                     <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white shadow-md border border-slate-50 flex items-center justify-center ${card.color}`}>
                       {card.icon}
                     </div>
                   </div>
                   <h3 className={`text-2xl md:text-3xl font-black tabular-nums tracking-tighter leading-none ${card.color}`}>
                     ₹{card.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                   </h3>
                </div>
              ))}
            </div>

            {/* Performance Charts (Integrated Segmented Controller) */}
            {(userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'analyst') ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-slate-50 p-1 rounded-full flex items-center gap-1 border border-slate-100">
                    <button 
                      onClick={() => setActiveChartSegment('performance')}
                      className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeChartSegment === 'performance' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Trends
                    </button>
                    <button 
                      onClick={() => setActiveChartSegment('allocation')}
                      className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeChartSegment === 'allocation' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Allocation
                    </button>
                    <button 
                      onClick={() => setActiveChartSegment('breakdown')}
                      className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeChartSegment === 'breakdown' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Top Categories
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-lg">
                  {activeChartSegment === 'performance' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Monthly Trends</h3>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                               <div className="w-2.5 h-[2.5px] bg-emerald-500 rounded-full"></div>
                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Inflow</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <div className="w-2.5 h-[1px] bg-rose-400 rounded-full"></div>
                               <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">Expense Burn</span>
                            </div>
                          </div>
                        </div>
                        <select 
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 focus:outline-none hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                        >
                           <option value="1M">Last Month</option>
                           <option value="3M">Last Quarter</option>
                           <option value="6M">Last 6 Months</option>
                        </select>
                      </div>
                      <div className="h-[300px] md:h-[420px] w-full">
                        <MonthlyTrendsChart data={trends} />
                      </div>
                    </div>
                  )}
                  {activeChartSegment === 'allocation' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase text-center md:text-left">Budget Allocation</h3>
                      <div className="h-[400px] md:h-[560px] w-full">
                        <CategoryPieChart data={categories} />
                      </div>
                    </div>
                  )}
                  {activeChartSegment === 'breakdown' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase text-center md:text-left">Spending Concentration</h3>
                      <div className="h-[300px] md:h-[380px] w-full pt-4">
                        <TopSpendingBarChart data={categories} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Enhanced UI for Viewers
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-500"></div>
                  <h3 className="text-xl font-black tracking-tighter uppercase mb-4 relative z-10">Access Overview</h3>
                  <p className="text-sm text-slate-400 font-bold mb-6 leading-relaxed relative z-10">
                    You're currently viewing the dashboard with <span className="text-indigo-400">Viewer Privileges</span>. 
                    This allows you to see the real-time financial snapshots but limits access to the detailed ledger and administrative tools.
                  </p>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    <span className="px-4 py-2 bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10">Summary View ✅</span>
                    <span className="px-4 py-2 bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10">Read Only ✅</span>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-indigo-900 tracking-tighter uppercase mb-2">Need More Insights?</h3>
                    <p className="text-sm text-indigo-600/80 font-bold leading-relaxed">
                      Detailed charts and historical data are available for <span className="font-black text-indigo-900">Analysts</span> and <span className="font-black text-indigo-900">Admins</span>. 
                      Contact your workspace manager to upgrade your permissions.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">System Status: Optimal</span>
                  </div>
                </div>
              </div>
            )}

            {/* Compact RECENT ACTIVITY section */}
            {(userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'analyst') && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line></svg>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">RECENT ACTIVITY</h3>
                </div>
                <div className="mt-4">
                  <TransactionsTable 
                    refreshTrigger={refreshCounter} 
                    onUpdate={() => setRefreshCounter(c => c + 1)} 
                    onEdit={(t: any) => {
                      setEditingTransaction(t);
                      setIsModalOpen(true);
                    }}
                    userRole={userRole}
                    startDate={startDate}
                    endDate={endDate}
                    showViewAll={true}
                  />
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
