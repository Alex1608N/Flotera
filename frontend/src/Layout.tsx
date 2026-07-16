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

import { getImageUrl } from './api/imageUtils';

import NotificationDrawer from './components/NotificationDrawer';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);

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
    { id: 'drivers', name: 'Management Echipă', icon: Users, role: 'OWNER' },
    { id: 'notifications', name: 'Alerte & Notificări', icon: Bell, badge: unreadCount },
    { id: 'profile', name: 'Profilul Meu', icon: UserIcon },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <NotificationDrawer 
        isOpen={isNotificationDrawerOpen} 
        onClose={() => setIsNotificationDrawerOpen(false)} 
      />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl ${isSidebarOpen ? 'w-64' : 'w-20'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`h-16 md:h-20 px-4 flex items-center shrink-0 border-b border-slate-800/50 relative ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <span className="font-black text-white text-sm">FL</span>
            </div>
            <span className={`font-black text-lg tracking-wider text-blue-400 whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 w-0 -translate-x-10' : 'opacity-100 w-auto translate-x-0'}`}>
              FLOTERA
            </span>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={`hidden md:flex items-center justify-center rounded-lg transition-all ${
              isSidebarOpen 
                ? 'p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white' 
                : 'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white shadow-xl border-2 border-slate-900 hover:bg-blue-500 z-50 active:scale-90'
            }`}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={12} />}
          </button>

          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-4">
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
              >
                <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white border-2 border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`ml-3 font-bold whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 -translate-x-10 w-0' : 'opacity-100 translate-x-0'}`}>
                  {item.name}
                </span>
                
                {!isSidebarOpen && (
                  <div className={`absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700 shadow-xl`}>
                    {item.name}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-800/50 space-y-2">
          <button onClick={() => handleNavigate('profile')} className="w-full flex items-center p-2 hover:bg-slate-800 rounded-xl transition-all group overflow-hidden">
            <div className="w-10 h-10 md:w-9 md:h-9 rounded-xl bg-blue-500 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-blue-500/20">
              {user?.profilePictureUrl ? (
                <img src={getImageUrl(user.profilePictureUrl)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-white" />
              )}
            </div>
            <div className={`ml-3 text-left transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 -translate-x-10 w-0' : 'opacity-100 translate-x-0'}`}>
              <p className="text-sm font-black text-white truncate">{user?.name || 'Incarcare...'}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user?.role === 'OWNER' ? 'Proprietar' : 'Sofer'}</p>
            </div>
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group"
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span className={`ml-3 font-bold transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 -translate-x-10 w-0' : 'opacity-100 translate-x-0'}`}>Deconectare</span>
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
            <div className="hidden sm:block">
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight capitalize">
                {navigation.find(n => n.id === currentPage)?.name || 'Panou de Control'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sistem de monitorizare flota</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
              onClick={() => setIsNotificationDrawerOpen(true)}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 leading-none mb-1">{user?.name}</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user?.role === 'OWNER' ? 'Admin' : 'Driver'}</span>
              </div>
              <button onClick={() => handleNavigate('profile')} className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-slate-400 overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all active:scale-95">
                 {user?.profilePictureUrl ? (
                  <img src={getImageUrl(user.profilePictureUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={22} />
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
