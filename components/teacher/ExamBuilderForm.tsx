'use client'

import { useForm } from 'react-hook-form'
import { createExam } from '@/app/actions/teacher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PartSection from './PartSection'

export type PartKey = 'A' | 'B' | 'C' | 'D'

interface QuestionDraft {
  type: 'single' | 'multiple' | 'writing'
  content: string
  pointValue: number
  options: string[]
  correctAnswer: string // stores index as string for single
  correctAnswers: string[] // stores indices as strings for multiple
  rubric: string
}

export interface ExamBuilderValues {
  title: string
  questionsA: QuestionDraft[]
  questionsB: QuestionDraft[]
  questionsC: QuestionDraft[]
  questionsD: QuestionDraft[]
}

const PARTS: PartKey[] = ['A', 'B', 'C', 'D']

export default function ExamBuilderForm() {
  const { control, register, handleSubmit } = useForm<ExamBuilderValues>({
    defaultValues: { title: '', questionsA: [], questionsB: [], questionsC: [], questionsD: [] },
  })

  const onSubmit = handleSubmit(async (values) => {
    const questions = PARTS.flatMap((part) => {
      const key = `questions${part}` as keyof ExamBuilderValues
      const list = values[key] as QuestionDraft[]
      return list.map((q, i) => ({
        id: `${part}-${i}-${Date.now()}`,
        part,
        type: q.type,
        pointValue: q.pointValue ?? 0,
        content: q.content,
        options: q.type !== 'writing' ? q.options.filter(Boolean) : undefined,
        correctAnswers:
          q.type === 'single'
            ? [q.options[Number(q.correctAnswer)]].filter(Boolean)
            : q.type === 'multiple'
            ? q.correctAnswers.map((idx) => q.options[Number(idx)]).filter(Boolean)
            : undefined,
        rubric: q.rubric || undefined,
      }))
    })

    const fd = new FormData()
    fd.set('title', values.title)
    fd.set('questions', JSON.stringify(questions))
    await createExam(fd)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <div className="space-y-1.5">
        <Label htmlFor="title">Tên đề thi</Label>
        <Input
          id="title"
          {...register('title', { required: true })}
          placeholder="Đề thi thử vào 10 — Tiếng Anh"
          className="max-w-lg"
        />
      </div>

      {PARTS.map((part) => (
        <PartSection key={part} part={part} control={control} register={register} />
      ))}

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" size="lg">Lưu đề thi</Button>
      </div>
    </form>
  )
}
