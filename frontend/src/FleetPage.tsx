import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from './api/vehicleApi';
import type { Vehicle } from './api/vehicleApi';
import { Plus, Car, Search } from 'lucide-react';
import VehicleCard from './components/VehicleCard';

interface FleetPageProps {
  onEdit: (vehicle: Vehicle) => void;
  onOpenAdd: () => void;
  onShowIncidents: (vehicle: Vehicle) => void;
  onReportIncident: (vehicle: Vehicle) => void;
  onShowHistory: (vehicle: Vehicle) => void;
}

export default function FleetPage({ onEdit, onOpenAdd, onShowIncidents, onReportIncident, onShowHistory }: FleetPageProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

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

  const filteredVehicles = vehicles?.filter(v => 
    v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.vin.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Se încarcă flota...</p>
    </div>
  );
  
  if (error) return <div className="p-8 text-red-500 font-medium">Eroare la încărcarea datelor. Verifică dacă backend-ul este pornit.</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Flota Mea</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestionează vehiculele și monitorizează statusul acestora.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Caută după nr. înmatriculare, model sau VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm shadow-sm"
            />
          </div>
          
          <button 
            onClick={onOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 font-black text-sm w-full sm:w-auto uppercase tracking-wider"
          >
            <Plus size={20} strokeWidth={3} />
            Adaugă Vehicul
          </button>
        </div>
      </div>

      {vehicles?.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center shadow-sm">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
            <Car size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Niciun vehicul înregistrat</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-3 leading-relaxed font-medium">
            Începe prin a adăuga prima mașină în sistem pentru a-i monitoriza documentele și reviziile.
          </p>
          <button 
            onClick={onOpenAdd}
            className="mt-10 bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
          >
            Adaugă Prima Mașină
          </button>
        </div>
      ) : filteredVehicles?.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
           <Search size={48} className="mx-auto text-slate-200 mb-6" />
           <h3 className="text-xl font-black text-slate-900">Niciun rezultat găsit</h3>
           <p className="text-slate-400 font-medium mt-2">Nu am găsit niciun vehicul care să corespundă căutării "{search}".</p>
           <button onClick={() => setSearch('')} className="mt-6 text-blue-600 font-black text-sm uppercase tracking-wider hover:underline">Resetează căutarea</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVehicles?.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onEdit={onEdit}
              onDelete={handleDelete}
              onShowIncidents={onShowIncidents}
              onReportIncident={onReportIncident}
              onShowHistory={onShowHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
