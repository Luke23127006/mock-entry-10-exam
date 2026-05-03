import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') redirect('/dashboard')
  return <>{children}</>
}
