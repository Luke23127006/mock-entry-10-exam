import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, GraduationCap, Search } from 'lucide-react'
import type { ExamAttempt, User, Exam } from '@/types/database'
import { cn } from '@/lib/utils'
import AttemptSearchGrid from '@/components/teacher/AttemptSearchGrid'

interface Props {
  searchParams: Promise<{ examId?: string }>
}

type AttemptRow = Pick<ExamAttempt, 'id' | 'user_id' | 'exam_id' | 'status' | 'score' | 'feedback'>
type UserRow = Pick<User, 'id' | 'full_name' | 'username'>

export default async function AttemptsPage({ searchParams }: Props) {
  const { examId } = await searchParams

  let query = supabase
    .from('exam_attempts')
    .select('id, user_id, exam_id, status, score, feedback')
    .eq('status', 'completed')
    .order('exam_id')

  if (examId) query = query.eq('exam_id', examId)

  const { data: attempts } = await query

  const userIds = [...new Set((attempts as AttemptRow[] ?? []).map((a) => a.user_id).filter(Boolean))]
  const examIds = [...new Set((attempts ?? []).map((a: AttemptRow) => a.exam_id))]

  const [{ data: users }, { data: exams }] = await Promise.all([
    supabase.from('users').select('id, full_name, username').in('id', userIds.length ? userIds : ['none']),
    supabase.from('exams').select('id, title, content').in('id', examIds.length ? examIds : ['none']),
  ])

  const userMap = new Map((users as UserRow[] ?? []).map((u) => [u.id, u]))
  const examMap = new Map((exams as Pick<Exam, 'id' | 'title' | 'content'>[] ?? []).map((e) => [e.id, e]))

  // Pre-compute max score per exam to avoid recalculating in the loop
  const examMaxScoreMap = new Map<string, number>()
  examMap.forEach((exam, examId) => {
    const content = exam.content as any
    const questions = [
      ...(content?.questions || []),
      ...(content?.sections?.flatMap((s: any) => s.components) || []),
    ]
    const max = Math.round(questions.reduce((sum: number, q: any) => sum + (q.pointValue ?? 1), 0) * 100) / 100
    examMaxScoreMap.set(examId, max)
  })

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Bài nộp của học sinh</h1>
              <p className="text-sm text-muted-foreground font-medium">Theo dõi và chấm điểm kết quả</p>
            </div>
          </div>
          <Link 
            href="/teacher" 
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "rounded-full px-4 border-primary/20 hover:bg-primary/5 transition-all gap-1.5 shadow-sm")}
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>

        {(attempts ?? []).length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg">Chưa có bài nộp nào</p>
                <p className="text-sm text-muted-foreground max-w-xs">Học sinh chưa hoàn thành bất kỳ bài thi nào cho mục này.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AttemptSearchGrid 
            attempts={(attempts as (AttemptRow & { user_id: string })[]).map(attempt => {
              const user = userMap.get(attempt.user_id)
              const exam = examMap.get(attempt.exam_id)
              return {
                ...attempt,
                userName: user?.full_name ?? user?.username ?? 'Học sinh',
                examTitle: exam?.title ?? 'Đề thi',
                maxScore: examMaxScoreMap.get(attempt.exam_id) ?? 0,
                hasWritingPending: 
                  attempt.feedback === null ||
                  (typeof attempt.feedback === 'object' && Object.keys(attempt.feedback).length === 0)
              }
            })} 
          />
        )}
      </div>
    </main>
  )
}
