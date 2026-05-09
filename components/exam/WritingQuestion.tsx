'use client'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/database'

interface Props {
  question: Question
  questionNumber: number
  answer: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function WritingQuestion({
  question,
  questionNumber,
  answer,
  onChange,
  disabled,
}: Props) {
  // Paragraph writing (Part D last question) gets a taller textarea
  const isParagraph = question.part === 'D' && !question.options
  const wordCount = answer ? answer.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <span className="font-bold text-sm mt-0.5 shrink-0">Câu {questionNumber}.</span>
        <div className="text-sm leading-relaxed font-medium flex-1">
          {question.content}
        </div>
      </div>
      
      {question.rubric && (
        <div className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 rounded-md px-3 py-1.5 flex items-center gap-2 italic">
          <span className="font-bold">Gợi ý:</span> {question.rubric}
        </div>
      )}

      <div className="relative">
        <Textarea
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={isParagraph ? "Bắt đầu viết đoạn văn của bạn ở đây..." : "Nhập câu trả lời..."}
          className={cn(
            "transition-all duration-200 border-muted focus-visible:ring-primary/20",
            isParagraph ? "min-h-[200px] leading-relaxed" : "min-h-[80px]"
          )}
        />
        {isParagraph && (
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-0.5 rounded border backdrop-blur-sm">
            {wordCount} words
          </div>
        )}
      </div>
    </div>
  )
}

