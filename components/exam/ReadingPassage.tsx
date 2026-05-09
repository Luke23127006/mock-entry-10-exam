import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReadingPassageProps {
  content: string
  className?: string
}

export function ReadingPassage({ content, className }: ReadingPassageProps) {
  return (
    <Card className={cn("bg-muted/30 border-none shadow-inner ring-1 ring-border/50", className)}>
      <CardContent className="p-6">
        <div 
          className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10"
        >
          <div className="text-foreground leading-loose font-serif text-[1.05rem] antialiased">
            {content.split('\n\n').map((para, i) => (
              <p key={i} className="mb-6 last:mb-0">
                {para}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
