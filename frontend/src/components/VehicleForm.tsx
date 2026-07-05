import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../api/vehicleApi';
import { userApi } from '../api/userApi';
import type { Vehicle } from '../api/vehicleApi';
import { X, Upload, Car, User } from 'lucide-react';
import { getImageUrl } from '../api/imageUtils';

interface VehicleFormProps {
  onClose: () => void;
  vehicleToEdit?: Vehicle | null;
}

export default function VehicleForm({ onClose, vehicleToEdit }: VehicleFormProps) {
  const queryClient = useQueryClient();
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: userApi.getAllDrivers
  });

  const [formData, setFormData] = useState({
    licensePlate: vehicleToEdit?.licensePlate || '',
    model: vehicleToEdit?.model || '',
    brand: vehicleToEdit?.brand || '',
    color: vehicleToEdit?.color || '',
    fuelType: vehicleToEdit?.fuelType || '',
    year: vehicleToEdit?.year || new Date().getFullYear(),
    vin: vehicleToEdit?.vin || '',
    itpExpiration: vehicleToEdit?.itpExpiration || '',
    rcaExpiration: vehicleToEdit?.rcaExpiration || '',
    rovinietaExpiration: vehicleToEdit?.rovinietaExpiration || '',
    lastMaintenanceKm: vehicleToEdit?.lastMaintenanceKm || 0,
    lastMaintenanceDate: vehicleToEdit?.lastMaintenanceDate || '',
    maintenanceThresholdKm: vehicleToEdit?.maintenanceThresholdKm || 10000,
    maintenanceThresholdMonths: vehicleToEdit?.maintenanceThresholdMonths || 12,
    assignedDriverId: vehicleToEdit?.assignedDriverId || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = !!vehicleToEdit;

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Date trimitere
      const submitData = {
        ...formData,
        itpExpiration: formData.itpExpiration || null,
        rcaExpiration: formData.rcaExpiration || null,
        rovinietaExpiration: formData.rovinietaExpiration || null,
        lastMaintenanceDate: formData.lastMaintenanceDate || null,
      };

      let vehicle;
      if (isEditMode && vehicleToEdit) {
        // 1. Update
        vehicle = await vehicleApi.update(vehicleToEdit.id, submitData);
      } else {
        // 1. Create
        vehicle = await vehicleApi.create(submitData);
      }
      
      // 2. Upload imagine
      if (imageFile && vehicle) {
        await vehicleApi.uploadImage(vehicle.id, imageFile);
      }
      return vehicle;
    },
    onSuccess: () => {
      // Invalideaza cache
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onClose();
    },
    onError: (error: Error | unknown) => {
      // Eroare backend
      console.error('Error saving vehicle:', error);
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Eroare la salvarea vehiculului. Verificați datele.';
      setErrorMsg(msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    saveMutation.mutate();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editează Vehicul' : 'Adaugă Vehicul'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Upload */}
            <div className="flex justify-center">
              <label className="relative group cursor-pointer w-32 h-32 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : vehicleToEdit?.imageUrl ? (
                  <img src={getImageUrl(vehicleToEdit.imageUrl)} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="text-blue-500 mb-2" size={24} />
                    <span className="text-xs text-blue-600 font-medium">Încarcă Foto</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium">Schimbă</span>
                </div>
              </label>
            </div>

            {/* Campuri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Vehicul</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="text-gray-400" size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="ex. Logan"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>

              {/* Brand / Producator */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Marcă (Brand)</label>
                <input
                  type="text"
                  required
                  placeholder="ex. BMW, Dacia, Toyota"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                />
              </div>

              {/* Culoare */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Culoare (conform talon)</label>
                <input
                  type="text"
                  placeholder="ex. ALB, NEGRU, ROSU METALIZAT"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow uppercase"
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value.toUpperCase()})}
                />
              </div>

              {/* Tip Combustibil */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip Combustibil</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  value={formData.fuelType}
                  onChange={e => setFormData({...formData, fuelType: e.target.value})}
                >
                  <option value="">-- Selectează combustibil --</option>
                  <option value="BENZINA">Benzină</option>
                  <option value="MOTORINA">Motorină</option>
                  <option value="HIBRID">Hibrid</option>
                  <option value="ELECTRIC">Electric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nr. Înmatriculare</label>
                <input 
                  type="text" 
                  required
                  placeholder="B-123-ABC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow font-mono uppercase"
                  value={formData.licensePlate}
                  onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">An Fabricație</label>
                <input 
                  type="number" 
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                />
              </div> 

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seria de Șasiu (VIN)</label>
                <input 
                  type="text" 
                  required
                  minLength={17}
                  maxLength={17}
                  placeholder="17 caractere"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow font-mono uppercase"
                  value={formData.vin}
                  onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Șofer Asignat</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                  </div>
                  <select 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none"
                    value={formData.assignedDriverId}
                    onChange={e => setFormData({...formData, assignedDriverId: e.target.value})}
                  >
                    <option value="">-- Fără șofer asignat --</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Documente */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Documente Legale</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expirare ITP</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.itpExpiration}
                      onChange={e => setFormData({...formData, itpExpiration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expirare RCA</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.rcaExpiration}
                      onChange={e => setFormData({...formData, rcaExpiration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expirare Rovinietă</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.rovinietaExpiration}
                      onChange={e => setFormData({...formData, rovinietaExpiration: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Mentenanta */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Mentenanță & Praguri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ultima Revizie (KM)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.lastMaintenanceKm}
                      onChange={e => setFormData({...formData, lastMaintenanceKm: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data Ultimei Revizii</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.lastMaintenanceDate}
                      onChange={e => setFormData({...formData, lastMaintenanceDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Prag Revizie (KM)</label>
                    <input 
                      type="number" 
                      min="1000"
                      step="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.maintenanceThresholdKm}
                      onChange={e => setFormData({...formData, maintenanceThresholdKm: parseInt(e.target.value) || 10000})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Prag Revizie (Luni)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="48"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      value={formData.maintenanceThresholdMonths}
                      onChange={e => setFormData({...formData, maintenanceThresholdMonths: parseInt(e.target.value) || 12})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button 
            type="submit" 
            form="vehicle-form"
            disabled={saveMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 flex justify-center"
          >
            {saveMutation.isPending ? 'Se salvează...' : isEditMode ? 'Actualizează Vehicul' : 'Salvează Vehicul'}
          </button>
        </div>
      </div>
    </div>
  );
}
