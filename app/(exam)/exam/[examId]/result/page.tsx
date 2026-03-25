export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, AlertTriangle, LayoutDashboard, RefreshCw, Trophy, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LogoHeader } from '@/components/layout/LogoHeader'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  searchParams: Promise<{ attemptId: string }>
}

export default async function ResultPage({ searchParams }: PageProps) {
  const { attemptId } = await searchParams
  const supabase = await createClient()

  if (!attemptId) redirect('/dashboard')

  // Obtener detalles del intento y sus respuestas
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .select('*, exams(*), exam_responses(*, exam_questions(question_text, options, correct_answer))')
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    redirect('/dashboard')
  }

  const isPassed = attempt.passed
  const isAnnulled = attempt.status === 'annulled'
  const scorePercent = Math.round((attempt.score! / attempt.total_questions!) * 100)

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans text-white selection:bg-secondary/30">
      <LogoHeader />
      
      <div className="flex-1 flex items-center justify-center p-8 py-20">
        <div className="max-w-4xl w-full bg-[var(--background)] border border-white/[0.05] shadow-2xl overflow-hidden rounded-[2.5rem] relative group">
          {/* Status specialized banner */}
          <div className={`p-16 text-center relative overflow-hidden ${
            isAnnulled ? 'bg-amber-600' : isPassed ? 'bg-primary' : 'bg-red-600'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10" />
            <div className="flex justify-center mb-6 relative z-10">
              {isAnnulled ? (
                <div className="bg-[var(--background)]/20 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl">
                  <AlertTriangle className="h-20 w-20 text-white" />
                </div>
              ) : isPassed ? (
                <div className="bg-[var(--background)]/20 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl">
                  <Trophy className="h-20 w-20 text-white scale-110" />
                </div>
              ) : (
                <div className="bg-[var(--background)]/20 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl">
                  <XCircle className="h-20 w-20 text-white" />
                </div>
              )}
            </div>
            
            <div className="relative z-10 space-y-4">
               <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] inline-block px-6 py-2 bg-[var(--background)]/30 rounded-full border border-white/10 backdrop-blur-sm">
                  {isAnnulled ? 'Seguridad del Sistema' : 'Expediente Universitario'}
               </span>
               <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white whitespace-nowrap">
                {isAnnulled ? 'ANULADO' : isPassed ? 'SUPERADO' : 'SUSPENSO'}
               </h1>
               <p className="text-white/80 font-medium text-lg max-w-lg mx-auto leading-tight">
                  {isAnnulled 
                    ? 'Se han detectado comportamientos irregulares durante la prueba.' 
                    : isPassed 
                    ? `Durante las próximas semanas o meses, la universidad te reenviará a tu mismo correo electrónico el diploma oficial después de las revisiones pertinentes. ¡Enhorabuena!`
                    : 'No has alcanzado la puntuación mínima necesaria para acreditarse.'}
               </p>
            </div>
          </div>

          <div className="p-12 md:p-16 space-y-16">
            <div className="grid grid-cols-1 gap-16">
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Análisis de Resultados</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-950/40 p-10 rounded-[2.5rem] border border-white/[0.03] flex flex-col justify-center items-center group transition-all hover:bg-zinc-950/60 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">PUNTUACIÓN BRUTA</span>
                    <span className="text-5xl font-black text-white tabular-nums tracking-tighter">{attempt.score} <span className="text-zinc-800 mx-2 text-2xl">/</span> {attempt.total_questions}</span>
                  </div>
                  <div className="bg-zinc-950/40 p-10 rounded-[2.5rem] border border-white/[0.03] flex flex-col justify-center items-center group transition-all hover:bg-zinc-950/60 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-secondary/20" />
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">RESULTADO FINAL</span>
                    <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{scorePercent}%</span>
                  </div>
                </div>
                <div className="flex justify-center items-center py-4">
                  <div className="flex items-center space-x-4 px-6 py-2 bg-white/[0.02] border border-white/[0.05] rounded-full">
                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">MÍNIMO PARA APROBAR</span>
                    <span className="text-sm font-black text-primary tabular-nums tracking-widest">{attempt.exams.pass_score_percent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {isPassed && (
              <div className="relative pt-10">
                <div className="bg-primary/10 border border-primary/20 p-16 rounded-[4rem] relative overflow-hidden group transition-all hover:bg-primary/[0.12] text-center shadow-3xl shadow-primary/5">
                  <div className="absolute -top-20 -right-20 p-4 opacity-[0.05] scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                      <Trophy className="h-64 w-64 text-primary" />
                  </div>
                  <div className="flex justify-center mb-10">
                    <div className="bg-primary p-5 rounded-full shadow-2xl shadow-primary/40 animate-bounce cursor-default">
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <p className="text-white text-3xl md:text-4xl font-black leading-tight mb-8 relative z-10 uppercase tracking-tighter">
                    ¡ENHORABUENA! HAS SUPERADO EL RETO.
                  </p>
                  <p className="max-w-xl mx-auto text-primary text-xl font-bold leading-relaxed mb-6 relative z-10 italic">
                    "Durante las próximas semanas o meses, la universidad te reenviará a tu mismo correo electrónico el diploma oficial después de las revisiones pertinentes. ¡Enhorabuena!"
                  </p>
                  <div className="h-[1px] w-40 bg-primary/20 mx-auto mb-8" />
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em] relative z-10">
                    SISTEMA DE ACREDITACIÓN UNIVERSITARIA 2026
                  </p>
                  
                  {/* Decorative dots background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-white animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-white animate-pulse delay-700" />
                    <div className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-primary animate-ping" />
                    <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-primary animate-ping delay-500" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                 <div className="w-1.5 h-6 bg-zinc-800 rounded-full" />
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Auditoría Académica</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
                {attempt.exam_responses.map((resp: any, idx: number) => (
                  <details key={idx} className="group bg-zinc-950/40 rounded-[1.5rem] border border-white/[0.03] transition-all hover:bg-zinc-900/60 overflow-hidden">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <div className="flex items-center space-x-4 overflow-hidden">
                        <span className="text-[10px] font-black text-zinc-800 tabular-nums w-4 tracking-tighter">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-bold text-zinc-400 truncate uppercase tracking-tight group-open:text-white transition-colors">
                          {resp.exam_questions.question_text}
                        </span>
                      </div>
                      <div className={cn(
                        "flex-shrink-0 ml-4 p-2 rounded-xl border transition-all group-hover:scale-110",
                        resp.is_correct ? "bg-primary/10 border-primary/20" : "bg-red-500/10 border-red-500/20"
                      )}>
                        {resp.is_correct ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </summary>
                      <div className="px-10 pb-8 pt-2 space-y-4 border-t border-white/[0.02] bg-black/20">
                         <div className="flex flex-col space-y-2">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tu Respuesta</span>
                            <p className={cn(
                              "text-sm font-bold uppercase tracking-tight",
                              resp.is_correct ? "text-primary" : "text-red-500"
                            )}>
                               {(resp.exam_questions.options as string[])[resp.user_answer] || "Sin respuesta"}
                            </p>
                         </div>
                         {!resp.is_correct && (
                           <div className="flex flex-col space-y-2">
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Respuesta Correcta</span>
                              <p className="text-sm font-bold text-zinc-200 uppercase tracking-tight">
                                 {(resp.exam_questions.options as string[])[resp.exam_questions.correct_answer] || "Consultar material oficial"}
                              </p>
                           </div>
                         )}
                      </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="p-12 md:p-16 bg-zinc-950/20 border-t border-white/[0.05] flex flex-col sm:flex-row gap-6">
            <Link 
              href="/dashboard" 
              className="group w-full sm:flex-1 bg-white hover:bg-zinc-100 text-black h-14 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center transition-all shadow-2xl relative overflow-hidden"
            >
              <LayoutDashboard className="h-4 w-4 mr-3 group-hover:-translate-y-0.5 transition-transform" />
              Finalizar Expediente
            </Link>
            {!isPassed && !isAnnulled && (
              <Link 
                href={`/exam/${attempt.exam_id}`}
                className="group w-full sm:flex-1 bg-[var(--background)] border border-white/10 text-white h-14 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-3 group-hover:rotate-180 transition-transform duration-700" />
                Reintentar prueba
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
