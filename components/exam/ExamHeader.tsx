'use client'

import * as React from 'react'
import { Timer, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ExamHeaderProps {
  title: string
  remainingSeconds?: number
  durationMinutes?: number
  onExit?: () => void
}

export function ExamHeader({ title, remainingSeconds, durationMinutes, onExit }: ExamHeaderProps) {
  const [timeLeft, setTimeLeft] = React.useState(remainingSeconds ?? (durationMinutes ? durationMinutes * 60 : 0))

  React.useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isWarning = timeLeft < 300 // 5 minutes

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 truncate mr-4">
          {onExit && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              onClick={onExit}
              title="Exit Exam"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-bold tracking-tight sm:text-xl truncate">
            {title}
          </h1>
        </div>
        <div className={cn(
          "flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-sm font-semibold transition-all tabular-nums",
          isWarning 
            ? "bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
            : "bg-muted text-muted-foreground border border-border/50"
        )}>
          <Timer className={cn("h-4 w-4", isWarning && "animate-spin-slow")} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>
    </header>
  )
}
