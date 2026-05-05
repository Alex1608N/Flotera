import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import Login from './Login'
import Layout from './Layout'

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Verificăm dacă există deja o sesiune activă (userul e logat anterior)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Ascultăm schimbările (când se loghează sau dă logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Login />
  }

  // Aici e Dashboard-ul înfășurat în noul Layout
  return (
    <Layout userEmail={session.user.email}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Bun Venit */}
        <div className="col-span-full bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-2xl text-white shadow-lg">
          <h2 className="text-3xl font-bold">Salutare, {session.user.email?.split('@')[0]}!</h2>
          <p className="mt-2 text-blue-100 opacity-90">
            Bine ai revenit în panoul de control al flotei tale. Momentan ai toate sistemele active.
          </p>
        </div>

        {/* Card Statistici Rapide (Placeholder pentru Epic 2/3) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Vehicule Active</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Alerte Documente</p>
          <p className="text-3xl font-bold text-green-600 mt-1">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Incidente Raportate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
        </div>
      </div>
    </Layout>
  )
}

export default App
