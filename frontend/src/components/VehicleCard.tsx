import { Car, Edit2, Trash2, Calendar, ShieldCheck, Map, Gauge, Wrench, AlertCircle } from 'lucide-react';
import type { Vehicle } from '../api/vehicleApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../api/vehicleApi';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onShowIncidents?: (vehicle: Vehicle) => void;
  onReportIncident?: (vehicle: Vehicle) => void;
  onShowHistory?: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete, onShowIncidents, onReportIncident, onShowHistory }: VehicleCardProps) {
  const queryClient = useQueryClient();

  const getDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = (days: number | null) => {
    if (days === null) return { color: 'text-slate-400', border: 'border-slate-100', bg: 'bg-white', label: 'Nesetat' };
    if (days <= 0) return { color: 'text-red-600', border: 'border-red-100', bg: 'bg-red-50', label: days === 0 ? 'Expiră azi' : `Expirat (${Math.abs(days)}z)` };
    if (days <= 30) return { color: 'text-yellow-600', border: 'border-yellow-100', bg: 'bg-yellow-50', label: `${days} zile` };
    return { color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50', label: `${days} zile` };
  };

  const odometerMutation = useMutation({
    mutationFn: (newKm: number) => vehicleApi.updateOdometer(vehicle.id, newKm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: Error) => {
      alert(error.message || 'Eroare la actualizarea kilometrajului.');
    }
  });

  const handleUpdateOdometer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newKmStr = window.prompt(`Actualizează kilometrajul pentru ${vehicle.licensePlate} (Actual: ${vehicle.odometer} km):`, vehicle.odometer.toString());
    if (newKmStr !== null) {
      const newKm = parseInt(newKmStr);
      if (!isNaN(newKm)) {
        odometerMutation.mutate(newKm);
      }
    }
  };

  const statusConfig = {
    CRITICAL: { color: 'bg-red-500', text: 'CRITIC', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-200' },
    WARNING: { color: 'bg-yellow-500', text: 'ATENȚIE', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)] border-yellow-200' },
    OK: { color: 'bg-emerald-500', text: 'ACTIV', glow: 'shadow-sm border-gray-100 hover:shadow-md' }
  };

  const { color: statusColor, text: statusText, glow: glowEffect } = statusConfig[vehicle.status] || statusConfig.OK;

  // Calcul mentenanță
  const kmSinceLast = vehicle.odometer - vehicle.lastMaintenanceKm;
  const maintenanceProgress = Math.min(Math.max((kmSinceLast / vehicle.maintenanceThresholdKm) * 100, 0), 100);
  const isMaintenanceClose = kmSinceLast >= vehicle.maintenanceThresholdKm - 500;
  const isMaintenanceOver = kmSinceLast >= vehicle.maintenanceThresholdKm;

  return (
    <div 
      onClick={() => onEdit(vehicle)}
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 group border cursor-pointer ${glowEffect}`}
    >
      {/* Card Header (Image Area) */}
      <div className="aspect-video relative overflow-hidden bg-slate-50">
        {vehicle.imageUrl ? (
          <img 
            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${vehicle.imageUrl}`} 
            alt={vehicle.model} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <Car size={56} strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-wider mt-2">Fără poză</span>
          </div>
        )}
        
        {/* Status Badge (The "Traffic Light" indicator) */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 ${statusColor} text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
          {statusText}
        </div>

        {/* Incident Badge */}
        {vehicle.hasActiveIncidents && (
          <div 
            onClick={(e) => { e.stopPropagation(); onShowIncidents?.(vehicle); }}
            className="absolute top-3 left-3 bg-red-600 text-white p-1.5 rounded-full shadow-lg animate-bounce z-10"
            title="Vezi incidente active"
          >
            <AlertCircle size={16} />
          </div>
        )}

        {/* Action Overlay (Appears on Hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3 gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onShowHistory?.(vehicle); }}
            className="p-2 bg-white/20 hover:bg-blue-500 text-white rounded-lg backdrop-blur-sm transition-all"
            title="Istoric Service"
          >
            <Wrench size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onReportIncident?.(vehicle); }}
            className="p-2 bg-white/20 hover:bg-orange-500 text-white rounded-lg backdrop-blur-sm transition-all"
            title="Raportează problemă"
          >
            <AlertCircle size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }}
            className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-lg backdrop-blur-sm transition-all"
            title="Editează vehicul"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }}
            className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-all"
            title="Șterge vehicul"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Card Body (Details Area) */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-slate-900 leading-tight">{vehicle.model}</h3>
          <p className="text-sm font-mono text-blue-600 font-bold tracking-wider mt-1">
            {vehicle.licensePlate}
          </p>
        </div>

        {/* Documente & Mentenanță Section */}
        <div className="space-y-3 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ITP', date: vehicle.itpExpiration, icon: Calendar },
              { id: 'RCA', date: vehicle.rcaExpiration, icon: ShieldCheck },
              { id: 'RO', date: vehicle.rovinietaExpiration, icon: Map },
            ].map((doc) => {
              const days = getDaysRemaining(doc.date);
              const info = getStatusInfo(days);
              return (
                <div key={doc.id} className={`flex flex-col items-center p-2 rounded-lg border shadow-sm transition-colors ${info.bg} ${info.border}`}>
                  <doc.icon size={14} className={`${info.color} mb-1`} />
                  <span className={`text-[9px] font-bold uppercase ${info.color}`}>{doc.id}</span>
                  <span className={`text-[10px] font-extrabold truncate w-full text-center ${info.color}`}>
                    {info.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Odometer & Maintenance Progress */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-center gap-1.5 text-blue-600">
                <Gauge size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Kilometraj</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{vehicle.odometer.toLocaleString()} km</span>
                <button 
                  onClick={handleUpdateOdometer}
                  disabled={odometerMutation.isPending}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit2 size={10} />
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 text-slate-500">
                  <Wrench size={12} />
                  <span className="text-[9px] font-bold uppercase">Următoarea Revizie</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500">{(vehicle.lastMaintenanceKm + vehicle.maintenanceThresholdKm).toLocaleString()} km</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isMaintenanceOver ? 'bg-red-500' : isMaintenanceClose ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  style={{ width: `${maintenanceProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Seria Șasiu</p>
            <p className="text-xs font-mono font-medium text-slate-700 truncate w-24" title={vehicle.vin}>
              {vehicle.vin.substring(0, 8)}...
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-right">
            <div className="flex flex-col">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Șofer Asignat</p>
              <p className="text-xs font-bold text-slate-700 truncate w-24">
                {vehicle.assignedDriverName || 'Neasignat'}
              </p>
            </div>
            {vehicle.assignedDriverName && (
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                {vehicle.assignedDriverProfilePictureUrl ? (
                  <img src={vehicle.assignedDriverProfilePictureUrl} alt={vehicle.assignedDriverName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    {vehicle.assignedDriverName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
