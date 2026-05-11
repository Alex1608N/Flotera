import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import type { Vehicle } from './api/vehicleApi';
import { Plus, Car } from 'lucide-react';
import VehicleCard from './components/VehicleCard';

interface FleetPageProps {
  onEdit: (vehicle: Vehicle) => void;
  onOpenAdd: () => void;
  onShowIncidents: (vehicle: Vehicle) => void;
  onReportIncident: (vehicle: Vehicle) => void;
}

export default function FleetPage({ onEdit, onOpenAdd, onShowIncidents, onReportIncident }: FleetPageProps) {
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest vehicul? Acțiunea este ireversibilă.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Se încarcă flota...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">Eroare la încărcarea datelor. Verifică dacă backend-ul este pornit.</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Flota Mea</h1>
          <p className="text-slate-500 mt-1">Gestionează vehiculele și statusul acestora.</p>
        </div>
        <button 
          onClick={onOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-blue-500/20 font-semibold"
        >
          <Plus size={20} strokeWidth={2.5} />
          Adaugă Vehicul
        </button>
      </div>

      {vehicles?.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Car size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Niciun vehicul înregistrat</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
            Începe prin a adăuga prima mașină în sistem pentru a-i monitoriza documentele.
          </p>
          <button 
            onClick={onOpenAdd}
            className="mt-8 bg-slate-900 text-white font-semibold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Adaugă Prima Mașină
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {vehicles?.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onEdit={onEdit}
              onDelete={handleDelete}
              onShowIncidents={onShowIncidents}
              onReportIncident={onReportIncident}
            />
          ))}
        </div>
      )}
    </div>
  );
}
