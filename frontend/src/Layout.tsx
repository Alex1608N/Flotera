import React from 'react';
import { supabase } from "./supabaseClient";
import { useQuery } from '@tanstack/react-query';
import { userApi } from './api/userApi';
import { notificationApi } from './api/notificationApi';
import { 
  LayoutDashboard, 
  Car, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30000
  });

  interface NavigationItem {
    id: string;
    name: string;
    icon: React.ElementType;
    role?: string;
    badge?: number;
  }

  const navigation: NavigationItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', name: 'Flota Mea', icon: Car },
    { id: 'drivers', name: 'Management Șoferi', icon: Users, role: 'OWNER' },
    { id: 'notifications', name: 'Notificări', icon: Bell, badge: unreadCount },
    { id: 'profile', name: 'Profilul Meu', icon: UserIcon },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 md:h-20 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="font-black text-white text-xs">FL</span>
            </div>
            <span className={`font-bold text-lg tracking-wider text-blue-400 whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
              FLOTERA
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar py-4">
          {navigation.map((item) => {
            // Ascunde pagini bazat pe rol
            if (item.id === 'fleet' && user?.role === 'DRIVER') return null;
            if (item.role === 'OWNER' && user?.role !== 'OWNER') return null;

            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                }`}
                title={!isSidebarOpen ? item.name : ''}
              >
                <div className="relative shrink-0">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'md:opacity-0 md:translate-x-4 md:w-0' : 'opacity-100 translate-x-0'}`}>
                  {item.name}
                </span>
                
                {isActive && !isSidebarOpen && (
                  <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full hidden md:block" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-800/50 space-y-2">
          <button onClick={() => handleNavigate('profile')} className="w-full flex items-center p-2 hover:bg-slate-800 rounded-xl transition-all group overflow-hidden">
            <div className="w-10 h-10 md:w-9 md:h-9 rounded-xl bg-blue-500 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-blue-500/20">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-white" />
              )}
            </div>
            <div className={`ml-3 text-left transition-all duration-300 ${!isSidebarOpen ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Utilizator'}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user?.role === 'OWNER' ? 'Proprietar' : 'Șofer'}</p>
            </div>
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group"
            title={!isSidebarOpen ? 'Deconectare' : ''}
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span className={`ml-3 font-medium transition-all duration-300 ${!isSidebarOpen ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>Deconectare</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight capitalize">
                {navigation.find(n => n.id === currentPage)?.name || 'Panou de Control'}
              </h2>
              <p className="hidden md:block text-xs text-slate-500 font-medium">Gestionare flotă și monitorizare în timp real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user?.name}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user?.role === 'OWNER' ? 'Admin' : 'Driver'}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
               {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
