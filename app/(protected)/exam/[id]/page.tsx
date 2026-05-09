import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import AnswerSheet from '@/components/exam/AnswerSheet'
import type { Exam, ExamAttempt } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExamPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  // ── Try the ID as an attempt ID first ──────────────────────────────────────
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.id)
    .maybeSingle<ExamAttempt>()

  if (attempt) {
    // ID matched an attempt
    if (attempt.status === 'completed') redirect(`/exam/${id}/result`)

    const { data: exam } = await supabase
      .from('exams')
      .select('*')
      .eq('id', attempt.exam_id)
      .single<Exam>()

    if (!exam) redirect('/dashboard')
    return <AnswerSheet attempt={attempt} exam={exam} />
  }

  // ── Treat ID as an exam ID: find or create a draft attempt ─────────────────
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .maybeSingle<Exam>()

  if (!exam) redirect('/dashboard')

  // Check for an existing attempt on this exam
  const { data: existing } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', session.id)
    .eq('exam_id', id)
    .order('status') // 'completed' sorts before 'draft'
    .limit(1)
    .maybeSingle<ExamAttempt>()

  if (existing) {
    if (existing.status === 'completed') redirect(`/exam/${existing.id}/result`)
    return <AnswerSheet attempt={existing} exam={exam} />
  }

  // No attempt yet — create a fresh draft
  const { data: newAttempt, error } = await supabase
    .from('exam_attempts')
    .insert({ user_id: session.id, exam_id: id, answers: {}, status: 'draft' })
    .select('*')
    .single<ExamAttempt>()

  if (error || !newAttempt) redirect('/dashboard')

  return <AnswerSheet attempt={newAttempt} exam={exam} />
}
