import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api/userApi';
import { vehicleApi } from './api/vehicleApi';
import type { Vehicle } from './api/vehicleApi';
import { supabase } from './supabaseClient';
import { Upload, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  const updateProfilePicMutation = useMutation({
    mutationFn: userApi.updateProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      updateProfilePicMutation.mutate(data.publicUrl);
    } catch (error) {
      alert('Error uploading avatar!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="p-8">Se încarcă profilul...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Profilul Meu</h2>
        
        <div className="flex items-center space-x-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} className="text-slate-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition shadow-lg">
              <Upload size={16} />
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Nume Complet</p>
              <p className="text-xl font-bold text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {user.role === 'OWNER' ? 'Proprietar' : 'Șofer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'DRIVER' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Vehicul Asignat</h2>
          {vehicles.length > 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate-800">{vehicles[0].licensePlate}</p>
                <p className="text-sm text-slate-500">{vehicles[0].model}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Nu ai niciun vehicul asignat în acest moment.</p>
          )}
        </div>
      )}
    </div>
  );
}
