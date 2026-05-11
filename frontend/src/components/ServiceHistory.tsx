import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../api/vehicleApi';
import type { ServiceRecord } from '../api/vehicleApi';
import { X, Wrench, PenTool, RefreshCcw, ClipboardCheck, Clock, Plus, DollarSign, Gauge } from 'lucide-react';
import { useState } from 'react';

interface ServiceHistoryProps {
  vehicleId: number;
  vehiclePlate: string;
  onClose: () => void;
}

const TYPE_CONFIG = {
  ROUTINE_MAINTENANCE: { icon: RefreshCcw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Revizie Periodică' },
  REPAIR: { icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Reparație' },
  TYRE_CHANGE: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Schimb Anvelope' },
  INSPECTION: { icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Verificare/Inspecție' }
};

export default function ServiceHistory({ vehicleId, vehiclePlate, onClose }: ServiceHistoryProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: 0,
    description: '',
    cost: 0,
    type: 'ROUTINE_MAINTENANCE' as ServiceRecord['type']
  });

  const { data: history = [], isLoading } = useQuery({
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Istoric Service (carVertical Style)</h3>
            <p className="text-sm text-slate-500 font-medium">{vehiclePlate}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isAdding ? (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 mb-8">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                Adaugă Înregistrare Nouă
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Data</label>
                  <input 
                    type="date" required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kilometraj (KM)</label>
                  <input 
                    type="number" required 
                    value={formData.odometer}
                    onChange={e => setFormData({...formData, odometer: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tip Intervenție</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as ServiceRecord['type']})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Cost (RON)</label>
                  <input 
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Descriere Detaliată</label>
                <textarea 
                  required 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Schimb ulei Castrol 5W30, filtre aer/polen/motorină..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none h-24"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Anulează</button>
                <button type="submit" disabled={addMutation.isPending} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  Salvează în Istoric
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all mb-8 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="font-bold">Adaugă o nouă intervenție de service</span>
            </button>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Se încarcă istoricul...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
              <Wrench size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Nicio înregistrare de service găsită.</p>
            </div>
          ) : (
            <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-slate-100">
              {history.map((record) => {
                const config = TYPE_CONFIG[record.type];
                return (
                  <div key={record.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[25px] mt-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${config.color.replace('text', 'bg')}`}></div>
                    
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                            <config.icon size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{config.label}</span>
                            <span className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          </div>
                        </div>
                        {record.cost && (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg text-sm">
                            <DollarSign size={14} />
                            {record.cost.toLocaleString()} RON
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">{record.description}</p>
                      
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Gauge size={14} />
                          <span className="text-xs font-bold">{record.odometer.toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
