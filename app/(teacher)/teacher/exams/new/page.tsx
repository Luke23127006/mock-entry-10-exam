import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import ExamBuilderForm from '@/components/teacher/ExamBuilderForm'

export default function NewExamPage() {
  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tạo đề thi mới</h1>
          <Link href="/teacher" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ← Quay lại
          </Link>
        </div>
        <ExamBuilderForm />
      </div>
    </main>
  )
}
