import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import { userApi } from './api/userApi';
import type { Vehicle } from './api/vehicleApi';
import VehicleCard from './components/VehicleCard';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  User, 
  Clock, 
  ShieldCheck, 
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  Settings,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardPageProps {
  onEdit: (vehicle: Vehicle) => void;
  onShowIncidents: (vehicle: Vehicle) => void;
  onReportIncident: (vehicle: Vehicle) => void;
  onShowHistory: (vehicle: Vehicle) => void;
  onNavigate?: (page: string) => void;
}

export default function DashboardPage({ 
  onEdit, 
  onShowIncidents, 
  onReportIncident, 
  onShowHistory,
  onNavigate 
}: DashboardPageProps) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser
  });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Driver View - keep it focused on their vehicle
  if (user?.role === 'DRIVER') {
    const assignedVehicle = vehicles[0]; 

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden"
        >
           <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <User className="text-blue-400" />
                Salut, {user.name}!
              </h1>
              <p className="text-slate-400 font-medium">Iată detaliile vehiculului tău asignat.</p>
           </div>
           <Car className="absolute right-[-20px] bottom-[-20px] text-white/5 w-64 h-64 rotate-[-10deg]" />
        </motion.div>

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
                  onEdit={() => {}} 
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

  // Owner View - Summary Insights
  const stats = {
    total: vehicles.length,
    critical: vehicles.filter(v => v.status === 'CRITICAL').length,
    warning: vehicles.filter(v => v.status === 'WARNING').length,
    ok: vehicles.filter(v => v.status === 'OK').length
  };

  const chartData = [
    { name: 'Critice', value: stats.critical, color: '#ef4444' },
    { name: 'Atenție', value: stats.warning, color: '#f59e0b' },
    { name: 'OK', value: stats.ok, color: '#10b981' },
  ].filter(d => d.value > 0);

  // Analiză expirări documente
  const expirations = vehicles.flatMap(v => {
    const items = [];
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const checkExpiration = (dateStr: string | null | undefined, type: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      if (date <= thirtyDaysLater) {
        return {
          id: `${v.id}-${type}`,
          licensePlate: v.licensePlate,
          vehicle: v,
          type,
          date,
          isExpired: date < today,
          daysLeft: Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        };
      }
      return null;
    };

    const itp = checkExpiration(v.itpExpiration, 'ITP');
    const rca = checkExpiration(v.rcaExpiration, 'RCA');
    const rov = checkExpiration(v.rovinietaExpiration, 'Rovinietă');

    if (itp) items.push(itp);
    if (rca) items.push(rca);
    if (rov) items.push(rov);

    return items;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Vehicule cu incidente active
  const activeIncidentVehicles = vehicles.filter(v => v.hasActiveIncidents);

  // Odometer Analytics Data
  const { data: history = [] } = useQuery({
    queryKey: ['odometer-history', vehicles[0]?.id],
    queryFn: () => vehicles[0] ? vehicleApi.getOdometerHistory(vehicles[0].id) : Promise.resolve([]),
    enabled: vehicles.length > 0
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Stats & Distribution */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Car size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flotă Totală</p>
               <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stats.critical > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-300'}`}>
                  <AlertTriangle size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerte Critice</p>
               <p className={`text-3xl font-black ${stats.critical > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.critical}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicule OK</p>
               <p className="text-3xl font-black text-emerald-600">{stats.ok}</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden h-full"
          >
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900">Distribuție Stare Flotă</h3>
                   <p className="text-xs text-slate-500 font-medium">Analiza sănătății vehiculelor</p>
                </div>
                <TrendingUp className="text-blue-500" />
             </div>
             
             <div className="h-[280px] w-full flex items-center justify-center">
                {vehicles.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-300 font-bold">Fără date disponibile</div>
                )}
                
                <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900">{vehicles.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mașini</span>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mt-8">
                {chartData.map((d) => (
                  <div key={d.name} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                     <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: d.color }} />
                     <span className="text-[10px] font-black text-slate-400 uppercase">{d.name}</span>
                     <span className="text-sm font-black text-slate-900">{Math.round((d.value / vehicles.length) * 100)}%</span>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>

        {/* Right Column: Expirations & Issues */}
        <div className="w-full md:w-[450px] space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   <Clock className="text-blue-600" size={20} />
                   <h3 className="text-lg font-black text-slate-900">Alerte Expirare</h3>
                </div>
                {expirations.length > 0 && (
                   <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">
                      {expirations.length} Alerte
                   </span>
                )}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-none">
                 {expirations.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
                         <ShieldCheck size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">Toate documentele sunt la zi pentru următoarele 30 de zile.</p>
                   </div>
                 ) : (
                   expirations.map((exp) => (
                     <button 
                        key={exp.id} 
                        onClick={() => onEdit(exp.vehicle)}
                        className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all hover:translate-x-1 text-left ${exp.isExpired ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${exp.isExpired ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                              {exp.type === 'ITP' ? <ClipboardCheck size={18} /> : <ShieldCheck size={18} />}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{exp.licensePlate}</p>
                              <p className={`text-[10px] font-black uppercase ${exp.isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                                 {exp.type} • {exp.isExpired ? 'EXPIRAT' : `Expiră în ${exp.daysLeft} zile`}
                              </p>
                           </div>
                        </div>
                        <Settings size={16} className="text-slate-300" />
                     </button>
                   ))
                 )}
              </div>

              {onNavigate && (
                <button 
                  onClick={() => onNavigate('fleet')}
                  className="mt-6 w-full py-4 bg-slate-900 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 group"
                >
                  Vezi Toată Flota
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              )}
           </div>

           {activeIncidentVehicles.length > 0 && (
              <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100">
                 <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-orange-600" size={20} />
                    <h3 className="text-sm font-black text-orange-900 uppercase tracking-wider">Incidente Active</h3>
                 </div>
                 <p className="text-xs text-orange-800 font-medium mb-4">
                    Există {activeIncidentVehicles.length} vehicule cu probleme raportate care necesită atenție.
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {activeIncidentVehicles.slice(0, 3).map(v => (
                       <span key={v.id} className="px-3 py-1 bg-white/50 text-orange-700 text-[10px] font-black rounded-lg border border-orange-200/50 uppercase">
                          {v.licensePlate}
                       </span>
                    ))}
                    {activeIncidentVehicles.length > 3 && (
                       <span className="text-[10px] font-black text-orange-400">+{activeIncidentVehicles.length - 3} altele</span>
                    )}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
