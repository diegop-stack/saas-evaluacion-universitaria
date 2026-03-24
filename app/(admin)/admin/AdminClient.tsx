'use client'

import { useState } from 'react'
import { 
  Users, 
  Trash2, 
  Download, 
  Search, 
  Mail, 
  Fingerprint, 
  Globe, 
  ShieldCheck, 
  MoreVertical, 
  AlertTriangle 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface AdminClientProps {
  initialProfiles: any[]
}

export function AdminClient({ initialProfiles }: AdminClientProps) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [isReseting, setIsReseting] = useState<string | null>(null)
  const router = useRouter()

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleReset = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar TODOS los intentos de este usuario? Esta acción es irreversible.')) return
    
    setIsReseting(userId)
    try {
      const res = await fetch('/api/admin/reset-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (res.ok) {
        // Actualizar UI local para no tener que refrescar todo
        setProfiles(prev => prev.map(p => 
          p.id === userId ? { ...p, exam_attempts: [] } : p
        ))
        alert('Intentos borrados correctamente.')
      } else {
        alert('Error al borrar intentos.')
      }
    } catch (err) {
      alert('Error de conexión.')
    } finally {
      setIsReseting(null)
    }
  }

  const [importEmails, setImportEmails] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async () => {
    if (!importEmails.trim()) return
    setIsImporting(true)
    try {
      const emails = importEmails.split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes('@'))
      const res = await fetch('/api/admin/import-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      })
      
      if (res.ok) {
        const data = await res.json()
        alert(`¡Importación completada! ${data.count} usuarios nuevos añadidos.`)
        setImportEmails('')
        router.refresh()
      } else {
        alert('Error en la importación.')
      }
    } catch (err) {
      alert('Error de conexión.')
    } finally {
      setIsImporting(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre Completo', 'Email', 'DNI', 'Nacionalidad', 'Intentos', 'Estado']
    const rows = filteredProfiles.map(p => [
      p.id,
      `"${p.full_name || 'Sin Nombre'}"`,
      p.email,
      p.dni || '---',
      p.nationality || '---',
      p.exam_attempts?.length || 0,
      p.exam_attempts?.some((a: any) => a.passed) ? 'APROBADO' : 'PENDIENTE'
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expedientes_hero_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Bulk Import Section */}
      <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/[0.05] shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <Mail className="h-32 w-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-4 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(36,63,76,0.8)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Importación Masiva de Alumnos</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <textarea 
                value={importEmails}
                onChange={(e) => setImportEmails(e.target.value)}
                placeholder="PEGA AQUÍ LOS EMAILS SEPARADOS POR COMAS O LÍNEAS..."
                className="w-full h-32 bg-zinc-950/50 border border-white/5 rounded-2xl p-6 text-[11px] font-bold text-zinc-300 placeholder:text-zinc-700 outline-none focus:border-primary/50 transition-all uppercase tracking-widest leading-relaxed resize-none"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button 
                onClick={handleImport}
                disabled={isImporting || !importEmails.trim()}
                className="h-14 px-10 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 transition-all flex items-center justify-center space-x-3 group"
              >
                {isImporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  </div>
                ) : (
                  <>
                    <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Importar Lista de Emails</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest pl-1">
            * ESTO REGISTRARÁ LOS EMAILS EN LA BASE DE DATOS COMO ALUMNOS AUTORIZADOS.
          </p>
        </div>
      </div>
      {/* Search & Export */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/[0.03]">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE, EMAIL O DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--background)] border border-white/5 rounded-2xl h-14 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-zinc-400"
          />
        </div>
        
        <button 
          onClick={exportToCSV}
          className="flex items-center space-x-3 px-8 h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-2xl shadow-white/5 group"
        >
          <Download className="h-4 w-4 group-hover:animate-bounce" />
          <span>Exportar Base de Datos (.CSV)</span>
        </button>
      </div>

      {/* Modern High-Density Table */}
      <div className="bg-white/[0.02] border border-white/[0.03] rounded-[3rem] overflow-hidden shadow-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                <th className="px-8 py-6 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em]">Alumno / Identidad</th>
                <th className="px-8 py-6 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em]">DNI / Nac.</th>
                <th className="px-8 py-6 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] text-center">Intentos</th>
                <th className="px-8 py-6 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] text-center">Status Final</th>
                <th className="px-8 py-6 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredProfiles.map((profile) => {
                const isPassed = profile.exam_attempts?.some((a: any) => a.passed)
                return (
                  <tr key={profile.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-8">
                       <div className="space-y-1">
                          <p className="text-sm font-black uppercase group-hover:text-primary transition-colors">{profile.full_name || 'S/N'}</p>
                          <p className="text-[10px] text-zinc-400 font-medium lowercase tracking-wide flex items-center">
                            <Mail className="h-3 w-3 mr-2 opacity-50" /> {profile.email}
                          </p>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="space-y-1">
                          <div className="flex items-center text-[10px] font-black text-white/80 space-x-3 uppercase">
                            <Fingerprint className="h-3 w-3 opacity-50" />
                            <span>{profile.dni || '---'}</span>
                          </div>
                          <div className="flex items-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                            <Globe className="h-3 w-3 mr-2 opacity-50" /> {profile.nationality || 'NO IDENT.'}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                       <span className="text-xl font-black tabular-nums">{profile.exam_attempts?.length || 0}</span>
                    </td>
                    <td className="px-8 py-8 text-center">
                       <div className="inline-flex justify-center">
                         {isPassed ? (
                           <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                             <ShieldCheck className="h-3 w-3" />
                             <span>Graduado</span>
                           </div>
                         ) : (
                           <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 text-[9px] font-black uppercase tracking-widest">
                             <span>Pendiente</span>
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <button 
                         onClick={() => handleReset(profile.id)}
                         disabled={isReseting === profile.id}
                         className={cn(
                           "inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-50",
                           isReseting === profile.id && "animate-pulse"
                         )}
                       >
                         <Trash2 className="h-3 w-3" />
                         <span>Resetear</span>
                       </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
