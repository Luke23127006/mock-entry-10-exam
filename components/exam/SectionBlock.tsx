import * as React from 'react'

interface SectionBlockProps {
  title: string
  instruction?: string
  children: React.ReactNode
}

export function SectionBlock({ title, instruction, children }: SectionBlockProps) {
  return (
    <section className="space-y-6 py-8 first:pt-4">
      <div className="space-y-1.5 border-l-4 border-primary pl-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-primary uppercase">
          {title}
        </h2>
        {instruction && (
          <p className="text-sm italic text-muted-foreground leading-relaxed font-medium">
            {instruction}
          </p>
        )}
      </div>
      <div className="space-y-8">
        {children}
      </div>
    </section>
  )
}
