'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import Link from 'next/link'
import { AlertCircle, ShieldCheck } from 'lucide-react'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [nationality, setNationality] = useState('')
  const [dni, setDni] = useState('')
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
  const [step, setStep] = useState(1) // 1: Email check, 2: Registration
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const checkAuthorization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const res = await fetch('/api/auth/check-authorization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Este email no está en nuestra lista de alumnos. Contacta con soporte.')
        } else if (res.status === 403) {
          toast.error('Tu email está registrado pero aún no ha sido autorizado para el examen.')
        } else {
          toast.error(data.error || 'Error al verificar acceso.')
        }
        setIsLoading(false)
        return
      }

      if (data.authorized) {
        setIsAuthorized(true)
        setStep(2)
        toast.success('Paso 1 completado. Ahora configura tu contraseña para el diploma.')
      }

    } catch (error) {
      toast.error('Ocurrió un error inesperado al verificar.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasAcceptedDisclaimer) {
      toast.error('Debes aceptar el descargo de responsabilidad.')
      return
    }

    setIsLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            nationality: nationality,
            dni: dni,
          },
        },
      })

      if (signUpError) {
        toast.error(signUpError.message)
      } else {
        toast.success('Cuenta creada correctamente. ¡Ya puedes iniciar sesión!')
        router.push('/login')
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="bg-cyan-100 p-3 rounded-full">
            <ShieldCheck className="h-8 w-8 text-cyan-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-heading text-center">Registro de Certificación</CardTitle>
        <CardDescription className="text-center">
          Paso {step}: {step === 1 ? 'Verificación de Acceso' : 'Datos del Diploma'}
        </CardDescription>
      </CardHeader>

      {step === 1 ? (
        <form onSubmit={checkAuthorization}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email con el que te inscribiste</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-cyan-500 h-10"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-10 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Verificar Acceso'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              ¿Ya estás registrado?{' '}
              <Link href="/login" className="text-cyan-600 hover:underline font-medium">
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start space-x-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                Asegúrate de que tus datos sean exactos. Serán utilizados para la emisión de tu **Diploma Universitario oficial**.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre y Apellidos (completos)</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez García"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  required
                  className="focus-visible:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidad</Label>
                  <Input
                    id="nationality"
                    placeholder="Española"
                    value={nationality}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNationality(e.target.value)}
                    required
                    className="focus-visible:ring-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI / NIE / Pasaporte</Label>
                  <Input
                    id="dni"
                    placeholder="12345678X"
                    value={dni}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDni(e.target.value)}
                    required
                    className="focus-visible:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Crea una Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  className="focus-visible:ring-cyan-500"
                />
              </div>

              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                <Checkbox 
                  id="disclaimer" 
                  checked={hasAcceptedDisclaimer}
                  onCheckedChange={(checked) => setHasAcceptedDisclaimer(checked as boolean)}
                  className="mt-1 border-cyan-300 data-[state=checked]:bg-cyan-600"
                />
                <Label htmlFor="disclaimer" className="text-sm text-slate-600 leading-snug cursor-pointer font-normal">
                  Confirmo que estos son los nombres y apellidos correctos con los que se emitirá mi **diploma universitario** en los próximos meses. He verificado que mi DNI/Dato de identidad es correcto.
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-11 text-lg shadow-lg shadow-cyan-500/20"
              disabled={isLoading || !hasAcceptedDisclaimer}
            >
              {isLoading ? 'Registrando...' : 'Finalizar Registro'}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Volver a verificar email
            </button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
