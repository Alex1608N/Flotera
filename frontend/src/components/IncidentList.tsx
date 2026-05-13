import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../api/vehicleApi';
import { X, CheckCircle2, AlertCircle, Clock, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IncidentListProps {
  vehicleId: number;
  vehiclePlate: string;
  onClose: () => void;
}

export default function IncidentList({ vehicleId, vehiclePlate, onClose }: IncidentListProps) {
  const queryClient = useQueryClient();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', vehicleId],
    queryFn: () => vehicleApi.getIncidents(vehicleId)
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => vehicleApi.resolveIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['service-history', vehicleId] });
    }
  });

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Incidente & Probleme</h3>
              <p className="text-sm text-slate-500 font-medium">{vehiclePlate}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400">Se încarcă incidentele...</div>
            ) : incidents.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-slate-500 font-medium">Nicio problemă raportată pentru acest vehicul.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div 
                    key={incident.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      incident.status === 'OPEN' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {incident.status === 'OPEN' ? (
                          <AlertCircle size={16} className="text-orange-600" />
                        ) : (
                          <CheckCircle2 size={16} className="text-slate-400" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          incident.status === 'OPEN' ? 'text-orange-700' : 'text-slate-500'
                        }`}>
                          {incident.status === 'OPEN' ? 'Activ' : 'Rezolvat'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(incident.createdAt).toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                      {incident.description}
                    </p>
                    {incident.imageUrl && (
                      <div 
                        className="mb-4 rounded-xl overflow-hidden border border-slate-200 relative group cursor-pointer"
                        onClick={() => setZoomedImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}${incident.imageUrl}`)}
                      >
                        <img 
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${incident.imageUrl}`} 
                          alt="Incident" 
                          className="w-full h-auto object-cover max-h-48 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                        </div>
                      </div>
                    )}
                    {incident.status === 'OPEN' && (
                      <button 
                        onClick={() => resolveMutation.mutate(incident.id)}
                        disabled={resolveMutation.isPending}
                        className="w-full py-2 bg-white border border-orange-200 text-orange-700 text-xs font-bold rounded-xl hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm"
                      >
                        Marchează ca Rezolvat
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Închide
            </button>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full"
            >
              <img 
                src={zoomedImage} 
                alt="Zoomed Incident" 
                className="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
              />
              <button 
                onClick={() => setZoomedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
