"use client"

import Image from 'next/image'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export function LogoHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const showLogout = pathname !== '/login'

  return (
    <div className="w-full h-14 md:h-16 flex justify-between items-center py-4 bg-white px-4 md:px-8 border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
      {/* LADO IZQUIERDO: LEARNING HEROES */}
      <Link href="/dashboard" className="transition-all hover:opacity-80 active:scale-95 duration-300">
        <Image 
          src="/logos/logo-learning.png" 
          alt="Learning Heroes" 
          width={582} 
          height={153} 
          className="h-7 md:h-8 w-auto object-contain"
          style={{ filter: 'brightness(0) saturate(100%) invert(21%) sepia(21%) saturate(753%) hue-rotate(158deg) brightness(98%) contrast(92%)' }} // Forces Corporate Blue tint if it's black/white
          priority
        />
      </Link>
        {/* LADO DERECHO: UNIVERSIDAD */}
      <div className="flex items-center space-x-4 md:space-x-8">
        <div className="hidden sm:flex flex-col items-end border-r border-zinc-100 pr-5">
            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest leading-none mb-1">Certificación Oficial</span>
            <span className="text-[10px] text-primary font-black uppercase tracking-tight">IA Heroes Pro 2026</span>
        </div>
        <Image 
          src="/logos/logo-university.png" 
          alt="Western Europe University" 
          width={717} 
          height={388} 
          className="h-10 md:h-12 w-auto object-contain"
          priority
        />
        
        {showLogout && (
          <button 
            onClick={handleSignOut}
            className="p-2 hover:bg-zinc-50 rounded-full transition-colors group relative"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
          </button>
        )}
      </div>
    </div>
  )
}
