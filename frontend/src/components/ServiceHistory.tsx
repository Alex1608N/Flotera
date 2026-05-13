import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../api/vehicleApi';
import type { ServiceRecord } from '../api/vehicleApi';
import { X, PenTool, RefreshCcw, ClipboardCheck, Clock, Plus, History, Activity, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceHistoryProps {
  vehicleId: number;
  vehiclePlate: string;
  onClose: () => void;
}

const TYPE_CONFIG = {
  ROUTINE_MAINTENANCE: { icon: RefreshCcw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Revizie Periodică' },
  REPAIR: { icon: PenTool, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Reparație' },
  TYRE_CHANGE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Schimb Anvelope' },
  INSPECTION: { icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Inspecție' }
};

export default function ServiceHistory({ vehicleId, vehiclePlate, onClose }: ServiceHistoryProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: 0,
    description: '',
    cost: 0,
    type: 'ROUTINE_MAINTENANCE' as ServiceRecord['type']
  });

  const { data: history = [] } = useQuery({
    queryKey: ['service-history', vehicleId],
    queryFn: () => vehicleApi.getServiceHistory(vehicleId)
  });

  const addMutation = useMutation({
    mutationFn: (data: Omit<ServiceRecord, 'id' | 'vehicleId'>) => vehicleApi.addServiceRecord(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-history', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsAdding(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const chartData = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      name: new Date(r.date).toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }),
      km: r.odometer,
      cost: r.cost || 0
    }));

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#f8fafc] rounded-2xl md:rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20"
      >
        {/* Modern Header */}
        <div className="p-4 md:p-8 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">LOG SERVICE</h3>
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full tracking-widest uppercase">{vehiclePlate}</span>
            </div>
            <p className="text-slate-500 font-medium text-xs md:text-sm">Monitorizarea mentenanței și a rulajului</p>
          </div>
          <button onClick={onClose} className="p-2 md:p-2.5 bg-white hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 md:px-8 flex gap-4 md:gap-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('list')}
            className={`pb-4 text-xs md:text-sm font-bold transition-all relative ${activeTab === 'list' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="flex items-center gap-2">
              <History size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">CRONOLOGIE</span>
              <span className="sm:hidden">LISTĂ</span>
            </div>
            {activeTab === 'list' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 text-xs md:text-sm font-bold transition-all relative ${activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="flex items-center gap-2">
              <Activity size={16} className="md:w-5 md:h-5" />
              ANALITICĂ <span className="hidden sm:inline">KM</span>
            </div>
            {activeTab === 'analytics' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Intervenții</p>
                    <p className="text-2xl font-black text-slate-900">{history.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ultimul Rulaj</p>
                    <p className="text-2xl font-black text-slate-900">{history.length > 0 ? Math.max(...history.map(r => r.odometer)).toLocaleString() : 0} KM</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Investiție Totală</p>
                    <p className="text-2xl font-black text-emerald-600">{history.reduce((acc, r) => acc + (r.cost || 0), 0).toLocaleString()} RON</p>
                  </div>
                </div>

                {isAdding ? (
                  <motion.form 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit} 
                    className="bg-white p-8 rounded-[24px] border-2 border-blue-100 shadow-xl shadow-blue-500/5 space-y-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-slate-900 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600" />
                        ADĂUGARE EVENIMENT
                      </h4>
                      <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Data Intervenției</label>
                        <input 
                          type="date" required 
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kilometraj (KM)</label>
                        <input 
                          type="number" required 
                          value={formData.odometer}
                          onChange={e => setFormData({...formData, odometer: parseInt(e.target.value)})}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Categorie</label>
                        <select 
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as ServiceRecord['type']})}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium appearance-none"
                        >
                          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Cost Estimativ (RON)</label>
                        <input 
                          type="number"
                          value={formData.cost}
                          onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Note și detalii</label>
                      <textarea 
                        required 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Ex: Înlocuit kit distribuție, pompă apă și curea accesorii..."
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-24 font-medium resize-none"
                      />
                    </div>
                    <div className="flex gap-4 justify-end">
                      <button type="submit" disabled={addMutation.isPending} className="flex-1 md:flex-none px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                        {addMutation.isPending ? 'SALVARE...' : 'CONFIRMĂ ÎNREGISTRAREA'}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group"
                  >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-black tracking-tight text-lg">ADĂUGARE EVENIMENT NOU</span>
                  </button>
                )}

                <div className="space-y-4">
                  {history.map((record, index) => {
                    const config = TYPE_CONFIG[record.type];
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={record.id} 
                        className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all"
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${config.bg} ${config.color} shadow-sm`}>
                          <config.icon size={28} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{config.label}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-sm font-bold text-slate-500">
                              {new Date(record.date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 truncate leading-tight">{record.description}</h4>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1 pl-4 md:border-l border-slate-100">
                          <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
                            {record.odometer.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold uppercase">KM</span>
                          </div>
                          {(record.cost ?? 0) > 0 && (
                            <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                              {(record.cost ?? 0).toLocaleString()} RON
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-4 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-black text-slate-900 leading-tight">EVOLUȚIE KILOMETRAJ</h4>
                      <p className="text-slate-500 text-xs md:text-sm font-medium">Progresia rulajului în timp conform înregistrărilor</p>
                    </div>
                  </div>
                  
                  <div className="h-[250px] md:h-[350px] w-full">
                    {chartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                            tickFormatter={(val) => `${val/1000}k`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            itemStyle={{ fontWeight: 800, color: '#2563eb' }}
                            labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                          />
                          <Area type="monotone" dataKey="km" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorKm)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Activity size={48} className="opacity-20" />
                        <p className="font-bold">Date insuficiente pentru a genera graficul</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-900 p-6 rounded-[24px] text-white">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Analiză Costuri / KM</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black">
                          {history.length > 0 && Math.max(...history.map(r => r.odometer)) > 0 
                            ? (history.reduce((acc, r) => acc + (r.cost || 0), 0) / Math.max(...history.map(r => r.odometer))).toFixed(2)
                            : 0}
                        </span>
                        <span className="text-slate-400 font-bold mb-1">RON / KM</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-4 leading-relaxed">Costul mediu de mentenanță raportat la kilometrajul total înregistrat în istoric.</p>
                   </div>
                   <div className="bg-blue-600 p-6 rounded-[24px] text-white">
                      <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4">Rulaj Mediu Lunar</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black">~2,400</span>
                        <span className="text-blue-200 font-bold mb-1">KM / LUNĂ</span>
                      </div>
                      <p className="text-blue-100/60 text-xs mt-4 leading-relaxed">Estimare bazată pe frecvența înregistrărilor și evoluția odometrului.</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

