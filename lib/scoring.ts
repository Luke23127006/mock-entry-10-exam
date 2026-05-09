import type { Question, WritingFeedback } from '@/types/database'

export interface ScoreResult {
  autoScore: number
  maxAutoScore: number
  hasWriting: boolean
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function isSingleCorrect(
  answer: string | string[] | undefined,
  correctAnswers: string[],
): boolean {
  if (!answer || typeof answer !== 'string') return false
  return normalize(answer) === normalize(correctAnswers[0] ?? '')
}

function isMultipleCorrect(
  answer: string | string[] | undefined,
  correctAnswers: string[],
): boolean {
  if (!Array.isArray(answer)) return false
  const given = [...answer].map(normalize).sort()
  const expected = [...correctAnswers].map(normalize).sort()
  return (
    given.length === expected.length &&
    given.every((v, i) => v === expected[i])
  )
}

export function scoreExam(
  questions: any[],
  answers: Record<string, any>,
): ScoreResult {
  let autoScore = 0
  let maxAutoScore = 0
  let hasWriting = false

  for (const q of questions) {
    // Standardizing point value (default to 1 if missing)
    const pointValue = q.pointValue ?? 1

    maxAutoScore += pointValue

    if (q.type === 'writing' || q.type === 'essay') {
      hasWriting = true
      continue
    }
    const answer = answers[q.id]

    // Single answer types (mcq, short_input, single, short_answer)
    const isSingleType = ['mcq', 'short_input', 'single', 'short_answer'].includes(q.type)
    const correctAnswers = q.correctAnswers || []
    
    const correct = isSingleType
      ? isSingleCorrect(answer, correctAnswers)
      : isMultipleCorrect(answer, correctAnswers)

    if (correct) autoScore += pointValue
  }

  return {
    autoScore: Math.round(autoScore * 100) / 100,
    maxAutoScore: Math.round(maxAutoScore * 100) / 100,
    hasWriting,
  }
}

export function computeFinalScore(
  autoScore: number,
  feedback: any,
): number {
  let feedbackObj = feedback
  if (typeof feedback === 'string' && feedback.trim() !== '') {
    try {
      feedbackObj = JSON.parse(feedback)
    } catch (e) {
      console.error('Failed to parse feedback JSON:', e)
      feedbackObj = {}
    }
  }
  
  const teacherScore = feedbackObj
    ? Object.values(feedbackObj).reduce((sum: number, f: any) => sum + (f.score ?? 0), 0)
    : 0
  return Math.round((autoScore + teacherScore) * 100) / 100
}
