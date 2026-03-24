'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ExamTimer } from '@/components/exam/ExamTimer'
import { QuestionCard } from '@/components/exam/QuestionCard'
import { ProgressBar } from '@/components/exam/ProgressBar'
import { TabWarning } from '@/components/exam/TabWarning'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Send, AlertCircle, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ExamClientProps {
  exam: any
  attempt: any
  questions: any[]
}

export function ExamClient({ exam, attempt, questions }: ExamClientProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isTabWarningOpen, setIsTabWarningOpen] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(attempt.tab_switch_count || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Handle Tab Switching (Anti-cheat)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const newCount = tabSwitchCount + 1
        setTabSwitchCount(newCount)

        // Actualizar en el servidor
        await supabase
          .from('exam_attempts')
          .update({ tab_switch_count: newCount })
          .eq('id', attempt.id)

        if (newCount === 1) {
          setIsTabWarningOpen(true)
        } else if (newCount >= 2) {
          // Anular intento
          await supabase
            .from('exam_attempts')
            .update({ 
              status: 'annulled', 
              annulled_reason: 'tab_switch',
              finished_at: new Date().toISOString()
            })
            .eq('id', attempt.id)
          
          toast.error('Examen anulado por salir de la pestaña')
          router.push(`/exam/${exam.id}/result?attemptId=${attempt.id}`)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [tabSwitchCount, attempt.id, exam.id, router, supabase])

  const handleSelectOption = async (optionIndex: number) => {
    const questionId = questions[currentIdx].id
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))

    // Guardado inmediato para el traqueo de progreso (Optimización Atómica para Alto Tráfico)
    try {
      await supabase
        .from('exam_responses')
        .upsert({
          attempt_id: attempt.id,
          question_id: questionId,
          user_answer: optionIndex,
          answered_at: new Date().toISOString()
        }, { 
          onConflict: 'attempt_id,question_id' 
        })
    } catch (e) {
      console.error('Error auto-saving:', e)
    }
  }

  const finishExam = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/exam/${exam.id}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          attemptId: attempt.id,
          answers // Enviar todas las respuestas aquí para mayor robustez
        }),
      })
      
      if (response.ok) {
        router.push(`/exam/${exam.id}/result?attemptId=${attempt.id}`)
      } else {
        toast.error('Error al finalizar el examen')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }, [exam.id, attempt.id, router, answers])

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1)
    }
  }

  const answeredCount = Object.keys(answers).length
  const currentQuestion = questions[currentIdx]

  return (
    <div className="min-h-screen bg-[#111111] pb-24 font-sans text-white selection:bg-secondary/30">
      <TabWarning 
        isOpen={isTabWarningOpen} 
        onConfirm={() => setIsTabWarningOpen(false)} 
      />

      {/* Header Fijo Especializado - White Aesthetic */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center space-x-4 md:space-x-8">
             <Image 
                src="/logos/logo-learning.png" 
                alt="Learning Heroes" 
                width={582} 
                height={153} 
                className="h-8 md:h-9 w-auto object-contain hidden md:block"
                style={{ filter: 'brightness(0) saturate(100%) invert(21%) sepia(21%) saturate(753%) hue-rotate(158deg) brightness(98%) contrast(92%)' }}
                priority
              />
              <div className="h-8 w-[1px] bg-zinc-100 hidden md:block" />
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                   <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                   <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">Certificación Oficial</span>
                </div>
                <h1 className="text-sm md:text-base font-black text-zinc-900 lg:text-primary uppercase tracking-tighter truncate max-w-[120px] sm:max-w-xs leading-none">
                  {exam.title}
                </h1>
              </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            <ExamTimer 
              durationMinutes={exam.duration_minutes} 
              startedAt={attempt.started_at} 
              onTimeUp={finishExam} 
            />
            
            <div className="hidden lg:flex items-center space-x-5">
              <div className="h-8 w-[1px] bg-zinc-100" />
              <Image 
                src="/logos/logo-university.png" 
                alt="University Logo" 
                width={717} 
                height={388} 
                className="h-12 md:h-16 w-auto object-contain"
                priority
              />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger 
                disabled={answeredCount < questions.length}
                className="bg-primary hover:bg-primary/90 text-white font-black h-11 md:h-12 rounded-xl px-4 md:px-6 shadow-xl shadow-primary/10 uppercase tracking-[0.1em] text-[10px] border-none flex items-center group transition-all shrink-0 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                  <Send className="h-3.5 w-3.5 mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  <span className="hidden sm:inline">Finalizar Examen</span>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border border-zinc-200 rounded-3xl shadow-2xl p-10 max-w-md">
                <AlertDialogHeader className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <AlertDialogTitle className="text-3xl font-black text-zinc-900 uppercase tracking-tight leading-none">Confirmar Entrega</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-500 font-medium text-sm leading-relaxed">
                    {answeredCount < questions.length 
                      ? `Atención: No has respondido todas las preguntas. Solo has completado ${answeredCount} de ${questions.length}.` 
                      : "Has respondido todas las preguntas con éxito. ¿Deseas emitir tu examen para revisión ahora?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-8 gap-3 sm:gap-2">
                  <AlertDialogCancel className="bg-zinc-100 border-none text-zinc-500 font-black uppercase tracking-widest text-[9px] h-14 rounded-2xl hover:bg-zinc-200 hover:text-zinc-900 transition-all">Continuar Repaso</AlertDialogCancel>
                  <AlertDialogAction onClick={finishExam} className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] h-14 rounded-2xl border-none shadow-xl shadow-primary/20 transition-all">
                    SÍ, ENTREGAR TEST
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Progress System */}
        <div className="mb-14 bg-white/[0.01] p-10 rounded-3xl border border-white/[0.03] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GraduationCap className="h-20 w-20 text-white" />
          </div>
          <div className="flex justify-between items-end mb-6 relative z-10">
             <div className="space-y-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Estado del Progreso</span>
                <p className="text-xl font-black text-white uppercase tracking-tight">Pregunta {currentIdx + 1} <span className="text-zinc-700 mx-2">/</span> {questions.length}</p>
             </div>
             <div className="text-right">
                <span className="text-3xl font-black text-secondary tracking-tighter leading-none">{Math.round((answeredCount / questions.length) * 100)}%</span>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Acreditado</p>
             </div>
          </div>
          <ProgressBar current={answeredCount} total={questions.length} />
        </div>

        <div className="space-y-12">
          <QuestionCard
            questionId={currentQuestion.id}
            questionText={currentQuestion.question_text}
            options={currentQuestion.options}
            selectedOption={answers[currentQuestion.id] ?? null}
            onSelect={handleSelectOption}
            questionNumber={currentIdx + 1}
          />

          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentIdx === 0}
              className="bg-neutral-900 border border-white/20 text-zinc-100 rounded-2xl font-black uppercase tracking-widest text-[12px] h-14 px-10 hover:bg-neutral-800 hover:text-white disabled:opacity-20 transition-all group"
            >
              <ChevronLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform" />
              Anterior
            </Button>

            <div className="hidden md:flex items-center space-x-2">
               {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-700",
                      i === currentIdx 
                        ? "bg-secondary h-5 w-1.5 ring-4 ring-secondary/20" 
                        : answers[questions[i].id] !== undefined 
                          ? "bg-white" 
                          : "bg-white/10"
                    )} 
                  />
               ))}
            </div>

            {currentIdx < questions.length - 1 ? (
              <Button
                onClick={nextQuestion}
                disabled={answers[currentQuestion.id] === undefined}
                className="bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[12px] h-14 px-12 shadow-2xl transition-all border-none group disabled:opacity-20"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                onClick={finishExam}
                disabled={isSubmitting || answers[currentQuestion.id] === undefined}
                className="bg-secondary hover:bg-secondary/90 text-white shadow-2xl shadow-secondary/20 rounded-2xl font-black uppercase tracking-widest text-[12px] h-14 px-12 transition-all border-none relative overflow-hidden group disabled:opacity-20"
              >
                <span className="relative z-10">{isSubmitting ? 'PROCESANDO...' : 'FINALIZAR TEST'}</span>
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {tabSwitchCount > 0 && (
        <div className="fixed bottom-10 right-10 bg-[#111111] border border-red-500/50 p-6 rounded-3xl flex items-center shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-red-500/10 p-3 rounded-xl mr-5">
            <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Avisos de Seguridad</span>
            <span className="text-xs font-black text-white uppercase tracking-tight">SALIDA DE PESTAÑA DETECTADA</span>
          </div>
        </div>
      )}
    </div>
  )
}
