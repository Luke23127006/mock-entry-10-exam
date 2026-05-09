'use client'

import * as React from 'react'

interface BlankDefinition {
  id: string
}

interface InlineClozePassageProps {
  passageContent: string
  blanks: BlankDefinition[]
}

export function InlineClozePassage({
  passageContent,
  blanks,
}: InlineClozePassageProps) {
  // Regex to find markers like [21], [id], etc.
  const parts = React.useMemo(() => {
    return passageContent.split(/(\[\w+\])/g)
  }, [passageContent])

  return (
    <div className="text-lg leading-[2.2] text-foreground font-serif text-justify antialiased">
      {parts.map((part, index) => {
        // Check if this part is a marker [id]
        const match = part.match(/^\[(\w+)\]$/)
        if (match) {
          const blankId = match[1]
          const blankDef = blanks.find((b) => b.id === blankId)

          if (!blankDef) return <span key={index}>{part}</span>

          return (
            <span key={index} className="inline-flex items-baseline mx-1">
              <span className="font-bold text-primary mr-1">({blankId})</span>
              <span className="border-b-2 border-muted-foreground/30 w-16 h-1 inline-block -mb-1" />
            </span>
          )
        }

        // Regular text fragment
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}
