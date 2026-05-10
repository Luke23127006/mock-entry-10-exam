import * as React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { scoreExam, computeFinalScore } from '@/lib/scoring'
import { buttonVariants } from '@/components/ui/button'
import type { Exam, Question } from '@/types/database'
import { ResultViewer } from '@/components/exam/ResultViewer'

const PART_LABELS: Record<string, string> = {
  A: 'Section A. Objective',
  B: 'Section B. Short Answer',
  C: 'Section C. Reading',
  D: 'Section D. Writing'
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*, exams(*)')
    .eq('id', id)
    .eq('user_id', session.id)
    .single()

  if (!attempt) redirect('/dashboard')

  const exam = attempt.exams as unknown as Exam
  const sections = (exam.content as any).sections || []
  const questions: Question[] = exam.content.questions || sections.flatMap((s: any) => s.components) || []
  
  const answers = attempt.answers
  const feedback = (typeof attempt.feedback === 'string' ? JSON.parse(attempt.feedback || '{}') : attempt.feedback) || {}
  
  // Use stored score if available, otherwise calculate
  const totalScore = parseFloat(attempt.score || '0')
  const { autoScore, maxAutoScore, hasWriting } = scoreExam(questions, answers, feedback)

  const parts = ['A', 'B', 'C', 'D'] as const
  
  // Flattened list of sections for display
  const displaySections = (sections.length > 0 ? sections : parts.map(p => ({
    title: PART_LABELS[p] || `Part ${p}`,
    components: questions.filter((q: Question) => q.part === p)
  }))).filter((s: any) => (s.components || []).length > 0)

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <ResultViewer 
          exam={exam}
          attempt={attempt}
          displaySections={displaySections}
          autoScore={autoScore}
          maxAutoScore={maxAutoScore}
          totalScore={totalScore}
          hasWriting={hasWriting}
        />

      </div>
    </main>
  )
}
