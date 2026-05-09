import * as React from 'react'
import { Badge } from '@/components/ui/badge'

interface WordBankProps {
  words: string[]
}

export function WordBank({ words }: WordBankProps) {
  if (!words || words.length === 0) return null

  return (
    <div className="rounded-xl border bg-background/50 p-4 shadow-sm backdrop-blur-sm ring-1 ring-border/50">
      <h4 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
        Vocabulary Bank
      </h4>
      <div className="flex flex-wrap gap-2.5">
        {words.map((word, i) => (
          <Badge
            key={`${word}-${i}`}
            variant="secondary"
            className="px-4 py-1.5 text-sm font-semibold cursor-default hover:bg-secondary/80 border-b-2 border-primary/20 bg-secondary/50 backdrop-blur-sm"
          >
            {word}
          </Badge>
        ))}
      </div>
    </div>
  )
}
