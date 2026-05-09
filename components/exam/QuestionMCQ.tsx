'use client'

import * as React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Lightbulb } from 'lucide-react'

interface QuestionMCQProps {
  id: string
  content: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
  questionNumber?: number | string
  isReviewMode?: boolean
  explanation?: string
  correctAnswers?: string[]
  variant?: 'default' | 'compact'
}

export function QuestionMCQ({
  id,
  content,
  options,
  value,
  onChange,
  questionNumber,
  isReviewMode,
  explanation,
  correctAnswers,
  variant = 'default'
}: QuestionMCQProps) {
  if (variant === 'compact') {
    return (
      <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {questionNumber && (
            <span className="font-bold text-primary text-base shrink-0">
              {questionNumber}.
            </span>
          )}
          <RadioGroup
            value={value}
            onValueChange={onChange}
            disabled={isReviewMode}
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {options.map((option, index) => {
              const optionId = `${id}-opt-${index}`
              const label = String.fromCharCode(65 + index)
              const isSelected = value === option
              const isCorrect = correctAnswers?.includes(option)

              return (
                <div key={optionId} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={optionId} className="h-4 w-4" />
                  <Label
                    htmlFor={optionId}
                    className={cn(
                      "flex items-center gap-1.5 cursor-pointer font-medium text-sm transition-colors",
                      isReviewMode && isCorrect && "text-green-600 font-bold",
                      isReviewMode && isSelected && !isCorrect && "text-destructive font-bold",
                      !isReviewMode && "hover:text-primary"
                    )}
                  >
                    <span className="opacity-60">{label}.</span>
                    <span>{option}</span>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>
        {isReviewMode && (explanation || (correctAnswers && correctAnswers.length > 0)) && (
          <div className="pl-6 text-[11px] text-blue-700/70 italic flex items-start gap-1.5">
            <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
            <p>
              {correctAnswers && correctAnswers.length > 0 && (
                <span className="font-bold mr-1">Answer: {correctAnswers.join(', ')}.</span>
              )}
              {explanation}
            </p>
          </div>
        )}
      </div>
    )
  }

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
        disabled={isReviewMode}
        className="grid gap-3 pl-0 sm:pl-11"
      >
        {options.map((option, index) => {
          const optionId = `${id}-opt-${index}`
          const isSelected = value === option
          const isCorrect = correctAnswers?.includes(option)
          
          return (
            <div
              key={optionId}
              className={cn(
                "group relative flex items-center space-x-3 rounded-xl border p-4 transition-all duration-200",
                !isReviewMode && "cursor-pointer",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.05)]" 
                  : "border-border/50",
                !isReviewMode && !isSelected && "hover:border-primary/50 hover:bg-muted/30",
                isReviewMode && isCorrect && "border-green-500 bg-green-50/50",
                isReviewMode && isSelected && !isCorrect && "border-destructive/50 bg-destructive/5"
              )}
              onClick={() => !isReviewMode && onChange?.(option)}
            >
              <RadioGroupItem value={option} id={optionId} className="shrink-0" />
              <Label
                htmlFor={optionId}
                className={cn(
                  "flex-1 font-medium text-[1.05rem] transition-colors",
                  !isReviewMode && "cursor-pointer text-foreground/90 group-hover:text-foreground",
                  isReviewMode && isCorrect && "text-green-700",
                  isReviewMode && isSelected && !isCorrect && "text-destructive"
                )}
              >
                {option}
              </Label>
            </div>
          )
        })}
      </RadioGroup>

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
