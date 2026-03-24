'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Globe, 
  MessageSquare, 
  Shield, 
  Settings, 
  FileText,
  LogOut,
  Search,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface SidebarItemProps {
  icon: any
  label: string
  href: string
  active?: boolean
  hasSubmenu?: boolean
}

function SidebarItem({ icon: Icon, label, href, active, hasSubmenu }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
        active 
          ? "bg-white/10 text-white shadow-xl shadow-black/20" 
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      <div className="flex items-center">
        <Icon className={cn("h-5 w-5 mr-3 transition-colors", active ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300")} />
        {label}
      </div>
      {hasSubmenu && <ChevronRight className="h-4 w-4 text-zinc-600" />}
    </Link>
  )
}

export function DashboardLayout({ children, session, profile }: { children: React.ReactNode, session: any, profile: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const GeneralItems = [
    { icon: Home, label: 'Inicio', href: '/dashboard' },
  ]

  const HeroItems = [
    { icon: Globe, label: 'Hero Universe', href: '#', hasSubmenu: true },
    { icon: BookOpen, label: 'Aula virtual', href: '#', hasSubmenu: true },
    { icon: Users, label: 'Comunidad', href: '#', hasSubmenu: true },
    { icon: Globe, label: 'Learningheroes.com', href: '#', hasSubmenu: true },
  ]

  const ToolItems = [
    { icon: MessageSquare, label: 'Chatbots', href: '#', hasSubmenu: true },
    { icon: Shield, label: 'Moderación', href: '#', hasSubmenu: true },
    { icon: FileText, label: 'Blog', href: '#', hasSubmenu: true },
  ]

  const AdminItems = [
    { icon: Shield, label: 'Admin', href: '#', hasSubmenu: true },
    { icon: Settings, label: 'Marketing', href: '#', hasSubmenu: true },
    { icon: Settings, label: 'Otros', href: '#', hasSubmenu: true },
  ]

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
          {/* Logo */}
          <div className="px-4 py-6 mb-2">
            <Image 
              src="/logos/logo-learning.png" 
              alt="Learning Heroes" 
              width={582} 
              height={153} 
              className="h-8 w-auto object-contain brightness-0 invert"
              priority
            />
          </div>

          {/* Search */}
          <div className="relative mb-6 group px-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar Contenido" 
              className="w-full bg-zinc-900 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded border border-zinc-700 font-bold">⌘</span>
              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded border border-zinc-700 font-bold">K</span>
            </div>
          </div>

          <nav className="flex-1 space-y-8 px-2 pb-8">
            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-4">General</p>
              <div className="space-y-1">
                {GeneralItems.map((item, idx) => (
                  <SidebarItem key={idx} {...item} active={pathname === item.href} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-4">Hero Universe</p>
              <div className="space-y-1">
                {HeroItems.map((item, idx) => (
                  <SidebarItem key={idx} {...item} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-4">Chatbots & Blog</p>
              <div className="space-y-1">
                {ToolItems.map((item, idx) => (
                  <SidebarItem key={idx} {...item} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 px-4">Gestión</p>
              <div className="space-y-1">
                {AdminItems.map((item, idx) => (
                  <SidebarItem key={idx} {...item} />
                ))}
              </div>
            </div>
          </nav>

          {/* Footer User */}
          <div className="mt-auto border-t border-zinc-900 pt-4 px-2 space-y-2">
             <Link href="#" className="flex items-center text-xs text-zinc-500 hover:text-white px-4 py-2 transition-colors">
                <FileText className="h-4 w-4 mr-3" />
                Documentación
             </Link>
             <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-2xl border border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                    {profile?.full_name?.charAt(0) || session.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate">
                      {profile?.full_name || 'Invitado'}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate">{session.email}</span>
                  </div>
                </div>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-zinc-600 hover:text-red-500 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)}>
             <Menu className="h-6 w-6" />
          </button>
          <div className="text-sm font-bold">Dashboard</div>
          <div className="w-6" /> 
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-black p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
