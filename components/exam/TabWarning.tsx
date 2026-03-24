'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface TabWarningProps {
  isOpen: boolean
  onConfirm: () => void
}

export function TabWarning({ isOpen, onConfirm }: TabWarningProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-amber-500/30 rounded-[2.5rem] shadow-2xl p-10">
        <DialogHeader className="items-center text-center">
          <div className="bg-amber-500/10 p-5 rounded-[2rem] mb-6 border border-amber-500/20">
            <AlertTriangle className="h-12 w-12 text-amber-500 animate-pulse" />
          </div>
          <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">¡AVISO CRÍTICO!</DialogTitle>
          <DialogDescription className="text-zinc-400 font-medium text-base mt-2">
            Has intentado salir del entorno seguro. Esta es tu <span className="text-red-500 font-extrabold underline decoration-2 underline-offset-4">ÚNICA ADVERTENCIA</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 text-sm text-zinc-300 my-6 font-medium">
          <p className="leading-relaxed text-center">
            Si detectamos otra salida de pestaña o minimización del navegador, tu examen será <span className="text-white font-black uppercase">ANULADO DE FORMA IRREVERSIBLE</span>.
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={onConfirm}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-amber-600/20 border-none group"
          >
            ENTENDIDO, VOLVER A LA PRUEBA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
