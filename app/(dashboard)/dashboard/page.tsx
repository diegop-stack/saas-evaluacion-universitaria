import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/lib/utils/button-variants'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  GraduationCap, 
  PlayCircle, 
  Trophy,
  ArrowRight,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { LogoHeader } from '@/components/layout/LogoHeader'
import { RulesDashboardOverlay } from '@/components/dashboard/RulesDashboardOverlay'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', session.email)
    .single()

  const isAdmin = session?.email?.toLowerCase()?.includes('learningheroes.com')

  const { data: exams } = await supabase
    .from('exams')
    .select('*, exam_windows(*)')
    .eq('is_active', true)

  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('*, exams(title)')
    .eq('user_id', profile?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-secondary/30">

      <LogoHeader />

      {/* Control Legal: Si no ha aceptado políticas, sale el modal */}
      <RulesDashboardOverlay userProfile={profile} />
      
      <main className="flex-1 py-16 px-6 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 space-y-6">
             <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <div className="h-1 w-1 rounded-full bg-secondary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Acreditación Académica</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                Acceso al <span className="text-primary">Campus</span>
             </h1>

          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto mb-24">
            {exams?.map((exam) => (
              <Card key={exam.id} className="bg-card border border-white/[0.05] group overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-700 shadow-2xl rounded-[2.5rem]">

                <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
                <CardHeader className="pt-10 px-10">
                  <div className="flex items-center justify-between mb-6">
                     <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary text-white border-none px-4 py-1.5 tracking-widest rounded-full shadow-[0_0_20px_rgba(36,63,76,0.5)]">
                        Programa Oficial
                     </Badge>
                     <Trophy className="h-6 w-6 text-white group-hover:text-primary transition-colors duration-500 shadow-2xl" />
                  </div>
                  <CardTitle className="text-4xl font-black text-white leading-none uppercase tracking-tight">IA HEROES PRO 9</CardTitle>

                  <CardDescription className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">{exam.id.split('-')[0].toUpperCase()} • CAMPUS VIRTUAL</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow px-10 pt-6 pb-10 space-y-8">
                  <div className="flex items-center gap-10 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                     <div className="flex items-center group/item hover:text-zinc-300 transition-colors">
                        <Clock className="h-4 w-4 mr-2 text-zinc-700 group-hover/item:text-primary transition-colors" />
                        {exam.duration_minutes} MINUTOS
                     </div>
                     <div className="flex items-center group/item hover:text-zinc-300 transition-colors">
                        <GraduationCap className="h-4 w-4 mr-2 text-zinc-700 group-hover/item:text-primary transition-colors" />
                        {exam.question_count} PREGUNTAS
                     </div>
                  </div>
                </CardContent>
                <CardFooter className="px-0 pb-0 pt-0 overflow-hidden">
                  <Link
                    href={`/exam/${exam.id}`}
                    className={cn(buttonVariants({ size: 'lg', className: 'w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black h-20 rounded-none border-t border-white/[0.05] transition-all duration-300 group flex items-center justify-center' }))}
                  >
                    COMENZAR EXAMEN
                    <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* User Activity / Attempts */}
          {attempts && attempts.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-1.5 bg-secondary rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Historial de Expediente</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {attempts.map((att) => (
                  <div key={att.id} className="bg-zinc-950/40 border border-white/[0.03] p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-950/60 transition-all group">
                    <div className="space-y-2">
                       <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                          {new Date(att.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                       </span>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">IA HEROES PRO 9</h3>

                       <div className="flex items-center space-x-3">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest",
                            att.status === 'completed' ? (att.passed ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500") : "bg-zinc-800 text-zinc-500"
                          )}>
                            {att.status === 'completed' ? (att.passed ? "APROBADO" : "NO APTO") : att.status.toUpperCase()}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-zinc-800" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">INTENTO #{att.attempt_number}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className="text-3xl font-black text-white tabular-nums tracking-tighter">
                          {att.score !== null ? `${Math.round((att.score / att.total_questions) * 100)}%` : '--%'}
                        </span>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">CALIFICACIÓN</p>
                      </div>
                      <Link 
                        href={`/exam/${att.exam_id}/result?attemptId=${att.id}`}
                        className="bg-white/5 hover:bg-white/10 text-white p-4 rounded-2xl transition-all"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 text-center space-y-6">
             {isAdmin && (
               <Link 
                 href="/admin" 
                 className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-red-600/20 mb-8"
               >
                 <Users className="h-4 w-4 mr-2" />
                 Panel de Control Maestro (ADMIN)
               </Link>
             )}
             <form action="/auth/signout" method="post">
                <button type="submit" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-red-500 transition-colors">
                   Cerrar Sesión Segura
                </button>
             </form>
          </div>
        </div>
      </main>
    </div>
  )
}
