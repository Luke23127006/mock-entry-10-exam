import type { Question, WritingFeedback } from '@/types/database'

export interface ScoreResult {
  autoScore: number
  maxAutoScore: number
  hasWriting: boolean
  questionScores: Record<string, number>
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
  feedback: Record<string, WritingFeedback> = {}
): ScoreResult {
  let autoScore = 0
  let maxAutoScore = 0
  let hasWriting = false
  const questionScores: Record<string, number> = {}

  for (const q of questions) {
    const pointValue = q.pointValue ?? 1
    maxAutoScore += pointValue

    const type = (q.type || '').toLowerCase()
    const part = (q.part || '').toLowerCase()
    const isWriting = type.includes('writing') || 
                     type.includes('essay') || 
                     part.includes('d') || 
                     part.includes('writing') ||
                     !!q.rubric

    if (isWriting) hasWriting = true

    // If teacher provided a manual score (even 0), use it as an override
    if (feedback[q.id]) {
      const manualScore = feedback[q.id].score
      autoScore += manualScore
      questionScores[q.id] = manualScore
      continue
    }

    if (isWriting) {
      questionScores[q.id] = 0 // Default for writing until graded
      continue
    }

    const answer = answers[q.id]
    const isSingleType = ['mcq', 'short_input', 'single', 'short_answer'].includes(type)
    const correctAnswers = q.correctAnswers || []
    
    const correct = isSingleType
      ? isSingleCorrect(answer, correctAnswers)
      : isMultipleCorrect(answer, correctAnswers)

    const qScore = correct ? pointValue : 0
    autoScore += qScore
    questionScores[q.id] = qScore
  }

  return {
    autoScore: Math.round(autoScore * 100) / 100,
    maxAutoScore: Math.round(maxAutoScore * 100) / 100,
    hasWriting,
    questionScores,
  }
}

export function computeFinalScore(
  autoScore: number,
  feedback: any,
): number {
  // Now that scoreExam handles feedback overrides, computeFinalScore is essentially redundant
  // but we keep it for compatibility if needed elsewhere, returning the autoScore as the final score
  // if feedback was already processed by scoreExam.
  return Math.round(autoScore * 100) / 100
}
