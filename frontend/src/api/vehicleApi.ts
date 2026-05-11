import axios from 'axios';
import { supabase } from '../supabaseClient';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor pentru a adăuga automat token-ul JWT în fiecare cerere
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface Vehicle {
  id: number;
  licensePlate: string;
  model: string;
  year: number;
  vin: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  imageUrl?: string;
  ownerId: string;
  itpExpiration?: string;
  rcaExpiration?: string;
  rovinietaExpiration?: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  odometer: number;
  lastOdometerUpdate?: string;
  lastMaintenanceKm: number;
  lastMaintenanceDate?: string;
  maintenanceThresholdKm: number;
  maintenanceThresholdMonths: number;
  hasActiveIncidents: boolean;
}

export interface Incident {
  id: number;
  vehicleId: number;
  description: string;
  imageUrl?: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export interface ServiceRecord {
  id: number;
  vehicleId: number;
  date: string;
  odometer: number;
  description: string;
  cost?: number;
  type: 'ROUTINE_MAINTENANCE' | 'REPAIR' | 'TYRE_CHANGE' | 'INSPECTION';
}

export const vehicleApi = {
  getAll: () => api.get<Vehicle[]>('/vehicles').then(res => res.data),
  create: (data: Omit<Vehicle, 'id' | 'imageUrl' | 'ownerId' | 'status' | 'odometer' | 'lastOdometerUpdate' | 'hasActiveIncidents'>) => api.post<Vehicle>('/vehicles', data).then(res => res.data),
  update: (id: number, data: Omit<Vehicle, 'id' | 'imageUrl' | 'ownerId' | 'status' | 'odometer' | 'lastOdometerUpdate' | 'hasActiveIncidents'>) => api.put<Vehicle>(`/vehicles/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ imageUrl: string }>(`/vehicles/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  updateOdometer: (id: number, odometer: number) => api.post<Vehicle>(`/vehicles/${id}/odometer`, { odometer }).then(res => res.data),
  
  // Incidente
  getIncidents: (vehicleId: number) => api.get<Incident[]>(`/vehicles/${vehicleId}/incidents`).then(res => res.data),
  reportIncident: (vehicleId: number, description: string, file?: File) => {
    const formData = new FormData();
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }
    return api.post<Incident>(`/vehicles/${vehicleId}/incidents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  resolveIncident: (incidentId: number) => api.patch<Incident>(`/vehicles/incidents/${incidentId}/resolve`).then(res => res.data),

  // Istoric Service
  getServiceHistory: (vehicleId: number) => api.get<ServiceRecord[]>(`/vehicles/${vehicleId}/service-history`).then(res => res.data),
  addServiceRecord: (vehicleId: number, data: Omit<ServiceRecord, 'id' | 'vehicleId'>) => api.post<ServiceRecord>(`/vehicles/${vehicleId}/service-history`, data).then(res => res.data),
  assignDriver: (vehicleId: number, driverId: string | null) => api.put<Vehicle>(`/vehicles/${vehicleId}/driver`, { driverId: driverId || '' }).then(res => res.data)
};

export default api;
