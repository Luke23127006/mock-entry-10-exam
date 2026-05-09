import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { scoreExam, computeFinalScore } from '@/lib/scoring'
import { gradeWritingWithAI } from '@/lib/ai-grading'
import type { ExamAttempt, Exam, Question, WritingFeedback } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { attemptId, answers } = body as {
      attemptId: string
      answers: Record<string, string | string[]>
    }

    if (!attemptId || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // 1. Fetch attempt and exam
    const { data: attempt } = await supabase
      .from('exam_attempts')
      .select('exam_id, status')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single<Pick<ExamAttempt, 'exam_id' | 'status'>>()

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }
    if (attempt.status === 'completed') {
      return NextResponse.json({ error: 'Already completed' }, { status: 400 })
    }

    const { data: exam } = await supabase
      .from('exams')
      .select('content')
      .eq('id', attempt.exam_id)
      .single<Pick<Exam, 'content'>>()

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const content = exam?.content as any
    const questions = content?.questions || []
    
    // If exam has sections, flatten them but keep instruction/passage context
    if (content?.sections) {
      content.sections.forEach((section: any) => {
        if (section.components) {
          section.components.forEach((q: any) => {
            q._sectionInstruction = section.instruction
            q._sectionPassage = section.readingPassage
            questions.push(q)
          })
        }
      })
    }

    // 2. Score MCQ questions
    const { autoScore, maxAutoScore } = scoreExam(questions, answers)

    // 3. Grade writing questions via Gemini API
    const writingQuestions = questions.filter((q: Question) => {
      const type = (q.type || '').toLowerCase()
      const part = (q.part || '').toLowerCase()
      return type.includes('writing') || 
             type.includes('essay') || 
             part.includes('d') || 
             part.includes('writing') ||
             !!q.rubric
    })
    const feedback: Record<string, WritingFeedback> = {}

    for (const wq of writingQuestions) {
      const studentAnswer = answers[wq.id] as string
      feedback[wq.id] = await gradeWritingWithAI(wq, studentAnswer)
    }

    // 4. Calculate total score & save
    const finalScore = computeFinalScore(autoScore, feedback)

    const scoreText = finalScore.toString()

    const { error } = await supabase
      .from('exam_attempts')
      .update({
        answers,
        status: 'completed',
        score: scoreText,
        feedback,
        is_graded: false
      })
      .eq('id', attemptId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirect: `/exam/${attemptId}/result` })

  } catch (error: any) {
    console.error('Submit API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
