"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import UsersTable from '@/components/UsersTable';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
        if (res.data.role.toLowerCase() !== 'admin') {
           router.push('/dashboard');
        }
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar 
        userName={user.name} 
        userRole={user.role} 
        onLogout={handleLogout} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col h-screen transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} ml-0`}>
        {/* Compact Header */}
        <header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md flex items-center px-6 md:px-8 py-3.5 gap-4 md:gap-8">
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
           </button>

           <div className="hidden lg:block w-auto">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">Settings <span className="text-slate-300">/</span> Team</h1>
           </div>

           <div className="flex items-center gap-4 ml-auto">
              <div className="hidden md:flex items-center gap-2.5 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-sm">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 whitespace-nowrap">
                   {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                 </span>
              </div>
              <div className="h-8 px-4 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[9px] font-black text-slate-900 cursor-pointer hover:border-indigo-200 transition-all uppercase tracking-widest">
                {user?.role}
              </div>
           </div>
        </header>

        <main className="flex-1 lg:mr-6 lg:mb-6 lg:ml-6 bg-white lg:rounded-[2rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-y-auto">
          <div className="p-4 md:p-8 space-y-8 md:space-y-10">
             <div className="max-w-7xl mx-auto py-10">
               <UsersTable />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
