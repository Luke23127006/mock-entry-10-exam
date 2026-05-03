'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Question } from '@/types/database'

interface Props {
  question: Question
  questionNumber: number
  answer: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function SingleChoiceQuestion({
  question,
  questionNumber,
  answer,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-3">
      <p className="font-medium text-sm leading-relaxed">
        <span className="font-bold mr-1">Câu {questionNumber}.</span>
        {question.content}
      </p>
      <RadioGroup value={answer} onValueChange={onChange} disabled={disabled}>
        {(question.options ?? []).map((opt, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 hover:bg-muted/60 transition-colors"
          >
            <RadioGroupItem value={opt} />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
