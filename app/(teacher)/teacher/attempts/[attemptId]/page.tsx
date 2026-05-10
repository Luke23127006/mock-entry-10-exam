import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { submitWritingFeedback } from '@/app/actions/teacher'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import QuestionGradingCard from '@/components/teacher/QuestionGradingCard'
import type { Exam, ExamAttempt, User, Question, WritingFeedback } from '@/types/database'
import { ChevronLeft, PencilLine, CheckCircle, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <PencilLine className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Chấm bài & Điều chỉnh</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mt-0.5">
                <UserCircle className="h-3.5 w-3.5" />
                <span>{student?.full_name ?? student?.username}</span>
                <span className="opacity-30">•</span>
                <span className="line-clamp-1">{exam.title}</span>
              </div>
            </div>
          </div>
          <Link 
            href="/teacher/attempts" 
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "rounded-full px-4 border-primary/20 hover:bg-primary/5 transition-all gap-1.5 shadow-sm self-start md:self-center")}
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>

        <form action={handleSubmit} className="space-y-6 pb-24">
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
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-primary/10 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <p className="hidden md:block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">
                Đang chấm {questions.length} câu hỏi
              </p>
              <Button type="submit" size="lg" className="w-full md:w-auto rounded-2xl px-12 font-bold shadow-lg shadow-primary/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <CheckCircle className="h-5 w-5" />
                Hoàn tất & Lưu điểm số
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
