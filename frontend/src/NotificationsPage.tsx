import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import type { Vehicle } from './api/vehicleApi';
import { Bell, Info, Clock, Calendar, Gauge, ExternalLink, Map, AlertTriangle, AlertCircle } from 'lucide-react';

interface NotificationsPageProps {
  onEdit: (vehicle: Vehicle) => void;
}

export default function NotificationsPage({ onEdit }: NotificationsPageProps) {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  const notifications = vehicles.flatMap(vehicle => {
    const alerts = [];
    const now = new Date();

    // ITP
    if (vehicle.itpExpiration) {
      const days = Math.ceil((new Date(vehicle.itpExpiration).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 30) {
        alerts.push({
          id: `${vehicle.id}-itp`,
          vehicleObj: vehicle,
          vehiclePlate: vehicle.licensePlate,
          type: days <= 0 ? 'CRITICAL' : 'WARNING',
          message: days <= 0 ? `ITP-ul a expirat!` : `ITP-ul expiră în ${days} zile.`,
          icon: Calendar
        });
      }
    }

    // RCA
    if (vehicle.rcaExpiration) {
      const days = Math.ceil((new Date(vehicle.rcaExpiration).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 30) {
        alerts.push({
          id: `${vehicle.id}-rca`,
          vehicleObj: vehicle,
          vehiclePlate: vehicle.licensePlate,
          type: days <= 0 ? 'CRITICAL' : 'WARNING',
          message: days <= 0 ? `RCA-ul a expirat!` : `RCA-ul expiră în ${days} zile.`,
          icon: ShieldCheckIcon
        });
      }
    }

    // Rovinietă
    if (vehicle.rovinietaExpiration) {
      const days = Math.ceil((new Date(vehicle.rovinietaExpiration).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 30) {
        alerts.push({
          id: `${vehicle.id}-ro`,
          vehicleObj: vehicle,
          vehiclePlate: vehicle.licensePlate,
          type: days <= 0 ? 'CRITICAL' : 'WARNING',
          message: days <= 0 ? `Rovinieta a expirat!` : `Rovinieta expiră în ${days} zile.`,
          icon: Map
        });
      }
    }

    // Incidente active
    if (vehicle.hasActiveIncidents) {
      alerts.push({
        id: `${vehicle.id}-incident`,
        vehicleObj: vehicle,
        vehiclePlate: vehicle.licensePlate,
        type: 'CRITICAL',
        message: 'Există probleme tehnice nerezolvate raportate de șofer.',
        icon: AlertTriangle
      });
    }

    // Maintenance KM
    const kmSinceLast = vehicle.odometer - vehicle.lastMaintenanceKm;
    if (kmSinceLast >= vehicle.maintenanceThresholdKm - 500) {
      alerts.push({
        id: `${vehicle.id}-maint-km`,
        vehicleObj: vehicle,
        vehiclePlate: vehicle.licensePlate,
        type: kmSinceLast >= vehicle.maintenanceThresholdKm ? 'CRITICAL' : 'WARNING',
        message: kmSinceLast >= vehicle.maintenanceThresholdKm 
          ? `Revizia este depășită cu ${kmSinceLast - vehicle.maintenanceThresholdKm} km!`
          : `Revizia se apropie (mai ai ${vehicle.maintenanceThresholdKm - kmSinceLast} km).`,
        icon: Gauge
      });
    }

    return alerts;
  });

  if (isLoading) {
    return <div className="p-8 text-center">Se încarcă notificările...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Bell className="text-blue-600" />
          Centru de Notificări
        </h2>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-bold rounded-full">
          {notifications.length} Alerte Active
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Totul este sub control</h3>
          <p className="text-slate-500 mt-1">Nu există documente care expiră sau revizii necesare iminente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-5 rounded-2xl border flex gap-4 transition-all group hover:shadow-md ${
                notif.type === 'CRITICAL' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                notif.type === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
              }`}>
                <notif.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900">{notif.vehiclePlate}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      notif.type === 'CRITICAL' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
                    }`}>
                      {notif.type}
                    </span>
                    <button 
                      onClick={() => onEdit(notif.vehicleObj)}
                      className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-blue-600 border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold uppercase"
                    >
                      <ExternalLink size={12} />
                      Rezolvă
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 mt-1">{notif.message}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 font-medium">
                  <Clock size={12} />
                  <span>Actualizat acum</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
