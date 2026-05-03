'use server'

import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { scoreExam } from '@/lib/scoring'
import type { Exam, ExamAttempt } from '@/types/database'

export async function startExam(examId: string): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login')

  // Resume existing draft attempt if one exists
  const { data: existing } = await supabase
    .from('exam_attempts')
    .select('id')
    .eq('user_id', session.id)
    .eq('exam_id', examId)
    .eq('status', 'draft')
    .maybeSingle()

  if (existing) {
    redirect(`/exam/${existing.id}`)
  }

  const { data: attempt, error } = await supabase
    .from('exam_attempts')
    .insert({ user_id: session.id, exam_id: examId, answers: {}, status: 'draft' })
    .select('id')
    .single()

  if (error || !attempt) redirect('/dashboard')

  redirect(`/exam/${attempt.id}`)
}

export async function saveAnswersDraft(
  attemptId: string,
  answers: Record<string, string | string[]>,
): Promise<void> {
  const session = await getSession()
  if (!session) return

  await supabase
    .from('exam_attempts')
    .update({ answers })
    .eq('id', attemptId)
    .eq('user_id', session.id)
    .eq('status', 'draft')
}

export async function submitExam(
  attemptId: string,
  answers: Record<string, string | string[]>,
): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('exam_id, status')
    .eq('id', attemptId)
    .eq('user_id', session.id)
    .single<Pick<ExamAttempt, 'exam_id' | 'status'>>()

  if (!attempt || attempt.status === 'completed') redirect(`/exam/${attemptId}/result`)

  const { data: exam } = await supabase
    .from('exams')
    .select('content')
    .eq('id', attempt.exam_id)
    .single<Pick<Exam, 'content'>>()

  const questions = exam?.content?.questions ?? []
  const { autoScore, maxAutoScore, hasWriting } = scoreExam(questions, answers)

  const scoreText = hasWriting
    ? `${autoScore}/${maxAutoScore} (phần viết chờ chấm)`
    : `${autoScore}/${maxAutoScore}`

  await supabase
    .from('exam_attempts')
    .update({ answers, status: 'completed', score: scoreText })
    .eq('id', attemptId)
    .eq('user_id', session.id)

  redirect(`/exam/${attemptId}/result`)
}
