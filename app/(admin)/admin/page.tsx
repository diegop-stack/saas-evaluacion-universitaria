import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSession } from '@/lib/session'
import { LogoHeader } from '@/components/layout/LogoHeader'
import { Users, GraduationCap, Clock, CheckCircle2, XCircle, Search, Mail, Fingerprint, Globe } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'

import { AdminClient } from './AdminClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ pwd?: string }>
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { pwd } = await searchParams
  const session = await getSession()

  // Guard de Email de admin (normalizado para evitar fallos de mayúsculas/minúsculas)
  const userEmail = session?.email?.toLowerCase() || ''
  const isAuthorizedEmail = userEmail.includes('learningheroes.com') || userEmail.includes('admin')
  const isCorrectPassword = pwd === 'Diegoperez95'

  if (!isAuthorizedEmail || !isCorrectPassword) {
    if (!isAuthorizedEmail) redirect('/dashboard')

    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full space-y-8 p-12 bg-zinc-950 border border-white/[0.05] rounded-[3rem] shadow-3xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <Fingerprint className="h-10 w-10 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Acceso Restringido</h1>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Introduzca las credenciales de raíz de Diego Pérez</p>
          
          <form method="get" className="space-y-6">
            <input 
              type="password" 
              name="pwd"
              placeholder="••••••••"
              autoFocus
              className="w-full bg-[#111111] border border-white/10 rounded-2xl h-16 px-6 text-center text-xl font-black focus:border-red-500 outline-none transition-all placeholder:text-zinc-900 selection:bg-red-500/30"
            />
            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all shadow-2xl shadow-red-600/20 active:scale-[0.98]"
            >
              Autenticar Sistema
            </button>
          </form>
          
          <p className="text-[8px] text-zinc-800 font-black uppercase tracking-[0.4em] pt-8 border-t border-white/[0.03]">
            IP Logged • Admin Security v2.5
          </p>
        </div>
      </div>
    )
  }

  const supabase = supabaseAdmin

  // Obtener perfiles con todos sus intentos
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      exam_attempts (
        id,
        score,
        total_questions,
        passed,
        status,
        created_at,
        attempt_number
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-10 text-white font-black uppercase tracking-widest text-center">Error cargando panel de control.</div>
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col font-sans selection:bg-primary/30 text-white">
      <LogoHeader />
      
      <main className="flex-1 py-16 px-6 md:py-24">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Admin Header Content moved to AdminClient for search integration, but keeping structural layout here */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-white/[0.03] pb-16">
             <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                   <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Consola Maestro • Nivel 4 Acceso</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                   Base de <span className="text-primary italic">Datos</span>
                </h1>
                <p className="text-zinc-500 text-sm font-medium max-w-xl leading-relaxed uppercase tracking-wider">
                   Supervisión total de expedientes registrados en IA Heroes Pro University.
                </p>
             </div>
             
             <div className="flex items-center gap-10">
                <div className="text-center group">
                  <span className="text-4xl font-black tabular-nums tracking-tighter group-hover:text-primary transition-colors">{profiles?.length || 0}</span>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-2">USUARIOS</p>
                </div>
                <div className="h-10 w-[1px] bg-zinc-900" />
                <div className="text-center group">
                  <span className="text-4xl font-black tabular-nums tracking-tighter group-hover:text-green-500 transition-colors">
                    {profiles?.filter(p => p.exam_attempts?.some((a: any) => a.passed)).length || 0}
                  </span>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-2">GRADUADOS</p>
                </div>
             </div>
          </div>

          <AdminClient initialProfiles={profiles || []} />
          
          <div className="pt-20 text-center opacity-30">
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700">Diseñado para Operaciones de Alto Rendimiento • © 2026</p>
          </div>
        </div>
      </main>
    </div>
  )
}
