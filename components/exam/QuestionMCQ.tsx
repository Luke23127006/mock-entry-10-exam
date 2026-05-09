'use client'

import * as React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface QuestionMCQProps {
  id: string
  content: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
  questionNumber?: number
}

export function QuestionMCQ({
  id,
  content,
  options,
  value,
  onChange,
  questionNumber
}: QuestionMCQProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex gap-3">
        {questionNumber && (
          <span className="flex items-center justify-center font-bold text-primary bg-primary/10 rounded-full w-8 h-8 shrink-0 text-sm">
            {questionNumber}
          </span>
        )}
        <div className="font-semibold text-lg text-foreground leading-snug pt-1">
          {content}
        </div>
      </div>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-3 pl-0 sm:pl-11"
      >
        {options.map((option, index) => {
          const optionId = `${id}-opt-${index}`
          const isSelected = value === option
          
          return (
            <div
              key={optionId}
              className={cn(
                "group relative flex items-center space-x-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.05)]" 
                  : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
              )}
              onClick={() => onChange?.(option)}
            >
              <RadioGroupItem value={option} id={optionId} className="shrink-0" />
              <Label
                htmlFor={optionId}
                className="flex-1 cursor-pointer font-medium text-[1.05rem] text-foreground/90 group-hover:text-foreground transition-colors"
              >
                {option}
              </Label>
              {isSelected && (
                <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-l-xl" />
              )}
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
