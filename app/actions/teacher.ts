'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { scoreExam, computeFinalScore } from '@/lib/scoring'
import { gradeWritingWithAI } from '@/lib/ai-grading'
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

export async function resubmitForStudent(
  attemptId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireTeacher()

  // 1. Fetch attempt (answers already saved)
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('exam_id, answers, feedback')
    .eq('id', attemptId)
    .single<Pick<ExamAttempt, 'exam_id' | 'answers' | 'feedback'>>()

  if (!attempt) return { success: false, error: 'Attempt not found' }

  // 2. Fetch exam content
  const { data: exam } = await supabase
    .from('exams')
    .select('content')
    .eq('id', attempt.exam_id)
    .single<Pick<Exam, 'content'>>()

  if (!exam) return { success: false, error: 'Exam not found' }

  const content = exam.content as any
  const allQuestions: Question[] = [
    ...(content.questions || []),
    ...(content.sections?.flatMap((s: any) => {
      const comps = s.components || []
      comps.forEach((q: any) => {
        q._sectionInstruction = s.instruction
        q._sectionPassage = s.readingPassage
      })
      return comps
    }) || []),
  ]

  // 3. Re-run AI grading for writing questions
  const writingQuestions = allQuestions.filter((q: Question) => {
    const type = (q.type || '').toLowerCase()
    const part = (q.part || '').toLowerCase()
    return (
      type.includes('writing') ||
      type.includes('essay') ||
      part.includes('d') ||
      part.includes('writing') ||
      !!q.rubric
    )
  })

  const newAIFeedback: Record<string, WritingFeedback> = {}
  for (const wq of writingQuestions) {
    const studentAnswer = (attempt.answers as Record<string, string>)[wq.id] ?? ''
    newAIFeedback[wq.id] = await gradeWritingWithAI(wq, studentAnswer)
  }

  // 4. Preserve existing teacher-approved feedback, overlay with new AI results
  let existingFeedback: Record<string, WritingFeedback> = {}
  if (attempt.feedback) {
    if (typeof attempt.feedback === 'string') {
      try { existingFeedback = JSON.parse(attempt.feedback) } catch {}
    } else {
      existingFeedback = attempt.feedback as Record<string, WritingFeedback>
    }
  }
  // Keep teacher-approved (isAI=false) scores; replace AI-generated ones
  const mergedFeedback: Record<string, WritingFeedback> = { ...existingFeedback }
  for (const [qId, fb] of Object.entries(newAIFeedback)) {
    if (!mergedFeedback[qId] || mergedFeedback[qId].isAI !== false) {
      mergedFeedback[qId] = fb
    }
  }

  // 5. Persist + re-sync scores
  await supabase
    .from('exam_attempts')
    .update({ feedback: mergedFeedback, status: 'completed', is_graded: false })
    .eq('id', attemptId)

  await syncAttempt(attemptId)

  revalidatePath(`/teacher/attempts/${attemptId}`)
  return { success: true }
}
