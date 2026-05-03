'use client'

import { Textarea } from '@/components/ui/textarea'
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

  return (
    <div className="space-y-3">
      <p className="font-medium text-sm leading-relaxed">
        <span className="font-bold mr-1">Câu {questionNumber}.</span>
        {question.content}
      </p>
      {question.rubric && (
        <p className="text-xs text-muted-foreground italic">{question.rubric}</p>
      )}
      <Textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Nhập câu trả lời..."
        className={isParagraph ? 'min-h-40' : 'min-h-20'}
      />
    </div>
  )
}
