export const dynamic = 'force-dynamic'
import { getExamData } from '@/lib/utils/exam-logic'
import { ExamClient } from './ExamClient'
import { AlertCircle } from 'lucide-react'
import { buttonVariants } from '@/lib/utils/button-variants'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ examId: string }>
}

export default async function ExamPage({ params }: PageProps) {
  const { examId } = await params
  
  try {
    const { exam, attempt, questions } = await getExamData(examId)
    
    return (
      <ExamClient 
        exam={exam} 
        attempt={attempt} 
        questions={questions} 
      />
    )
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-8 text-center">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 mb-4">No se pudo iniciar el examen</h1>
          <p className="text-slate-600 mb-8 font-medium">
            {error.message || 'Ocurrió un error inesperado. Por favor, vuelve al dashboard e intenta de nuevo.'}
          </p>
          <Link 
            href="/dashboard"
            className={cn(buttonVariants({ className: "w-full bg-slate-900 hover:bg-slate-800" }))}
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }
}
