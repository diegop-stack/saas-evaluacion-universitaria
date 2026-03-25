'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import { RulesModal } from './RulesModal'

export function IdentityForm() {
  const [fullName, setFullName] = useState('')
  const [nationality, setNationality] = useState('')
  const [dni, setDni] = useState('')
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasAcceptedDisclaimer) {
      toast.error('Debes aceptar el descargo de responsabilidad.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, nationality, dni }),
      })

      if (res.ok) {
        toast.success('¡Identificación completada!')
        setIsRulesOpen(true)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Ocurrió un error al guardar tus datos.')
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al guardar.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-black border border-white/[0.08] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden backdrop-blur-sm">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-primary opacity-80" />
      <CardHeader className="space-y-4 pt-8 px-8 flex flex-col items-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 relative group transition-transform hover:scale-110 duration-500 w-fit mx-auto">
            <ShieldCheck className="h-10 w-10 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <CardTitle className="text-3xl font-black tracking-tighter text-white uppercase leading-none">Acreditación Alumno</CardTitle>
          <CardDescription className="text-zinc-500 font-bold text-[11px] uppercase tracking-[0.2em] opacity-80">
            Verificación de Identidad Universitaria
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-8 pt-4 pb-6">
          <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex items-start space-x-4">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              <strong className="text-white uppercase tracking-wider mr-1">Importante:</strong> Introduce tus datos exactamente como aparecen en tu documento oficial. El título se emitirá con esta información.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-500 text-[11px] font-black uppercase tracking-widest ml-1">Nombre y Apellidos Completos</Label>
              <Input
                id="fullName"
                placeholder="Juan Pérez García"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-zinc-900/30 border-white/[0.05] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 h-12 rounded-xl text-white font-medium pl-5 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-zinc-500 text-[11px] font-black uppercase tracking-widest ml-1">Nacionalidad</Label>
                <Input
                  id="nationality"
                  placeholder="Española"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                  className="bg-zinc-900/30 border-white/[0.05] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 h-12 rounded-xl text-white font-medium pl-5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-zinc-500 text-[11px] font-black uppercase tracking-widest ml-1">DNI / NIE / PASAPORTE</Label>
                <Input
                  id="dni"
                  placeholder="12345678-X"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                  className="bg-zinc-900/30 border-white/[0.05] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 h-12 rounded-xl text-white font-medium pl-5 transition-all"
                />
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 bg-zinc-900/20 rounded-2xl border border-white/[0.03] mt-2 hover:bg-zinc-900/40 transition-colors cursor-pointer group" onClick={() => setHasAcceptedDisclaimer(!hasAcceptedDisclaimer)}>
              <Checkbox 
                id="disclaimer" 
                checked={hasAcceptedDisclaimer}
                onCheckedChange={(checked) => setHasAcceptedDisclaimer(checked as boolean)}
                className="mt-0.5 border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md h-5 w-5"
              />
              <Label htmlFor="disclaimer" className="text-[11px] text-zinc-500 leading-snug cursor-pointer font-bold select-none group-hover:text-zinc-400 transition-colors">
                Certifico que mi identidad es real y autorizo la emisión automática del diploma oficial con estos datos.
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-8 pb-10">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black h-12 text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/10 border-none transition-all duration-300 group mt-4 relative overflow-hidden"
              >
                {isLoading ? (
                   <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                   </div>
                ) : (
                  <>
                    Validar Identidad
                    <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
        </CardFooter>
      </form>

      <RulesModal 
        isOpen={isRulesOpen} 
        onAccept={async () => {
          try {
            await fetch('/api/auth/policies', { method: 'POST' })
            router.push('/dashboard')
          } catch (e) {
            router.push('/dashboard') // Fallback a la validación del dashboard
          }
        }}
        userData={{ fullName, dni, nationality }}
      />
    </Card>
  )
}
