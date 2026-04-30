"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import UsersTable from '@/components/UsersTable';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
        setInviteCode(res.data.inviteCode);
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
          <div className="p-4 md:p-8 space-y-8 md:space-y-12">
             <div className="max-w-7xl mx-auto space-y-10">
               
               {/* Team Invitation Card (Global) */}
               <div className="bg-[#f8fafc] border-2 border-dashed border-slate-200 p-8 md:p-10 rounded-[3rem] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-indigo-200 transition-all group animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="space-y-3 text-center lg:text-left max-w-sm">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">Grow Your Team</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                      Generate role-locked invites for your workspace
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="flex flex-wrap justify-center gap-3">
                          <button 
                            onClick={async () => {
                              if (!inviteCode) {
                                toast.error('Invite code still loading. Please wait.');
                                return;
                              }
                              try {
                                const link = `${window.location.origin}/register?code=${inviteCode}&role=analyst`;
                                await navigator.clipboard.writeText(link);
                                toast.success('Analyst invite link copied to clipboard!');
                              } catch (err) {
                                console.error('Clipboard error:', err);
                                toast.error('Failed to copy link.');
                              }
                            }}
                            disabled={!inviteCode}
                            className={`px-6 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 shadow-sm transition-all active:scale-95 flex items-center gap-2 ${!inviteCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                             Invite Analyst
                          </button>
                          <button 
                            onClick={async () => {
                              if (!inviteCode) {
                                toast.error('Invite code still loading. Please wait.');
                                return;
                              }
                              try {
                                const link = `${window.location.origin}/register?code=${inviteCode}&role=viewer`;
                                await navigator.clipboard.writeText(link);
                                toast.success('Viewer invite link copied to clipboard!');
                              } catch (err) {
                                console.error('Clipboard error:', err);
                                toast.error('Failed to copy link.');
                              }
                            }}
                            disabled={!inviteCode}
                            className={`px-6 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 shadow-sm transition-all active:scale-95 flex items-center gap-2 ${!inviteCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M23 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path></svg>
                             Invite Viewer
                          </button>
                        </div>
                  </div>
               </div>

               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-1 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">Active Members</h2>
                    <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Workspace #{inviteCode}
                    </div>
                 </div>
                 <UsersTable />
               </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
