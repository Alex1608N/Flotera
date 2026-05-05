import React from 'react';
import { supabase } from "./supabaseClient";
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
}

export default function Layout({ children, userEmail }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#' },
    { name: 'Flota Mea', icon: Car, href: '#' },
    { name: 'Notificări', icon: Bell, href: '#' },
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
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center p-3 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 transition-colors group"
            >
              <item.icon className="w-6 h-6 shrink-0" />
              <span className={`ml-3 font-medium ${!isSidebarOpen && 'hidden'}`}>
                {item.name}
              </span>
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center p-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <UserIcon size={18} />
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                <p className="text-sm font-medium">Proprietar</p>
              </div>
            )}
          </div>
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
             <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
               Sistem Activ
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
