import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { submitWritingFeedback } from '@/app/actions/teacher'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import QuestionGradingCard from '@/components/teacher/QuestionGradingCard'
import type { Exam, ExamAttempt, User, Question, WritingFeedback } from '@/types/database'

interface Props {
  params: Promise<{ attemptId: string }>
}

export default async function FeedbackPage({ params }: Props) {
  const { attemptId } = await params

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single<ExamAttempt>()

  if (!attempt || attempt.status !== 'completed') redirect('/teacher/attempts')

  const [{ data: exam }, { data: student }] = await Promise.all([
    supabase.from('exams').select('*').eq('id', attempt.exam_id).single<Exam>(),
    supabase.from('users').select('full_name, username').eq('id', attempt.user_id).single<Pick<User, 'full_name' | 'username'>>(),
  ])

  if (!exam) redirect('/teacher/attempts')

  const content = exam.content as any
  const questions = [
    ...(content.questions || []),
    ...(content.sections?.flatMap((s: any) => s.components) || [])
  ]

  let existingFeedback: Record<string, WritingFeedback> = {}
  if (attempt.feedback) {
    if (typeof attempt.feedback === 'string' && (attempt.feedback as string).trim() !== '') {
      try {
        existingFeedback = JSON.parse(attempt.feedback)
      } catch (e) {
        console.error('Failed to parse existing feedback:', e)
      }
    } else if (typeof attempt.feedback === 'object') {
      existingFeedback = attempt.feedback as Record<string, WritingFeedback>
    }
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const feedback: Record<string, WritingFeedback> = {}
    for (const q of questions) {
      const scoreStr = formData.get(`feedback[${q.id}][score]`)
      const comment = (formData.get(`feedback[${q.id}][comment]`) as string) ?? ''
      
      // If teacher touched the score or comment, or if it was already existing
      if (scoreStr !== null || comment || existingFeedback[q.id]) {
        const score = parseFloat(scoreStr as string) || 0
        feedback[q.id] = { score, comment, isAI: false }
      }
    }
    await submitWritingFeedback(attemptId, feedback)
  }

  const checkIsCorrect = (q: any, answer: any) => {
    const type = (q.type || '').toLowerCase()
    const correctAnswers = q.correctAnswers || []
    const norm = (s: string) => s.trim().toLowerCase()
    
    if (typeof answer === 'string') {
      return correctAnswers.some((ca: string) => norm(answer) === norm(ca))
    } else if (Array.isArray(answer)) {
      const given = [...answer].map(norm).sort()
      const exp = [...correctAnswers].map(norm).sort()
      return given.length === exp.length && given.every((v, i) => v === exp[i])
    }
    return false
  }

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chấm bài & Điều chỉnh điểm</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Học sinh: <span className="font-bold text-foreground">{student?.full_name ?? student?.username}</span> — {exam.title}
            </p>
          </div>
          <Link href="/teacher/attempts" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ← Quay lại
          </Link>
        </div>

        <form action={handleSubmit} className="space-y-6 pb-20">
          {questions.map((q: Question, idx: number) => {
            const answer = attempt.answers[q.id]
            const isCorrect = checkIsCorrect(q, answer)
            const autoScore = isCorrect ? (q.pointValue ?? 1) : 0

            return (
              <QuestionGradingCard
                key={q.id}
                question={q}
                questionNumber={idx + 1}
                studentAnswer={answer as any}
                existing={existingFeedback[q.id] ?? null}
                autoScore={autoScore}
              />
            )
          })}
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t shadow-lg z-50">
            <div className="max-w-3xl mx-auto flex justify-end">
              <Button type="submit" size="lg" className="rounded-full px-10 shadow-xl">
                Hoàn tất & Lưu điểm số
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
