import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from './api/notificationApi';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Clock, Check, Trash2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  });

  const triggerScanMutation = useMutation({
    mutationFn: notificationApi.triggerScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  });

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'CRITICAL': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', icon: AlertCircle, iconBg: 'bg-rose-500' };
      case 'WARNING': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', icon: AlertTriangle, iconBg: 'bg-amber-500' };
      case 'SUCCESS': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: CheckCircle2, iconBg: 'bg-emerald-500' };
      default: return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: Info, iconBg: 'bg-blue-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">SE ÎNCARCĂ ALERTELE...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            CENTRU DE CONTROL
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gerează alertele sistemului și expirările documentelor</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => triggerScanMutation.mutate()}
            disabled={triggerScanMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-black rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Zap size={16} className={triggerScanMutation.isPending ? 'animate-pulse text-amber-500' : ''} />
            SCANARE MANUALĂ
          </button>
          
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsReadMutation.mutate()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Check size={16} />
              MARCHEAZĂ TOT
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-16 text-center border border-slate-100 shadow-xl shadow-slate-200/50"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">SISTEM NOMINAL</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            Toate documentele sunt valide și nu au fost detectate incidente nerezolvate în flotă.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, index) => {
              const styles = getTypeStyles(notif.type);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={notif.id} 
                  className={`relative p-6 rounded-[32px] border-2 transition-all flex gap-6 ${
                    notif.isRead 
                      ? 'bg-white border-slate-50 opacity-60' 
                      : `${styles.bg} ${styles.border} shadow-lg shadow-slate-200/40`
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${styles.iconBg} text-white`}>
                    <styles.icon size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-lg font-black tracking-tight truncate ${notif.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ml-4">
                        {new Date(notif.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${notif.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <div className="flex items-center pl-4">
                      <button 
                        onClick={() => markAsReadMutation.mutate(notif.id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:shadow-md transition-all border border-slate-100 active:scale-90"
                        title="Marchează ca citită"
                      >
                        <Check size={20} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
