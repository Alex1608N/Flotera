import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api/userApi';
import { vehicleApi } from './api/vehicleApi';
import type { Vehicle } from './api/vehicleApi';
import { supabase } from './supabaseClient';
import { Upload, User as UserIcon, Save, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Car } from 'lucide-react';
import { getImageUrl } from './api/imageUtils';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  // Pattern pentru sincronizarea stării din props (recomandat de React în loc de useEffect)
  const [prevUserId, setPrevUserId] = useState<string | undefined>(undefined);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setName(user?.name || '');
  }

  const updateNameMutation = useMutation({
    mutationFn: userApi.updateName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showFeedback('Numele a fost actualizat!', 'success');
    }
  });

  const toggleRoleMutation = useMutation({
    mutationFn: userApi.toggleRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showFeedback('Rolul a fost schimbat pentru simulare!', 'success');
    }
  });

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];

      await userApi.uploadProfilePicture(file);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showFeedback('Poza de profil a fost actualizată!', 'success');
    } catch (error) {
      showFeedback('Eroare la încărcarea pozei!', 'error');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateNameMutation.mutate(name);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showFeedback('Parolele nu coincid!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showFeedback('Parola trebuie să aibă cel puțin 6 caractere!', 'error');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      showFeedback(error.message, 'error');
    } else {
      showFeedback('Parola a fost schimbată cu succes!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!user) return <div className="p-8">Se încarcă profilul...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Toast Feedback */}
      {message && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                {user.profilePictureUrl ? (
                  <img src={getImageUrl(user.profilePictureUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-110 active:scale-95">
                <Upload size={18} />
                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{user.email}</p>
              <div className="mt-4 flex flex-col gap-3 items-center">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {user.role === 'OWNER' ? 'Proprietar' : 'Șofer'}
                </span>
                
                {/* Buton simulare schimbare rol - DOAR PENTRU ALEX */}
                {user.email === 'alex@flotera.ro' && (
                  <button 
                    onClick={() => toggleRoleMutation.mutate()}
                    disabled={toggleRoleMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                    title="Acest buton este pentru testare. Schimbă rolul tău curent."
                  >
                    <RefreshCw size={14} className={toggleRoleMutation.isPending ? 'animate-spin' : ''} />
                    Simulare Rol: {user.role === 'OWNER' ? 'Devino Șofer' : 'Devino Proprietar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {user.role === 'DRIVER' && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Vehicul Asignat</h4>
              {vehicles.length > 0 ? (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Car size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{vehicles[0].licensePlate}</p>
                    <p className="text-xs text-slate-500">{vehicles[0].model}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm text-center py-4">Niciun vehicul asignat</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Update Name Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <UserIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Informații Personale</h2>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nume Complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Introduceți numele"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateNameMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Save size={18} />
                  {updateNameMutation.isPending ? 'Se salvează...' : 'Salvează Modificările'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                <KeyRound size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Securitate Cont</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Parolă Nouă</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Minim 6 caractere"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmă Parola</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Repetă parola"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  <KeyRound size={18} />
                  Schimbă Parola
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
