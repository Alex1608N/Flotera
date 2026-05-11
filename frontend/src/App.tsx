import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import Login from './Login'
import Layout from './Layout'
import FleetPage from './FleetPage'
import DashboardPage from './DashboardPage'
import NotificationsPage from './NotificationsPage'
import VehicleForm from './components/VehicleForm'
import IncidentList from './components/IncidentList'
import type { Vehicle } from './api/vehicleApi'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [incidentVehicle, setIncidentVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session || !session.user) {
    return <Login />
  }

  const handleEdit = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setVehicleToEdit(null);
  };

  const handleShowIncidents = (vehicle: Vehicle) => {
    setIncidentVehicle(vehicle);
  };

  return (
    <Layout 
      userEmail={session.user.email ?? ''} 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
    >
      {currentPage === 'dashboard' && <DashboardPage onEdit={handleEdit} onShowIncidents={handleShowIncidents} />}
      {currentPage === 'fleet' && (
        <FleetPage 
          onEdit={handleEdit} 
          onOpenAdd={() => { setVehicleToEdit(null); setIsFormOpen(true); }}
          onShowIncidents={handleShowIncidents}
        />
      )}
      {currentPage === 'notifications' && <NotificationsPage onEdit={handleEdit} />}

      {isFormOpen && (
        <VehicleForm 
          onClose={handleCloseForm} 
          vehicleToEdit={vehicleToEdit} 
        />
      )}

      {incidentVehicle && (
        <IncidentList 
          vehicleId={incidentVehicle.id} 
          vehiclePlate={incidentVehicle.licensePlate} 
          onClose={() => setIncidentVehicle(null)} 
        />
      )}
    </Layout>
  )
}

export default App
