import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { submitWritingFeedback } from '@/app/actions/teacher'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import WritingFeedbackCard from '@/components/teacher/WritingFeedbackCard'
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
  const writingQuestions = questions.filter((q: Question) => {
    const type = (q.type || '').toLowerCase()
    const part = (q.part || '').toLowerCase()
    return type.includes('writing') || 
           type.includes('essay') || 
           part.includes('d') || 
           part.includes('writing') ||
           !!q.rubric
  })
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
    for (const q of writingQuestions) {
    const score = parseFloat(formData.get(`feedback[${q.id}][score]`) as string) || 0
    const comment = (formData.get(`feedback[${q.id}][comment]`) as string) ?? ''
    feedback[q.id] = { score, comment, isAI: false }
  }
  await submitWritingFeedback(attemptId, feedback)
  }

  const questionNumbers = new Map<string, number>()
  questions.forEach((q: Question, idx: number) => {
    questionNumbers.set(q.id, idx + 1)
  })

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chấm bài tự luận</h1>
            <p className="text-sm text-muted-foreground">
              {student?.full_name ?? student?.username} — {exam.title}
            </p>
          </div>
          <Link href="/teacher/attempts" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ← Quay lại
          </Link>
        </div>

        {writingQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Đề thi này không có câu tự luận.</p>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            {writingQuestions.map((q: Question) => (
              <WritingFeedbackCard
                key={q.id}
                question={q}
                questionNumber={questionNumbers.get(q.id) ?? 0}
                studentAnswer={
                  typeof attempt.answers[q.id] === 'string'
                    ? (attempt.answers[q.id] as string)
                    : ''
                }
                existing={existingFeedback[q.id] ?? null}
              />
            ))}
            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg">Lưu điểm & nhận xét</Button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
