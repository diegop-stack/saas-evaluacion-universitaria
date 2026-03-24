'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamTimerProps {
  durationMinutes: number
  startedAt: string
  onTimeUp: () => void
}

export function ExamTimer({ durationMinutes, startedAt, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startedAt).getTime()
      const end = start + durationMinutes * 60 * 1000
      const now = new Date().getTime()
      const diff = Math.max(0, end - now)
      
      if (diff === 0) {
        onTimeUp()
      }
      
      return Math.floor(diff / 1000)
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [durationMinutes, startedAt, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const isWarning = timeLeft <= 10 * 60 // 10 mins
  const isCritical = timeLeft <= 2 * 60 // 2 mins

  return (
    <div className={cn(
      "flex items-center px-5 py-2.5 rounded-2xl font-black text-sm tracking-tighter shadow-2xl border transition-all duration-500",
      isCritical ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse" :
      isWarning ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
      "bg-zinc-50 text-zinc-900 border-zinc-100"
    )}>
      <Clock className={cn("h-4 w-4 mr-2.5", isCritical ? "animate-spin-slow" : "text-secondary")} />
      <span className="tabular-nums">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
