'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  durationSeconds: number
  onExpire: () => void
}

export default function ExamTimer({ durationSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isWarning = remaining < 300 // < 5 minutes

  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums px-3 py-1.5 rounded-full ${
        isWarning
          ? 'bg-destructive/10 text-destructive'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      <span>⏱</span>
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
