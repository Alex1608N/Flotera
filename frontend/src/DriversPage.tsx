import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api/userApi';
import { vehicleApi } from './api/vehicleApi';
import { Upload, User as UserIcon, Users, Mail, CheckCircle2, AlertCircle, Car, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [assigningDriverId, setAssigningDriverId] = useState<string | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: userApi.getAllDrivers
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ vehicleId, driverId }: { vehicleId: number, driverId: string | null }) => vehicleApi.assignDriver(vehicleId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showFeedback('Vehiculul a fost asignat cu succes!', 'success');
      setAssigningDriverId(null);
    }
  });

  const toggleRoleMutation = useMutation({
    mutationFn: userApi.toggleRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showFeedback('Rolul a fost actualizat!', 'success');
    }
  });

  const updateDriverRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: 'OWNER' | 'DRIVER' }) => userApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showFeedback('Gradul utilizatorului a fost actualizat!', 'success');
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

      await userApi.uploadOtherUserProfilePictureFile(targetUserId, file);
      
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showFeedback('Poza de profil a fost actualizată!', 'success');
    } catch (error) {
      showFeedback('Eroare la încărcarea pozei!', 'error');
      console.error(error);
    } finally {
      setUploadingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Se încarcă lista de șoferi...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
      {/* Toast Feedback */}
      {message && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {assigningDriverId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-900 mb-4">Asignează un vehicul</h3>
              <p className="text-slate-500 mb-6 text-sm">Selectează vehiculul pe care vrei să îl conduca acest șofer.</p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => assignDriverMutation.mutate({ vehicleId: v.id, driverId: assigningDriverId })}
                    className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-black text-slate-900 group-hover:text-blue-700">{v.licensePlate}</p>
                      <p className="text-xs font-medium text-slate-500">{v.model}</p>
                    </div>
                    {v.assignedDriverId === assigningDriverId && (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    )}
                  </button>
                ))}
                {vehicles.length === 0 && (
                   <p className="text-center text-slate-400 py-4 text-sm">Nu există vehicule în flotă.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setAssigningDriverId(null)}
                  className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Anulează
                </button>
                {/* Option to unassign all vehicles for this driver */}
                <button 
                  onClick={() => {
                     // Find vehicles currently assigned to this driver and unassign them
                     vehicles.filter(v => v.assignedDriverId === assigningDriverId).forEach(v => {
                         assignDriverMutation.mutate({ vehicleId: v.id, driverId: null });
                     });
                     setAssigningDriverId(null);
                  }}
                  className="flex-1 py-3 text-red-600 font-bold border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-sm"
                >
                  Detașează
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" />
            MANAGEMENT ȘOFERI
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gestionează profilurile și accesul personalului tău</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Buton simulare schimbare rol */}
          <button 
            onClick={() => toggleRoleMutation.mutate()}
            disabled={toggleRoleMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-blue-600 ${toggleRoleMutation.isPending ? 'animate-spin' : ''}`} />
            {currentUser?.role === 'OWNER' ? 'Devino Șofer' : 'Revino la Proprietar'}
          </button>

          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="text-2xl font-black text-blue-600">{drivers.length}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Șoferi activi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver, index) => {
          const assignedVehicles = vehicles.filter(v => v.assignedDriverId === driver.id);
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={driver.id} 
              className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              {/* Profile Image Section */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                    {driver.profilePictureUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${driver.profilePictureUrl}`} alt={driver.name} className="w-full h-full object-cover" />
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
                <div className="flex items-center gap-1 text-slate-400 text-sm font-medium mb-4">
                  <Mail size={14} />
                  {driver.email}
                </div>

                {/* Role Badge & Promote Button */}
                <div className="mb-6 flex flex-col items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    driver.role === 'OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {driver.role === 'OWNER' ? 'Proprietar' : 'Șofer'}
                  </span>
                  
                  {currentUser?.email === 'alex@flotera.ro' && (
                    <button
                      onClick={() => updateDriverRoleMutation.mutate({ 
                        userId: driver.id, 
                        role: driver.role === 'OWNER' ? 'DRIVER' : 'OWNER' 
                      })}
                      disabled={updateDriverRoleMutation.isPending}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4 decoration-blue-200 hover:decoration-blue-600 transition-all"
                    >
                      {driver.role === 'OWNER' ? 'Retrogradează la Șofer' : 'Promovează la Proprietar'}
                    </button>
                  )}
                </div>

                {/* Assignment & Role */}
                <div className="w-full pt-6 border-t border-slate-50 flex flex-col gap-4">
                  {assignedVehicles.length > 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                          <Car size={14} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conduce</p>
                          <p className="text-xs font-bold text-slate-900">{assignedVehicles[0].licensePlate}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAssigningDriverId(driver.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                      >
                        Schimbă
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAssigningDriverId(driver.id)}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-bold group/btn"
                    >
                      <Car size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Asignează un vehicul
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
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
