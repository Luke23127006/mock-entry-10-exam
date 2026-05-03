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
  questions: Question[],
  answers: Record<string, string | string[]>,
): ScoreResult {
  let autoScore = 0
  let maxAutoScore = 0
  let hasWriting = false

  for (const q of questions) {
    if (q.type === 'writing') {
      hasWriting = true
      continue
    }

    maxAutoScore += q.pointValue

    const answer = answers[q.id]
    const correct =
      q.type === 'single'
        ? isSingleCorrect(answer, q.correctAnswers ?? [])
        : isMultipleCorrect(answer, q.correctAnswers ?? [])

    if (correct) autoScore += q.pointValue
  }

  return {
    autoScore: Math.round(autoScore * 100) / 100,
    maxAutoScore: Math.round(maxAutoScore * 100) / 100,
    hasWriting,
  }
}

export function computeFinalScore(
  autoScore: number,
  feedback: Record<string, WritingFeedback> | null,
): number {
  const teacherScore = feedback
    ? Object.values(feedback).reduce((sum, f) => sum + (f.score ?? 0), 0)
    : 0
  return Math.round((autoScore + teacherScore) * 100) / 100
}
