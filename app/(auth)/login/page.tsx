import { AccessForm } from '@/components/auth/AccessForm'
import { LogoHeader } from '@/components/layout/LogoHeader'
import { GraduationCap, LifeBuoy } from 'lucide-react'
import { LoginFAQs } from '@/components/auth/LoginFAQs'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-white font-sans selection:bg-secondary/30">
      <LogoHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-12 flex flex-col items-center space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-4">
               Portal de <span className="text-primary">Acreditación</span>
            </h1>
          </div>
        </div>
        
        <div className="w-full max-w-sm">
          <AccessForm />
        </div>
        
        <div className="w-full max-w-4xl px-8 mt-6">
           <LoginFAQs />
        </div>

        <div className="mt-20 pb-20 text-center flex flex-col items-center space-y-8">
           <Link 
             href="https://programas.learningheroes.com/soporte/alumnado"
             target="_blank"
             className="inline-flex items-center space-x-3 px-8 h-14 bg-zinc-950 border border-white/5 hover:border-primary/50 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl group"
           >
             <LifeBuoy className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
             <span>Soporte al Alumno</span>
           </Link>

           <div className="h-[1px] w-24 bg-zinc-900 mx-auto" />
           
           <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">
             © {new Date().getFullYear()} LEARNING HEROES UNIVERSITY • WESTERN EUROPEAN UNIVERSITY
           </p>
        </div>
      </div>
    </div>
  )
}
