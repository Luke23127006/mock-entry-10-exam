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
    supabase.from('exams').select('id, title, content').order('title'),
    supabase
      .from('exam_attempts')
      .select('id, exam_id, status, score, feedback')
      .eq('user_id', session.id),
  ])

  const attemptByExam = new Map<string, Pick<ExamAttempt, 'id' | 'status' | 'score' | 'feedback'>>()
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
            <h1 className="text-2xl font-bold">Available Exams</h1>
            <p className="text-sm text-muted-foreground">Hello, {session.full_name}</p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">Sign Out</Button>
          </form>
        </div>

        {/* Exam list */}
        {(exams ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">No exams available yet.</p>
        ) : (
          <div className="space-y-4">
            {(exams as Exam[]).map((exam) => {
              const attempt = attemptByExam.get(exam.id)
              
              const content = exam.content as any
              const questions = content.questions || content.sections?.flatMap((s: any) => s.components) || []
              const hasWriting = questions.some((q: any) => {
                const type = (q.type || '').toLowerCase()
                const part = (q.part || '').toLowerCase()
                return type.includes('writing') || 
                       type.includes('essay') || 
                       part.includes('d') || 
                       part.includes('writing') ||
                       !!q.rubric
              })
              const isGraded = attempt?.feedback && 
                               Object.keys(attempt.feedback).length > 0 && 
                               !Object.values(attempt.feedback).some((f: any) => {
                                 return f.isAI || 
                                        f.comment === 'Không có câu trả lời.' || 
                                        f.comment === 'An error occurred during auto-grading.' ||
                                        f.comment === 'Đã xảy ra lỗi khi tự động chấm điểm.'
                               })
              
              return (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    {attempt?.status === 'completed' && (
                      <CardDescription>
                        {hasWriting && !isGraded ? (
                          <span className="text-amber-600 font-semibold italic flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Pending teacher evaluation
                          </span>
                        ) : (
                          <>Score: <strong>{attempt.score.toString().replace(' points', '').replace(' Points', '')} points</strong></>
                        )}
                      </CardDescription>
                    )}
                    {attempt?.status === 'draft' && (
                      <CardDescription className="text-amber-600">
                        In Progress — not submitted
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {!attempt && (
                      <form action={startExam.bind(null, exam.id)}>
                        <Button type="submit" size="sm">Start Exam</Button>
                      </form>
                    )}
                    {attempt?.status === 'draft' && (
                      <Link href={`/exam/${attempt.id}`} className={buttonVariants({ size: 'sm', variant: 'secondary' })}>
                        Continue Exam
                      </Link>
                    )}
                    {attempt?.status === 'completed' && (
                      <Link href={`/exam/${attempt.id}/result`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                        View Result
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
