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

export async function syncAttempt(
  attemptId: string,
  feedbackOverride?: Record<string, WritingFeedback>,
): Promise<void> {
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('exam_id, answers, feedback')
    .eq('id', attemptId)
    .single<Pick<ExamAttempt, 'exam_id' | 'answers' | 'feedback'>>()

  if (!attempt) return

  const { data: exam } = await supabase
    .from('exams')
    .select('content')
    .eq('id', attempt.exam_id)
    .single<Pick<Exam, 'content'>>()

  if (!exam) return

  const content = exam.content as any
  const questions = content.questions || content.sections?.flatMap((s: any) => s.components) || []
  
  // Parse and merge feedback
  let currentFeedback: Record<string, WritingFeedback> = {}
  if (attempt.feedback) {
    if (typeof attempt.feedback === 'string') {
      try { currentFeedback = JSON.parse(attempt.feedback) } catch {}
    } else {
      currentFeedback = attempt.feedback as Record<string, WritingFeedback>
    }
  }
  const mergedFeedback = { ...currentFeedback, ...feedbackOverride }

  const { autoScore: finalTotalScore, questionScores } = scoreExam(questions, attempt.answers, mergedFeedback)

  await supabase
    .from('exam_attempts')
    .update({ 
      feedback: mergedFeedback, 
      score: finalTotalScore.toString(), 
      question_scores: questionScores,
    })
    .eq('id', attemptId)
}

export async function submitWritingFeedback(
  attemptId: string,
  feedback: Record<string, WritingFeedback>,
): Promise<void> {
  await requireTeacher()

  await syncAttempt(attemptId, feedback)
  
  // Mark as graded
  await supabase
    .from('exam_attempts')
    .update({ is_graded: true })
    .eq('id', attemptId)

  redirect('/teacher/attempts')
}
