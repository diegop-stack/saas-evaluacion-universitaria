import { IdentityForm } from '@/components/auth/IdentityForm'
import { LogoHeader } from '@/components/layout/LogoHeader'
import { GraduationCap } from 'lucide-react'

export default function IdentitySetupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111] font-sans text-white selection:bg-secondary/30">
      <LogoHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 py-20">
        <div className="mb-12 flex flex-col items-center space-y-6 text-center">
          <div className="bg-secondary/5 p-6 rounded-[2.5rem] border border-secondary/20 shadow-2xl shadow-secondary/5 relative group">
            <div className="absolute inset-0 bg-secondary/10 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <GraduationCap className="h-10 w-10 text-secondary relative z-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
              Acreditación <span className="text-secondary">Alumno</span>
            </h1>
            <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.4em] opacity-80 mt-4">
              VERIFICACIÓN DE IDENTIDAD ACADÉMICA
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-xl">
          <IdentityForm />
        </div>
      </div>
    </div>
  )
}
