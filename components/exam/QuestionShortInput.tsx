'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Lightbulb } from 'lucide-react'
import { FormattedText } from './FormattedText'

interface QuestionShortInputProps {
  id: string
  content: string
  prefix?: string
  hintText?: string
  value?: string
  onChange?: (value: string) => void
  questionNumber?: number
  isReviewMode?: boolean
  explanation?: string
  correctAnswers?: string[]
}

export function QuestionShortInput({
  id,
  content,
  prefix,
  hintText,
  value = '',
  onChange,
  questionNumber,
  isReviewMode,
  explanation,
  correctAnswers
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
          <FormattedText text={content} />
        </div>
      </div>

      <div className="pl-0 sm:pl-11">
        <div className="flex items-center gap-3 w-full">
          {prefix && (
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest shrink-0 bg-muted/50 px-3 py-2 rounded-lg border border-border/50 shadow-sm">
              <FormattedText text={prefix} />
            </span>
          )}
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={isReviewMode}
            placeholder={hintText || "Enter your answer..."}
            className={cn(
              "text-base font-semibold h-12 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary border-border/50 shadow-sm transition-all",
              isReviewMode && "bg-muted/50 cursor-not-allowed"
            )}
          />
        </div>
      </div>

      {isReviewMode && (
        <div className="mt-6 pl-0 sm:pl-11 animate-in zoom-in-95 duration-300">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 text-sm">
            <div className="flex items-center gap-2 mb-3 font-bold text-blue-700">
              <Lightbulb className="h-4 w-4" />
              <span className="uppercase tracking-wider text-xs">Explanation</span>
            </div>
            <div className="space-y-3 text-blue-900/80 leading-relaxed">
              {correctAnswers && correctAnswers.length > 0 && (
                <div className="flex gap-2">
                  <span className="font-bold text-blue-800 shrink-0">Correct Answer:</span>
                  <span className="font-semibold text-blue-900">{correctAnswers.join(', ')}</span>
                </div>
              )}
              {explanation ? (
                <p className="italic">{explanation}</p>
              ) : (
                <p className="text-blue-600/60 italic">No additional explanation provided.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
