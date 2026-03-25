'use client'

import { 
  Dialog, 
  DialogContent, 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  RotateCcw, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react'

interface RulesModalProps {
  isOpen: boolean
  onAccept: () => void
  isSubmitting?: boolean
  userData: {
    fullName: string
    dni: string
    nationality: string
  }
}

export function RulesModal({ isOpen, onAccept, isSubmitting, userData }: RulesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-0 overflow-hidden outline-none shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        
        <div className="p-8 md:p-10 space-y-6">
          
          {/* Cabecera de Alumno */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
              PROTOCOLO DE <span className="text-primary not-italic">ACREDITACIÓN</span>
            </h2>
            <div className="flex items-center space-x-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest pt-2">
              <span className="text-white">{userData.fullName}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>DNI: {userData.dni}</span>
            </div>
          </div>

          {/* Lista Formateada (Legible y Directa) */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-l-2 border-primary/30 pl-3">Estado de Cuotas Académicas</h4>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed pl-3 italic">
                  Es indispensable estar al corriente de todos los pagos con Learning Heroes para que el diploma sea tramitado.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-secondary/10 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-secondary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-l-2 border-secondary/30 pl-3">Tiempo Límite y Bloqueo</h4>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed pl-3 italic">
                  Dispones de <strong className="text-white">40 MINUTOS</strong> por intento. Ante un fallo, el sistema se bloquea <strong className="text-white">24 HORAS</strong>. Máximo 3 intentos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-zinc-800 p-2 rounded-lg">
                <Building2 className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-l-2 border-zinc-700 pl-3">Diplomas (Western European University)</h4>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed pl-3 italic">
                  La expedición del diploma depende de la <strong className="text-zinc-200">WEU</strong> y no de Learning Heroes, pudiendo demorar meses.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-l-2 border-primary/30 pl-3">Acreditación Académica</h4>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed pl-3 italic">
                  Debes superar el examen con un mínimo del <strong className="text-zinc-200">20% de la materia</strong> dentro del tiempo establecido.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-white/5">
            <Button 
              onClick={onAccept}
              disabled={isSubmitting}
              className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-xl shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'PROCESANDO...' : 'ACEPTAR PROTOCOLO Y CONTINUAR'}</span>
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
            <p className="text-center text-[8px] text-zinc-700 font-bold uppercase tracking-[0.3em] mt-4">
              CERTIFICACIÓN OFICIAL IA HEROES PRO 2026
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
