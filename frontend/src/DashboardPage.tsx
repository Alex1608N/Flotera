import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import { userApi } from './api/userApi';
import type { Vehicle } from './api/vehicleApi';
import VehicleCard from './components/VehicleCard';
import { AlertTriangle, CheckCircle2, Car, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardPageProps {
  onEdit: (vehicle: Vehicle) => void;
  onShowIncidents: (vehicle: Vehicle) => void;
  onReportIncident: (vehicle: Vehicle) => void;
  onShowHistory: (vehicle: Vehicle) => void;
}

export default function DashboardPage({ onEdit, onShowIncidents, onReportIncident, onShowHistory }: DashboardPageProps) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  // Logica de sortare: CRITICAL > WARNING > OK
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const priority = { CRITICAL: 0, WARNING: 1, OK: 2 } as Record<string, number>;
    return (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
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

  if (user?.role === 'DRIVER') {
    const assignedVehicle = vehicles[0]; // Drivers get only their assigned vehicle from API

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <User className="text-blue-400" />
                Salut, {user.name}!
              </h1>
              <p className="text-slate-400 font-medium">Iată detaliile vehiculului tău asignat.</p>
           </div>
           <Car className="absolute right-[-20px] bottom-[-20px] text-white/5 w-64 h-64 rotate-[-10deg]" />
        </div>

        {!assignedVehicle ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Car size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Niciun vehicul asignat</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              Momentan nu ai nicio mașină asignată. Contactează administratorul flotei pentru detalii.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest ml-1">Vehiculul Tău</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <VehicleCard 
                  vehicle={assignedVehicle} 
                  onEdit={() => {}} // Drivers usually don't edit basic vehicle info
                  onDelete={() => {}} 
                  onShowIncidents={onShowIncidents}
                  onReportIncident={onReportIncident}
                  onShowHistory={onShowHistory}
                />
                
                <div className="space-y-6">
                   <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-600/20">
                      <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Status Rapid</h4>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                               <CheckCircle2 size={24} />
                            </div>
                            <div>
                               <p className="text-xs font-bold opacity-70">Sănătate Vehicul</p>
                               <p className="text-lg font-black">{assignedVehicle.status === 'OK' ? 'Totul este în regulă' : 'Necesită Atenție'}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Acțiuni Rapide</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => onReportIncident(assignedVehicle)}
                           className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors gap-2"
                         >
                            <AlertTriangle size={24} />
                            <span className="text-xs font-black">Raport Problemă</span>
                         </button>
                         <button 
                           onClick={() => onShowHistory(assignedVehicle)}
                           className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors gap-2"
                         >
                            <Car size={24} />
                            <span className="text-xs font-black">Istoric Revizii</span>
                         </button>
                      </div>
                   </div>
                </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Car size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Flotă</p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${stats.critical > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Alerte Critice</p>
            <p className={`text-3xl font-black ${stats.critical > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.critical}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vehicule OK</p>
            <p className="text-3xl font-black text-emerald-600">{stats.ok}</p>
          </div>
        </motion.div>
      </div>

      {/* Sorted Fleet List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">STARE FLOTĂ</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">Monitorizare în timp real a întregii flote</p>
          </div>
          {stats.warning > 0 && (
            <div className="text-xs font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 uppercase tracking-wider animate-pulse">
              {stats.warning} vehicule necesită atenție
            </div>
          )}
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
               <Car size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Niciun vehicul în flotă</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Începe prin a adăuga prima mașină din secțiunea "Flota Mea" pentru a vedea statisticile aici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedVehicles.map((vehicle, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={vehicle.id}
              >
                <VehicleCard 
                  vehicle={vehicle} 
                  onEdit={onEdit}
                  onDelete={() => {}} 
                  onShowIncidents={onShowIncidents}
                  onReportIncident={onReportIncident}
                  onShowHistory={onShowHistory}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
