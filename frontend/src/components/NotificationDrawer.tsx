import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { X, Check, Bell, Zap, AlertTriangle, AlertCircle, Info, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    enabled: isOpen,
    refetchInterval: isOpen ? 10000 : false
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
      case 'CRITICAL': return { bg: 'bg-rose-50', text: 'text-rose-600', icon: AlertCircle, color: 'rgb(244 63 94)' };
      case 'WARNING': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle, color: 'rgb(245 158 11)' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', icon: Info, color: 'rgb(59 130 246)' };
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-none">Notificări</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {unreadCount} mesaje noi
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-white">
              <button 
                onClick={() => triggerScanMutation.mutate()}
                disabled={triggerScanMutation.isPending}
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                <Zap size={14} className={triggerScanMutation.isPending ? 'animate-pulse text-amber-500' : ''} />
                Scanare Manuală
              </button>
              
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                >
                  <Check size={14} />
                  Marchează tot
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/30">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Se încarcă...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-black text-slate-900">Totul este în regulă</h4>
                  <p className="text-xs font-medium text-slate-400 mt-1">Nu ai nicio notificare momentan.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notif) => {
                    const styles = getTypeStyles(notif.type);
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                          notif.isRead 
                            ? 'bg-white/50 border-slate-100 opacity-60' 
                            : `bg-white border-white shadow-md shadow-slate-200/40 border-l-4`
                        }`}
                        style={!notif.isRead ? { borderLeftColor: styles.color } : {}}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.text}`}>
                            <styles.icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-black truncate pr-4 ${notif.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                                {notif.title}
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">
                                {new Date(notif.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                            <p className={`text-xs font-medium leading-relaxed ${notif.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                              {notif.message}
                            </p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <button
                            onClick={() => markAsReadMutation.mutate(notif.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-slate-400 transition-all active:scale-90"
                            title="Marchează ca citită"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10"
              >
                Închide Panoul
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
