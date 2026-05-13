import { useState } from 'react'
import { supabase } from "./supabaseClient";
import { LogIn, KeyRound, Mail, UserPlus, ArrowRight, ShieldCheck, Car } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('') // For registration
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Cont creat cu succes! Verifică email-ul pentru confirmare sau încearcă să te conectezi.')
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-900/50 backdrop-blur-xl rounded-[40px] shadow-2xl border border-slate-800 m-4 overflow-hidden"
      >
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Car className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter">FLOTERA</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Gestionare inteligentă <br />
              <span className="text-blue-200">pentru flota ta.</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-sm">
              Platforma completă pentru monitorizarea vehiculelor, mentenanță și managementul șoferilor.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-blue-100/80">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-400" />
              ))}
            </div>
            <span>Alătură-te celor peste 500 de manageri de flotă.</span>
          </div>

          {/* Abstract pattern decoration */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 C 20 0 50 0 100 100" stroke="white" fill="transparent" strokeWidth="0.1" />
               <path d="M0 80 C 30 20 60 20 100 80" stroke="white" fill="transparent" strokeWidth="0.1" />
               <path d="M0 60 C 40 40 70 40 100 60" stroke="white" fill="transparent" strokeWidth="0.1" />
             </svg>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-slate-900">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Car className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Bun venit înapoi' : 'Creează cont nou'}
            </h2>
            <p className="text-slate-400">
              {isLogin ? 'Introdu datele pentru a accesa panoul de control.' : 'Completează formularul pentru a te înregistra.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            <AnimatePresence mode='wait'>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3"
                >
                  <div className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="font-bold">!</span>
                  </div>
                  {error === 'Invalid login credentials' ? 'Email sau parolă incorecte.' : error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm flex items-center gap-3"
                >
                  <ShieldCheck size={20} />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <UserPlus size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                    placeholder="Nume Complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </motion.div>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                  placeholder="Adresa de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <KeyRound size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                  placeholder="Parola"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Ai uitat parola?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Conectare' : 'Creează Cont'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              {isLogin ? 'Nu ai un cont?' : 'Ai deja un cont?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setSuccess(null)
                }}
                className="ml-2 font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isLogin ? 'Înregistrează-te' : 'Conectează-te'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
