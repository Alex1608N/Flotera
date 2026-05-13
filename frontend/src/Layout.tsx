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
  userEmail?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, userEmail, currentPage, onNavigate }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Auto-close mobile menu on navigation
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30000
  });

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', name: 'Flota Mea', icon: Car },
    { id: 'drivers', name: 'Management Șoferi', icon: Users, role: 'OWNER' },
    { id: 'notifications', name: 'Notificări', icon: Bell, badge: unreadCount },
    { id: 'profile', name: 'Profilul Meu', icon: UserIcon },
  ];

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
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 md:p-6 flex items-center justify-between">
          <span className={`font-bold text-xl tracking-wider text-blue-400 ${!isSidebarOpen && 'hidden md:block'}`}>
            FLOTERA
          </span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block p-1 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 hover:bg-slate-800 rounded">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 md:px-4 space-y-2 overflow-y-auto">
          {navigation.map((item: any) => {
            // Ascunde pagini bazat pe rol
            if (item.id === 'fleet' && user?.role === 'DRIVER') return null;
            if (item.role === 'OWNER' && user?.role !== 'OWNER') return null;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-colors group ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-blue-600/20 hover:text-blue-400 text-gray-300'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6 shrink-0" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`ml-3 font-medium ${!isSidebarOpen && 'hidden md:block'}`}>
                  {item.name}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => onNavigate('profile')} className="w-full flex items-center p-2 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left">
            <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden shrink-0">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profilePictureUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} />
              )}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden hidden md:block">
                <p className="text-xs text-gray-400 truncate">{user?.name || userEmail}</p>
                <p className="text-sm font-medium">{user?.role === 'OWNER' ? 'Proprietar' : 'Șofer'}</p>
              </div>
            )}
            <div className="ml-3 overflow-hidden md:hidden">
                <p className="text-sm text-gray-300 truncate">{user?.name || userEmail}</p>
            </div>
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full mt-2 md:mt-4 flex items-center p-3 md:p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={22} className="md:w-5 md:h-5 shrink-0" />
            <span className={`ml-3 font-medium ${!isSidebarOpen && 'hidden md:block'}`}>Deconectare</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Panou de Control</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
