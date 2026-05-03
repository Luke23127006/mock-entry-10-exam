import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { logout } from '@/app/actions/auth'
import { startExam } from '@/app/actions/exam'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Exam, ExamAttempt } from '@/types/database'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [{ data: exams }, { data: attempts }] = await Promise.all([
    supabase.from('exams').select('id, title').order('title'),
    supabase
      .from('exam_attempts')
      .select('id, exam_id, status, score')
      .eq('user_id', session.id),
  ])

  const attemptByExam = new Map<string, Pick<ExamAttempt, 'id' | 'status' | 'score'>>()
  for (const a of attempts ?? []) {
    const existing = attemptByExam.get(a.exam_id)
    // Prefer completed over draft; keep most recent draft
    if (!existing || (existing.status === 'draft' && a.status === 'completed')) {
      attemptByExam.set(a.exam_id, a)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Danh sách đề thi</h1>
            <p className="text-sm text-muted-foreground">Xin chào, {session.full_name}</p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">Đăng xuất</Button>
          </form>
        </div>

        {/* Exam list */}
        {(exams ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa có đề thi nào.</p>
        ) : (
          <div className="space-y-4">
            {(exams as Pick<Exam, 'id' | 'title'>[]).map((exam) => {
              const attempt = attemptByExam.get(exam.id)
              return (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    {attempt?.status === 'completed' && (
                      <CardDescription>
                        Điểm: <strong>{attempt.score}</strong>
                      </CardDescription>
                    )}
                    {attempt?.status === 'draft' && (
                      <CardDescription className="text-amber-600">
                        Đang làm dở — chưa nộp
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {!attempt && (
                      <form action={startExam.bind(null, exam.id)}>
                        <Button type="submit" size="sm">Bắt đầu làm bài</Button>
                      </form>
                    )}
                    {attempt?.status === 'draft' && (
                      <Link href={`/exam/${attempt.id}`} className={buttonVariants({ size: 'sm', variant: 'secondary' })}>
                        Tiếp tục làm bài
                      </Link>
                    )}
                    {attempt?.status === 'completed' && (
                      <Link href={`/exam/${attempt.id}/result`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                        Xem kết quả
                      </Link>
                    )}
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
