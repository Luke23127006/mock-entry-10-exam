'use server'

import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { scoreExam, computeFinalScore } from '@/lib/scoring'
import type { Exam, ExamAttempt, Question, WritingFeedback } from '@/types/database'

async function requireTeacher() {
  const session = await getSession()
  if (!session || session.role !== 'teacher') redirect('/dashboard')
  return session
}

export async function createExam(formData: FormData): Promise<void> {
  await requireTeacher()

  const title = (formData.get('title') as string)?.trim()
  const questionsJson = formData.get('questions') as string

  if (!title) return

  let questions: Question[] = []
  try {
    questions = JSON.parse(questionsJson)
  } catch {
    return
  }

  if (questions.length === 0) return

  await supabase.from('exams').insert({ title, content: { questions } })
  redirect('/teacher')
}

export async function submitWritingFeedback(
  attemptId: string,
  feedback: Record<string, WritingFeedback>,
): Promise<void> {
  await requireTeacher()

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('exam_id, answers, status')
    .eq('id', attemptId)
    .single<Pick<ExamAttempt, 'exam_id' | 'answers' | 'status'>>()

  if (!attempt || attempt.status !== 'completed') redirect('/teacher/attempts')

  const { data: exam } = await supabase
    .from('exams')
    .select('content')
    .eq('id', attempt.exam_id)
    .single<Pick<Exam, 'content'>>()

  const questions: Question[] = exam?.content?.questions ?? []
  const { autoScore } = scoreExam(questions, attempt.answers)
  const finalScore = computeFinalScore(autoScore, feedback)

  await supabase
    .from('exam_attempts')
    .update({ feedback, score: `${finalScore}/10` })
    .eq('id', attemptId)

  redirect('/teacher/attempts')
}
