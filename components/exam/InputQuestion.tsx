'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/database'

interface Props {
  question: Question
  questionNumber: number
  answer: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function InputQuestion({
  question,
  questionNumber,
  answer,
  onChange,
  disabled,
}: Props) {
  const isSentenceTransform = question.part === 'D' && question.content.includes('→')
  const wordRoot = question.metadata?.wordRoot

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="font-bold text-sm mt-0.5 shrink-0">Câu {questionNumber}.</span>
        <div className="text-sm leading-relaxed font-medium flex-1">
          {question.content}
          {wordRoot && (
            <span className="ml-2 font-bold text-primary">({wordRoot.toUpperCase()})</span>
          )}
        </div>
      </div>

      <div className="relative group">
        <Input
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={isSentenceTransform ? "Viết lại câu..." : "Nhập đáp án..."}
          className={cn(
            "h-10 transition-all duration-200 border-muted focus-visible:ring-primary/20",
            isSentenceTransform ? "text-sm italic" : "text-sm font-medium"
          )}
        />
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
      </div>
    </div>
  )
}
