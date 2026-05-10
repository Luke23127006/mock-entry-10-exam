import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { ExamList } from '../../../components/exam/ExamList'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [{ data: exams }, { data: attempts }] = await Promise.all([
    supabase.from('exams').select('id, title, content, created_at').order('created_at', { ascending: false }),
    supabase
      .from('exam_attempts')
      .select('id, exam_id, status, score, feedback, is_graded')
      .eq('user_id', session.id),
  ])

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
        <ExamList 
          exams={(exams || []) as any[]} 
          attempts={(attempts || []) as any[]} 
        />
      </div>
    </main>
  )
}
