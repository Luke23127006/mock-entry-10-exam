'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface QuestionShortInputProps {
  id: string
  content: string
  prefix?: string
  hintText?: string
  value?: string
  onChange?: (value: string) => void
  questionNumber?: number
}

export function QuestionShortInput({
  id,
  content,
  prefix,
  hintText,
  value = '',
  onChange,
  questionNumber
}: QuestionShortInputProps) {
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

      <div className="pl-0 sm:pl-11">
        <div className="flex items-center gap-3 w-full md:w-2/3 lg:w-1/2">
          {prefix && (
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest shrink-0 bg-muted/50 px-3 py-2 rounded-lg border border-border/50 shadow-sm">
              {prefix}
            </span>
          )}
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={hintText || "Enter your answer..."}
            className="text-base font-semibold h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary border-border/50 shadow-sm transition-all"
          />
        </div>
      </div>
    </div>
  )
}
