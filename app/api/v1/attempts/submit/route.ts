import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { scoreExam, computeFinalScore } from '@/lib/scoring'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ExamAttempt, Exam, Question, WritingFeedback } from '@/types/database'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
    const questions = content?.questions || content?.sections?.flatMap((s: any) => s.components) || []

    // 2. Score MCQ questions
    const { autoScore, maxAutoScore } = scoreExam(questions, answers)

    // 3. Grade writing questions via Gemini API
    const writingQuestions = questions.filter((q: Question) => q.type === 'writing' || q.type === 'essay')
    const feedback: Record<string, WritingFeedback> = {}

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    for (const wq of writingQuestions) {
      const studentAnswer = answers[wq.id]
      if (!studentAnswer || typeof studentAnswer !== 'string' || !studentAnswer.trim()) {
        feedback[wq.id] = { score: 0, comment: 'Không có câu trả lời.' }
        continue
      }

      const prompt = `You are a strict but helpful 9th-grade English teacher. Grade the following student's writing based on this rubric: ${wq.rubric || 'No specific rubric provided, use general English writing standards'}. Student's answer: ${studentAnswer}. Provide a score out of 10, point out grammar/spelling mistakes, suggest better vocabulary, and output the response purely in JSON format: { "score": number, "feedback": "string" }.`

      try {
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        const parsed = JSON.parse(responseText)

        feedback[wq.id] = {
          score: typeof parsed.score === 'number' ? parsed.score : 0,
          comment: typeof parsed.feedback === 'string' ? parsed.feedback : 'Error generating feedback.',
          isAI: true,
        }
      } catch (err) {
        console.error(`Gemini grading failed for question ${wq.id}:`, err)
        feedback[wq.id] = { score: 0, comment: 'An error occurred during auto-grading.' }
      }
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
