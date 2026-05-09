'use client'

import { cn } from '@/lib/utils'

interface Props {
  content: string
  title?: string
  className?: string
}

export default function PassageContainer({ content, title, className }: Props) {
  return (
    <div className={cn("bg-muted/40 rounded-xl border p-5 md:p-6 space-y-4", className)}>
      {title && (
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="prose prose-sm max-w-none">
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif italic">
          {content}
        </p>
      </div>
      <div className="h-1 w-20 bg-primary/20 rounded-full" />
    </div>
  )
}
