import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api/userApi';
import type { User } from './api/userApi';
import { supabase } from './supabaseClient';
import { Upload, User as UserIcon, Users, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: userApi.getAllDrivers
  });

  const updateProfilePicMutation = useMutation({
    mutationFn: ({ userId, url }: { userId: string, url: string }) => userApi.updateOtherUserProfilePicture(userId, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showFeedback('Poza de profil a fost actualizată!', 'success');
    }
  });

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, targetUserId: string) => {
    try {
      setUploadingId(targetUserId);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${targetUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      updateProfilePicMutation.mutate({ userId: targetUserId, url: data.publicUrl });
    } catch (error) {
      showFeedback('Eroare la încărcarea pozei!', 'error');
      console.error(error);
    } finally {
      setUploadingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Se încarcă lista de șoferi...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Toast Feedback */}
      {message && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" />
            MANAGEMENT ȘOFERI
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gestionează profilurile și accesul personalului tău</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600">{drivers.length}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Șoferi activi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={driver.id} 
            className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  {driver.profilePictureUrl ? (
                    <img src={driver.profilePictureUrl} alt={driver.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-slate-300" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-110 active:scale-95">
                  <Upload size={14} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, driver.id)} 
                    disabled={uploadingId === driver.id} 
                    className="hidden" 
                  />
                </label>
                {uploadingId === driver.id && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{driver.name}</h3>
              <div className="flex items-center gap-1 text-slate-400 text-sm font-medium mb-6">
                <Mail size={14} />
                {driver.email}
              </div>

              <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-center gap-6">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol Sistem</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-tighter border border-amber-100">
                        <Shield size={12} />
                        ȘOFER
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="bg-white rounded-[40px] p-16 text-center border border-slate-100 shadow-sm">
          <UserIcon size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-black text-slate-900">Niciun șofer înregistrat</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">Personalul tău trebuie să își creeze cont pentru a apărea în această listă.</p>
        </div>
      )}
    </div>
  );
}
