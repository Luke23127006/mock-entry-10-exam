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
    .select('id, title, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trang giáo viên</h1>
              <p className="text-sm text-muted-foreground font-medium">Xin chào, {session?.full_name}</p>
            </div>
          </div>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive transition-colors rounded-full px-4">
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </form>
        </div>

        <div className="flex justify-between items-center px-2">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Danh sách đề thi</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Quản lý và theo dõi bài làm</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teacher/attempts" className={cn(buttonVariants({ variant: 'outline' }), "rounded-2xl px-6 font-semibold border-primary/20 hover:bg-primary/5 transition-all shadow-sm")}>
              <ClipboardList className="h-5 w-5 mr-2" />
              Xem tất cả bài nộp
            </Link>
            {/* <Link href="/teacher/exams/new" className={cn(buttonVariants({ size: 'default' }), "rounded-2xl px-6 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]")}>
              <Plus className="h-5 w-5 mr-2" />
              Tạo đề thi mới
            </Link> */}
          </div>
        </div>

        <TeacherExamList exams={(exams || []) as any[]} />
      </div>
    </main>
  )
}

import { cn } from '@/lib/utils'
import { Plus, User, LogOut, ClipboardList } from 'lucide-react'
import { TeacherExamList } from '@/components/teacher/teacher-exam-list'
