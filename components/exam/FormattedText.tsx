import * as React from 'react'

interface FormattedTextProps {
  text?: string
  className?: string
}

export function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null

  // Regex to find __text__ and group the 'text'
  // Using [^__] might be safer or just non-greedy .*?
  const parts = text.split(/(__.*?__)/g)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('__') && part.endsWith('__')) {
          const content = part.slice(2, -2)
          return (
            <span key={index} className="underline decoration-2 underline-offset-4 font-bold text-primary/90">
              {content}
            </span>
          )
        }
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </span>
  )
}
