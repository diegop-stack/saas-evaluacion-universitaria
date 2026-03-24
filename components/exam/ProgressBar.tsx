'use client'

import { Progress } from '@/components/ui/progress'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="w-full">
      <Progress value={percentage} className="h-1.5 bg-white/[0.03] overflow-hidden rounded-full" />
    </div>
  )
}
