import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import AnswerSheet from '@/components/exam/AnswerSheet'
import type { Exam, ExamAttempt } from '@/types/database'

interface Props {
  params: Promise<{ attemptId: string }>
}

export default async function ExamPage({ params }: Props) {
  const { attemptId } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', session.id)
    .single<ExamAttempt>()

  if (!attempt) redirect('/dashboard')
  if (attempt.status === 'completed') redirect(`/exam/${attemptId}/result`)

  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', attempt.exam_id)
    .single<Exam>()

  if (!exam) redirect('/dashboard')

  return <AnswerSheet attempt={attempt} exam={exam} />
}
