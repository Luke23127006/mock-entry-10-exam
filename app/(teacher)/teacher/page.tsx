import Link from 'next/link'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { logout } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Exam } from '@/types/database'

export default async function TeacherDashboard() {
  const session = await getSession()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, title')
    .order('title')

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trang giáo viên</h1>
            <p className="text-sm text-muted-foreground">Xin chào, {session?.full_name}</p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">Đăng xuất</Button>
          </form>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Danh sách đề thi</h2>
          <Link href="/teacher/exams/new" className={buttonVariants({ size: 'sm' })}>
            + Tạo đề thi mới
          </Link>
        </div>

        {(exams ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đề thi nào.</p>
        ) : (
          <div className="space-y-3">
            {(exams as Pick<Exam, 'id' | 'title'>[]).map((exam) => (
              <Card key={exam.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{exam.title}</CardTitle>
                    <Link
                      href={`/teacher/attempts?examId=${exam.id}`}
                      className={buttonVariants({ size: 'sm', variant: 'outline' })}
                    >
                      Xem bài nộp
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
