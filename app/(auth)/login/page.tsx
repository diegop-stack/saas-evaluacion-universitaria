import { AccessForm } from '@/components/auth/AccessForm'
import { LogoHeader } from '@/components/layout/LogoHeader'
import { GraduationCap } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111] text-white font-sans selection:bg-secondary/30">
      <LogoHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-12 flex flex-col items-center space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-4">
               Portal de <span className="text-primary">Acreditación</span>
            </h1>
            <p className="text-zinc-200 font-black text-[10px] uppercase tracking-[0.4em] opacity-80 underline decoration-primary/50 underline-offset-8">
              Learning Heroes
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-sm">
          <AccessForm />
          <div className="mt-12 text-center space-y-4">
             <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] leading-relaxed">
               ACCESO RESTRINGIDO PARA ALUMNOS MATRICULADOS
             </p>
             <div className="h-[1px] w-12 bg-zinc-900 mx-auto" />
             <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.2em]">
               © {new Date().getFullYear()} LEARNING HEROES UNIVERSITY
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
