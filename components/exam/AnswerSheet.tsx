'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { saveAnswersDraft, submitExam } from '@/app/actions/exam'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ExamPartHeader from './ExamPartHeader'
import SingleChoiceQuestion from './SingleChoiceQuestion'
import WritingQuestion from './WritingQuestion'
import ExamTimer from './ExamTimer'
import type { Exam, ExamAttempt, Question } from '@/types/database'

interface Props {
  attempt: ExamAttempt
  exam: Exam
}

const PARTS = ['A', 'B', 'C', 'D'] as const

export default function AnswerSheet({ attempt, exam }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    attempt.answers ?? {},
  )
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAnswerChange = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value }

        // Debounced auto-save
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
          saveAnswersDraft(attempt.id, next)
        }, 3000)

        return next
      })
    },
    [attempt.id],
  )

  const handleSubmit = useCallback(() => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể chỉnh sửa.'))
      return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    startTransition(() => submitExam(attempt.id, answers))
  }, [attempt.id, answers])

  const handleExpire = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    startTransition(() => submitExam(attempt.id, answers))
  }, [attempt.id, answers])

  const questions = exam.content.questions
  let questionNumber = 0

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-sm leading-tight">{exam.title}</h1>
            <p className="text-xs text-muted-foreground">Lưu tự động mỗi 3 giây</p>
          </div>
          <div className="flex items-center gap-3">
            <ExamTimer durationSeconds={90 * 60} onExpire={handleExpire} />
            <Button onClick={handleSubmit} disabled={isPending} size="sm">
              {isPending ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {PARTS.map((part) => {
          const partQuestions = questions.filter((q: Question) => q.part === part)
          if (partQuestions.length === 0) return null
          return (
            <section key={part} className="space-y-4">
              <ExamPartHeader part={part} />
              {partQuestions.map((q: Question) => {
                questionNumber++
                const num = questionNumber
                const answer = answers[q.id]
                return (
                  <Card key={q.id}>
                    <CardContent className="pt-4">
                      {q.type === 'single' ? (
                        <SingleChoiceQuestion
                          question={q}
                          questionNumber={num}
                          answer={typeof answer === 'string' ? answer : ''}
                          onChange={(v) => handleAnswerChange(q.id, v)}
                          disabled={isPending}
                        />
                      ) : (
                        <WritingQuestion
                          question={q}
                          questionNumber={num}
                          answer={typeof answer === 'string' ? answer : ''}
                          onChange={(v) => handleAnswerChange(q.id, v)}
                          disabled={isPending}
                        />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </section>
          )
        })}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isPending} size="lg">
            {isPending ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </div>
      </div>
    </div>
  )
}
