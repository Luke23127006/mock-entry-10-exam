'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Question } from '@/types/database'

interface Props {
  question: Question
  questionNumber: number
  answer: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export default function MultipleChoiceQuestion({
  question,
  questionNumber,
  answer,
  onChange,
  disabled,
}: Props) {
  const handleCheck = (opt: string, checked: boolean) => {
    if (checked) {
      onChange([...answer, opt])
    } else {
      onChange(answer.filter((a) => a !== opt))
    }
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-sm leading-relaxed">
        <span className="font-bold mr-1">Câu {questionNumber}.</span>
        {question.content}
        <span className="ml-2 text-xs text-muted-foreground">(Chọn nhiều đáp án)</span>
      </p>
      <div className="space-y-2">
        {(question.options ?? []).map((opt, i) => {
          const optId = `q-${question.id}-opt-${i}`
          return (
            <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/60 transition-colors">
              <Checkbox
                id={optId}
                checked={answer.includes(opt)}
                onCheckedChange={(checked) => handleCheck(opt, !!checked)}
                disabled={disabled}
              />
              <Label htmlFor={optId} className="text-sm cursor-pointer font-normal">
                {opt}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
