'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { Lightbulb } from 'lucide-react'
import { FormattedText } from './FormattedText'

interface QuestionEssayProps {
  id: string
  promptText: string
  minWords?: number
  maxWords?: number
  value?: string
  onChange?: (value: string) => void
  questionNumber?: number
  isReviewMode?: boolean
  explanation?: string
  rubric?: string
}

export function QuestionEssay({
  id,
  promptText,
  minWords,
  maxWords,
  value = '',
  onChange,
  questionNumber,
  isReviewMode,
  explanation,
  rubric
}: QuestionEssayProps) {
  const wordCount = React.useMemo(() => {
    const trimmed = value.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }, [value])

  const isOverLimit = maxWords ? wordCount > maxWords : false

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex gap-3">
        {questionNumber && (
          <span className="flex items-center justify-center font-bold text-primary bg-primary/10 rounded-full w-8 h-8 shrink-0 text-sm">
            {questionNumber}
          </span>
        )}
        <div className="font-semibold text-lg text-foreground leading-snug pt-1">
          <FormattedText text={promptText} />
        </div>
      </div>

      <div className="pl-0 sm:pl-11 space-y-3">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={isReviewMode}
          placeholder="Start writing your essay here..."
          className={cn(
            "min-h-[300px] text-[1.05rem] leading-loose font-serif rounded-2xl p-6 focus-visible:ring-primary/20 transition-all border-border/50 shadow-sm resize-y",
            isOverLimit ? "border-destructive focus-visible:ring-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]" : "focus-visible:border-primary shadow-[0_0_15px_rgba(var(--primary),0.02)]",
            isReviewMode && "bg-muted/50 cursor-not-allowed"
          )}
        />
        
        <div className="flex items-center justify-between px-2">
          <div className={cn(
            "text-sm font-bold flex items-center gap-2 py-1 px-3 rounded-full border transition-colors",
            isOverLimit 
              ? "text-destructive border-destructive/20 bg-destructive/5" 
              : "text-muted-foreground border-border/50 bg-muted/30"
          )}>
            <span className="text-[10px] uppercase tracking-widest opacity-70">Word Count</span>
            <span className="tabular-nums font-mono">
              {wordCount} {maxWords && <span className="opacity-40">/ {maxWords}</span>}
            </span>
          </div>

          {minWords && wordCount < minWords && wordCount > 0 && !isReviewMode && (
            <p className="text-[11px] text-muted-foreground font-medium italic animate-pulse">
              Min. {minWords} words required
            </p>
          )}
        </div>
      </div>

      {isReviewMode && (
        <div className="mt-6 pl-0 sm:pl-11 animate-in zoom-in-95 duration-300">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 text-sm">
            <div className="flex items-center gap-2 mb-3 font-bold text-blue-700">
              <Lightbulb className="h-4 w-4" />
              <span className="uppercase tracking-wider text-xs">Grading Guide / Rubric</span>
            </div>
            <div className="space-y-3 text-blue-900/80 leading-relaxed">
              {rubric && (
                <div className="flex gap-2">
                  <span className="font-bold text-blue-800 shrink-0">Rubric:</span>
                  <span className="font-semibold text-blue-900">{rubric}</span>
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
