'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ExamPartHeader from './ExamPartHeader'
import SingleChoiceQuestion from './SingleChoiceQuestion'
import MultipleChoiceQuestion from './MultipleChoiceQuestion'
import WritingQuestion from './WritingQuestion'
import ExamTimer from './ExamTimer'
import type { Exam, ExamAttempt, Question } from '@/types/database'

interface Props {
  attempt: ExamAttempt
  exam: Exam
}

const PARTS = ['A', 'B', 'C', 'D'] as const
const AUTO_SAVE_INTERVAL_MS = 10_000

async function callSaveDraftApi(
  attemptId: string,
  answers: Record<string, string | string[]>,
): Promise<void> {
  await fetch('/api/attempts/save-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId, answers }),
  })
}

export default function AnswerSheet({ attempt, exam }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    attempt.answers ?? {},
  )
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const isPending = isSubmitting // alias for existing logic

  // Track whether answers have changed since the last save
  const lastSavedRef = useRef<Record<string, string | string[]>>(attempt.answers ?? {})
  const answersRef = useRef(answers)

  // Keep answersRef in sync without causing re-renders
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // ── Auto-save every 10 seconds if answers changed ──────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const current = answersRef.current
      // Simple reference check; JSON comparison would be safer but more expensive
      if (current === lastSavedRef.current) return

      await callSaveDraftApi(attempt.id, current)
      lastSavedRef.current = current
    }, AUTO_SAVE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [attempt.id])

  // ── Manual save ────────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      await callSaveDraftApi(attempt.id, answersRef.current)
      lastSavedRef.current = answersRef.current
      toast.success('Đã lưu nháp', { description: 'Câu trả lời của bạn đã được lưu.' })
    } catch {
      toast.error('Lưu thất bại', { description: 'Vui lòng thử lại.' })
    } finally {
      setIsSaving(false)
    }
  }, [attempt.id])

  // ── Answer change handler ──────────────────────────────────────────────────
  const handleAnswerChange = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }))
    },
    [],
  )

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitToApi = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attempt.id, answers: answersRef.current }),
      })
      const data = await res.json()
      if (res.ok && data.redirect) {
        router.push(data.redirect)
      } else {
        toast.error('Nộp bài thất bại', { description: data.error || 'Vui lòng thử lại.' })
        setIsSubmitting(false)
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { description: 'Vui lòng kiểm tra mạng và thử lại.' })
      setIsSubmitting(false)
    }
  }

  const handleSubmit = useCallback(() => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể chỉnh sửa.'))
      return
    submitToApi()
  }, [attempt.id])

  const handleExpire = useCallback(() => {
    toast.info('Hết giờ làm bài', { description: 'Hệ thống đang tự động nộp bài...' })
    submitToApi()
  }, [attempt.id])

  const questions = exam.content.questions
  let questionNumber = 0

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-sm leading-tight">{exam.title}</h1>
            <p className="text-xs text-muted-foreground">Tự động lưu mỗi 10 giây</p>
          </div>
          <div className="flex items-center gap-2">
            <ExamTimer durationSeconds={90 * 60} onExpire={handleExpire} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving || isPending}
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>
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
                      {q.type === 'single' && (
                        <SingleChoiceQuestion
                          question={q}
                          questionNumber={num}
                          answer={typeof answer === 'string' ? answer : ''}
                          onChange={(v) => handleAnswerChange(q.id, v)}
                          disabled={isPending}
                        />
                      )}
                      {q.type === 'multiple' && (
                        <MultipleChoiceQuestion
                          question={q}
                          questionNumber={num}
                          answer={Array.isArray(answer) ? answer : []}
                          onChange={(v) => handleAnswerChange(q.id, v)}
                          disabled={isPending}
                        />
                      )}
                      {q.type === 'writing' && (
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

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} size="lg">
            {isPending ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </div>
      </div>
    </div>
  )
}
