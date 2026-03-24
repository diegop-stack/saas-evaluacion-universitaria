'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  questionId: string
  questionText: string
  options: string[]
  selectedOption: number | null
  onSelect: (index: number) => void
  questionNumber: number
}

export function QuestionCard({
  questionText,
  options,
  selectedOption,
  onSelect,
  questionNumber
}: QuestionCardProps) {
  return (
    <Card className="bg-black border border-white/[0.05] shadow-2xl rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
      <CardHeader className="border-b border-white/[0.05] p-8">
        <CardTitle className="text-2xl md:text-3xl font-black text-white flex items-start leading-tight tracking-tight uppercase">
          <span className="bg-primary/10 text-primary w-10 h-10 rounded-2xl flex items-center justify-center text-xs mr-5 flex-shrink-0 font-black border border-primary/20 transition-all group-hover:scale-110">
            {questionNumber < 10 ? `0${questionNumber}` : questionNumber}
          </span>
          <span className="pt-1">{questionText}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                "group flex items-center w-full p-6 rounded-2xl border transition-all duration-500 text-left",
                selectedOption === index
                  ? "border-primary/50 bg-primary/[0.03] shadow-[0_0_40px_-15px_rgba(36,63,76,0.3)]"
                  : "border-white/[0.03] bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.03]"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl border flex items-center justify-center mr-6 transition-all duration-500 font-black text-xs",
                selectedOption === index
                  ? "border-primary/50 bg-primary text-white shadow-xl shadow-primary/20"
                  : "border-white/10 text-zinc-600 group-hover:border-white/30 group-hover:text-zinc-400"
              )}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className={cn(
                "font-bold text-base md:text-lg transition-colors duration-500",
                selectedOption === index ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
              )}>
                {option}
              </span>
              {selectedOption === index && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(36,63,76,1)]" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
