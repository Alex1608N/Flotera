import React from 'react';
import { supabase } from "./supabaseClient";
import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import { userApi } from './api/userApi';
import { notificationApi } from './api/notificationApi';
import { 
  LayoutDashboard, 
  Car, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, userEmail, currentPage, onNavigate }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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
    { id: 'notifications', name: 'Notificări', icon: Bell, badge: unreadCount },
    { id: 'profile', name: 'Profilul Meu', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar pentru Desktop */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          <span className={`font-bold text-xl tracking-wider text-blue-400 ${!isSidebarOpen && 'hidden'}`}>
            FLOTERA
          </span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            // Ascunde Flota Mea pentru șoferi
            if (item.id === 'fleet' && user?.role === 'DRIVER') return null;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors group ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white' 
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
                <span className={`ml-3 font-medium ${!isSidebarOpen && 'hidden'}`}>
                  {item.name}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => onNavigate('profile')} className="w-full flex items-center p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden shrink-0">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} />
              )}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs text-gray-400 truncate">{user?.name || userEmail}</p>
                <p className="text-sm font-medium">{user?.role === 'OWNER' ? 'Proprietar' : 'Șofer'}</p>
              </div>
            )}
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full mt-4 flex items-center p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className={`ml-3 font-medium ${!isSidebarOpen && 'hidden'}`}>Deconectare</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Panou de Control</h2>
          <div className="flex items-center space-x-4">
             {/* Aici putem adăuga un mic badge de status sau notificări rapide */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
