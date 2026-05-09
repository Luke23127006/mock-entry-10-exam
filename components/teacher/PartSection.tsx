'use client'

import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExamPartHeader from '@/components/exam/ExamPartHeader'
import QuestionEditorCard from './QuestionEditorCard'
import type { ExamBuilderValues, PartKey } from './ExamBuilderForm'

const FIELD_NAMES = {
  A: 'questionsA',
  B: 'questionsB',
  C: 'questionsC',
  D: 'questionsD',
} as const

const DEFAULT_QUESTION = {
  type: 'single' as const,
  content: '',
  pointValue: 0.2,
  options: ['', '', '', ''],
  correctAnswer: '',
  correctAnswers: [] as string[],
  rubric: '',
}

interface Props {
  part: PartKey
  control: Control<ExamBuilderValues>
  register: UseFormRegister<ExamBuilderValues>
}

export default function PartSection({ part, control, register }: Props) {
  const name = FIELD_NAMES[part]
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <section className="space-y-4">
      <ExamPartHeader part={part} />
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Chưa có câu hỏi nào.</p>
      )}
      {fields.map((field, index) => (
        <QuestionEditorCard
          key={field.id}
          control={control}
          register={register}
          fieldPrefix={`${name}.${index}`}
          questionNumber={index + 1}
          onRemove={() => remove(index)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(DEFAULT_QUESTION)}
        className="gap-1.5"
      >
        <Plus className="size-3.5" />
        Thêm câu hỏi
      </Button>
    </section>
  )
}
