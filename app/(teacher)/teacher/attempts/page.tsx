import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ExamAttempt, User, Exam } from '@/types/database'

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

  // Fetch related users and exams
  const userIds = [...new Set((attempts as AttemptRow[] ?? []).map((a) => a.user_id).filter(Boolean))]
  const examIds = [...new Set((attempts ?? []).map((a: AttemptRow) => a.exam_id))]

  const [{ data: users }, { data: exams }] = await Promise.all([
    supabase.from('users').select('id, full_name, username').in('id', userIds.length ? userIds : ['none']),
    supabase.from('exams').select('id, title').in('id', examIds.length ? examIds : ['none']),
  ])

  const userMap = new Map((users as UserRow[] ?? []).map((u) => [u.id, u]))
  const examMap = new Map((exams as Pick<Exam, 'id' | 'title'>[] ?? []).map((e) => [e.id, e]))

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bài nộp của học sinh</h1>
          <Link href="/teacher" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ← Quay lại
          </Link>
        </div>

        {(attempts ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bài nộp nào.</p>
        ) : (
          <div className="space-y-3">
            {(attempts as (AttemptRow & { user_id: string })[]).map((attempt) => {
              const user = userMap.get(attempt.user_id)
              const exam = examMap.get(attempt.exam_id)
              const hasWritingPending =
                attempt.feedback === null ||
                (typeof attempt.feedback === 'object' && Object.keys(attempt.feedback).length === 0)

              return (
                <Card key={attempt.id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">{user?.full_name ?? user?.username ?? 'Học sinh'}</CardTitle>
                    <CardDescription>{exam?.title ?? 'Đề thi'}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 flex items-center justify-between">
                    <div className="text-sm space-y-0.5">
                      <p>Điểm: <strong>{attempt.score || '—'}</strong></p>
                      {hasWritingPending && (
                        <p className="text-amber-600 text-xs">⏳ Phần viết chưa chấm</p>
                      )}
                    </div>
                    <Link
                      href={`/teacher/attempts/${attempt.id}`}
                      className={buttonVariants({ size: 'sm', variant: hasWritingPending ? 'default' : 'outline' })}
                    >
                      {hasWritingPending ? 'Chấm bài' : 'Xem lại'}
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
