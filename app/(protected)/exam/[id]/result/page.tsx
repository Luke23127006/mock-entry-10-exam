import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { scoreExam } from '@/lib/scoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import type { Exam, ExamAttempt, Question } from '@/types/database'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

const PART_LABELS: Record<string, string> = {
  A: 'Part A — Pronunciation',
  B: 'Part B — Structures & Vocabulary',
  C: 'Part C — Reading Comprehension',
  D: 'Part D — Writing',
}

export default async function ResultPage({ params }: Props) {
  const { id: attemptId } = await params
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

  // Handle modular structure if content has sections
  const sections = (exam.content as any).sections || []
  const questions: Question[] = exam.content.questions || sections.flatMap((s: any) => s.components) || []
  
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
              {attempt.score || autoScore}
            </p>
            <p className="text-sm text-muted-foreground">
              (Trắc nghiệm: {autoScore}/{maxAutoScore} điểm)
            </p>
          </CardContent>
        </Card>

        {/* Per-part breakdown */}
        {/* Per-section/part breakdown */}
        {(sections.length > 0 ? sections : parts.map(p => ({
          title: PART_LABELS[p] || `Part ${p}`,
          components: questions.filter((q: Question) => q.part === p)
        }))).map((section: any, sIdx: number) => {
          const sectionQs = section.components || []
          if (sectionQs.length === 0) return null
          
          return (
            <section key={sIdx} className="space-y-3">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{section.title}</h2>
              {sectionQs.map((q: any, idx: number) => {
                const answer = answers[q.id]
                const isWriting = q.type === 'writing' || q.type === 'essay'
                let isCorrect = false
                const correctAnswers = q.correctAnswers || []

                if (!isWriting) {
                  const norm = (s: string) => s.trim().toLowerCase()
                  if (typeof answer === 'string') {
                    isCorrect = correctAnswers.some((ca: string) => norm(answer) === norm(ca))
                  } else if (Array.isArray(answer)) {
                    const given = [...answer].map(norm).sort()
                    const exp = [...correctAnswers].map(norm).sort()
                    isCorrect = given.length === exp.length && given.every((v, i) => v === exp[i])
                  }
                }

                return {
                  id: q.id,
                  content: q.content,
                  answer,
                  correctAnswers,
                  isCorrect,
                  isWriting,
                  feedback: attempt.feedback?.[q.id]
                }
              }).map((result: any, rIdx: number) => (
                <Card key={result.id} className={result.isWriting ? '' : result.isCorrect ? 'ring-1 ring-green-500/40' : 'ring-1 ring-destructive/40'}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="text-sm font-medium">
                      <span className="font-bold mr-2 text-primary">Question {rIdx + 1}</span>
                      {result.content}
                    </div>

                    {result.isWriting ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Your answer:</p>
                        <p className="text-sm bg-muted/50 rounded p-2 whitespace-pre-wrap min-h-8">
                          {typeof result.answer === 'string' && result.answer ? result.answer : <em className="text-muted-foreground">No answer</em>}
                        </p>
                        {result.feedback ? (
                          <div className="mt-3 bg-blue-50/50 p-3 rounded border border-blue-100">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Score: {result.feedback.score}/10
                            </p>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                              Feedback: {result.feedback.comment}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 mt-2">⏳ Pending evaluation</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 text-sm border-t pt-2 mt-2">
                        <span>
                          Your answer:{' '}
                          <strong className={cn(!result.answer && "italic text-muted-foreground")}>
                            {Array.isArray(result.answer) ? result.answer.join(', ') : (result.answer || 'Not answered')}
                          </strong>
                        </span>
                        <span>
                          Correct answer:{' '}
                          <strong className="text-green-600">
                            {result.correctAnswers?.join(', ') || '—'}
                          </strong>
                        </span>
                        <span className={cn("font-bold", result.isCorrect ? 'text-green-600' : 'text-destructive')}>
                          {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
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
