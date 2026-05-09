import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { scoreExam } from '@/lib/scoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import type { Exam, ExamAttempt, Question } from '@/types/database'

interface Props {
  params: Promise<{ attemptId: string }>
}

const PART_LABELS: Record<string, string> = {
  A: 'Part A — Pronunciation',
  B: 'Part B — Structures & Vocabulary',
  C: 'Part C — Reading Comprehension',
  D: 'Part D — Writing',
}

export default async function ResultPage({ params }: Props) {
  const { attemptId } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', session.id)
    .single<ExamAttempt>()

  if (!attempt) redirect('/dashboard')
  if (attempt.status !== 'completed') redirect(`/exam/${attemptId}`)

  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', attempt.exam_id)
    .single<Exam>()

  if (!exam) redirect('/dashboard')

  const questions = exam.content.questions
  const answers = attempt.answers
  const { autoScore, maxAutoScore, hasWriting } = scoreExam(questions, answers)

  const parts = ['A', 'B', 'C', 'D'] as const

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Score summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Kết quả bài thi</CardTitle>
            <p className="text-muted-foreground text-sm">{exam.title}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">
              {autoScore}
              <span className="text-base font-normal text-muted-foreground">
                /{maxAutoScore} điểm (trắc nghiệm)
              </span>
            </p>
            {hasWriting && (
              <p className="text-sm text-amber-600 font-medium">
                ⏳ Phần tự luận đang chờ giáo viên chấm điểm.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Per-part breakdown */}
        {parts.map((part) => {
          const partQs = questions.filter((q: Question) => q.part === part)
          if (partQs.length === 0) return null
          return (
            <section key={part} className="space-y-3">
              <h2 className="font-semibold text-sm">{PART_LABELS[part]}</h2>
              {partQs.map((q: Question, idx: number) => {
                const answer = answers[q.id]
                const isWriting = q.type === 'writing'

                let isCorrect = false
                if (!isWriting && q.correctAnswers?.length) {
                  const norm = (s: string) => s.trim().toLowerCase()
                  if (q.type === 'single' && typeof answer === 'string') {
                    isCorrect = norm(answer) === norm(q.correctAnswers[0])
                  } else if (q.type === 'multiple' && Array.isArray(answer)) {
                    const given = [...answer].map(norm).sort()
                    const exp = [...q.correctAnswers].map(norm).sort()
                    isCorrect =
                      given.length === exp.length &&
                      given.every((v, i) => v === exp[i])
                  }
                }

                return (
                  <Card key={q.id} className={isWriting ? '' : isCorrect ? 'ring-1 ring-green-500/40' : 'ring-1 ring-destructive/40'}>
                    <CardContent className="pt-4 space-y-2">
                      <p className="text-sm font-medium">
                        <span className="font-bold mr-1">Câu {idx + 1}.</span>
                        {q.content}
                      </p>

                      {isWriting ? (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Câu trả lời của bạn:</p>
                          <p className="text-sm bg-muted/50 rounded p-2 whitespace-pre-wrap min-h-8">
                            {typeof answer === 'string' && answer ? answer : <em className="text-muted-foreground">Chưa trả lời</em>}
                          </p>
                          {q.rubric && (
                            <p className="text-xs text-muted-foreground italic">Gợi ý: {q.rubric}</p>
                          )}
                          <p className="text-xs text-amber-600">⏳ Chờ giáo viên chấm</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 text-sm">
                          <span>
                            Câu trả lời của bạn:{' '}
                            <strong>{Array.isArray(answer) ? answer.join(', ') : (answer || '—')}</strong>
                          </span>
                          <span>
                            Đáp án đúng:{' '}
                            <strong className="text-green-600">
                              {q.correctAnswers?.join(', ') ?? '—'}
                            </strong>
                          </span>
                          <span className={isCorrect ? 'text-green-600' : 'text-destructive'}>
                            {isCorrect ? '✓ Đúng' : '✗ Sai'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </section>
          )
        })}

        <div className="flex justify-center pt-4">
          <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
