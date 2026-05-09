'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BlankDefinition {
  id: string
  type: 'input' | 'select'
  options?: string[]
}

interface InlineClozePassageProps {
  passageContent: string
  blanks: BlankDefinition[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
}

export function InlineClozePassage({
  passageContent,
  blanks,
  values,
  onChange
}: InlineClozePassageProps) {
  // Regex to find markers like [21], [id], etc.
  // Using capturing group to keep the markers in the split array
  const parts = React.useMemo(() => {
    return passageContent.split(/(\[\w+\])/g)
  }, [passageContent])

  return (
    <div className="text-lg leading-[2.5] text-foreground font-serif text-justify antialiased">
      {parts.map((part, index) => {
        // Check if this part is a marker [id]
        const match = part.match(/^\[(\w+)\]$/)
        if (match) {
          const blankId = match[1]
          const blankDef = blanks.find((b) => b.id === blankId)

          if (!blankDef) return <span key={index}>{part}</span>

          const value = values[blankId] || ''

          if (blankDef.type === 'select') {
            return (
              <select
                key={index}
                value={value}
                onChange={(e) => onChange(blankId, e.target.value)}
                className="inline-block min-w-[6rem] border-b-2 border-primary outline-none bg-primary/5 text-center mx-1.5 h-8 rounded-t-lg focus:border-b-4 transition-all cursor-pointer appearance-none px-3 font-sans font-bold text-sm text-primary shadow-sm"
              >
                <option value="" disabled>Select...</option>
                {blankDef.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )
          }

          return (
            <input
              key={index}
              type="text"
              value={value}
              onChange={(e) => onChange(blankId, e.target.value)}
              className="inline-block w-24 border-b-2 border-primary outline-none bg-transparent text-center mx-1.5 focus:border-b-4 transition-all font-sans font-bold text-base text-primary placeholder:text-muted-foreground/30"
              placeholder="..."
            />
          )
        }

        // Regular text fragment
        return <span key={index}>{part}</span>
      })}
    </div>
  )
}
