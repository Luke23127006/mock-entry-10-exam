import * as React from 'react'

interface FormattedTextProps {
  text?: string
  className?: string
}

export function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null

  // Refined regex: matches exactly two underscores (not preceded or followed by another underscore)
  // then any characters that DON'T contain '__', then exactly two underscores again.
  // This prevents it from matching across '___' or '_____' blanks.
  const parts = text.split(/((?<!_)__(?!_)(?:(?!__).)+?(?<!_)__(?!_))/g)

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
