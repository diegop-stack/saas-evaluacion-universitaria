'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react'

export function AccessForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('¡Acceso verificado!')
        // Si no tiene nombre registrado, le mandamos a identidad
        if (!data.hasIdentity) {
          router.push('/identity')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(data.error || 'No tienes acceso autorizado con este email.')
      }
    } catch (error) {
      toast.error('Ocurrió un error al verificar el email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-black border border-white/[0.08] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-primary opacity-80" />
      <CardHeader className="space-y-4 pt-10 pb-2 px-8 flex flex-col items-center">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-10 pointer-events-none" />
            
            <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative group flex justify-center items-center w-fit mx-auto transition-transform hover:scale-110 duration-500">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-50 transition-opacity" />
              <img src="/logos/logo-learning.png" alt="Learning Heroes" className="h-12 w-auto relative z-10 invert brightness-0" />
            </div>

            <div className="space-y-3 mb-6 text-center">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                Acceso <span className="text-primary">Alumnos</span>
              </h2>
            </div>
      </CardHeader>
      
      <form onSubmit={handleAccess} className="w-full space-y-4">
        <CardContent className="space-y-6 px-10 pb-4">
          <div className="space-y-3">
            <label className="text-[12px] font-black text-zinc-200 uppercase tracking-[0.2em] ml-1">Email Registrado</label>
            <div className="relative group/input">
               <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-700 group-focus-within/input:text-primary transition-colors" />
               </div>
               <Input
                   type="email"
                   placeholder="alumno@iaheroes.pro"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="bg-zinc-950/50 border-white/[0.05] border-2 h-12 pl-14 text-white placeholder:text-zinc-800 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
                />
            </div>
            <div className="flex items-center space-x-2 px-1">
               <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
               <p className="text-[11px] text-zinc-300 font-bold uppercase tracking-tight">
                 Accede con el mismo email con el que te apuntaste a Learning Heroes
               </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-10 pb-12 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-12 text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/10 border-none transition-all duration-300 group mt-4"
          >
            {isLoading ? ( // Changed loading to isLoading
               <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
               </div>
            ) : (
              <>
                Validar Acceso
                <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
