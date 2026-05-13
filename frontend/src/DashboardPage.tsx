import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import type { Vehicle } from './api/vehicleApi';
import VehicleCard from './components/VehicleCard';
import { AlertTriangle, CheckCircle2, Car } from 'lucide-react';

interface DashboardPageProps {
  onEdit: (vehicle: Vehicle) => void;
  onShowIncidents: (vehicle: Vehicle) => void;
  onReportIncident: (vehicle: Vehicle) => void;
  onShowHistory: (vehicle: Vehicle) => void;
}

export default function DashboardPage({ onEdit, onShowIncidents, onReportIncident, onShowHistory }: DashboardPageProps) {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  // Logica de sortare: CRITICAL > WARNING > OK
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const priority = { CRITICAL: 0, WARNING: 1, OK: 2 };
    return priority[a.status] - priority[b.status];
  });

  const stats = {
    total: vehicles.length,
    critical: vehicles.filter(v => v.status === 'CRITICAL').length,
    warning: vehicles.filter(v => v.status === 'WARNING').length,
    ok: vehicles.filter(v => v.status === 'OK').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Car size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Flotă</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.critical > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Alerte Critice</p>
            <p className={`text-2xl font-bold ${stats.critical > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.critical}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Vehicule OK</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.ok}</p>
          </div>
        </div>
      </div>

      {/* Sorted Fleet List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Stare Flotă
          </h2>
          {stats.warning > 0 && (
            <div className="text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
              {stats.warning} vehicule necesită atenție
            </div>
          )}
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Car size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Niciun vehicul în flotă</h3>
            <p className="text-slate-500 mt-1">Începe prin a adăuga prima mașină din secțiunea "Flota Mea".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onEdit={onEdit}
                onDelete={() => {}} 
                onShowIncidents={onShowIncidents}
                onReportIncident={onReportIncident}
                onShowHistory={onShowHistory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
