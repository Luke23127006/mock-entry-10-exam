'use client'

import * as React from 'react'
import { ExamViewer } from './ExamViewer'
import { ExamDefinition, Section, Question as NewQuestion } from '@/types/exam'
import { Exam, ExamAttempt } from '@/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  exam: Exam
  attempt: ExamAttempt
}

export default function ExamViewerWrapper({ exam, attempt }: Props) {
  const router = useRouter()

  // Map old database format to new ExamDefinition interface
  const mappedExam: ExamDefinition = React.useMemo(() => {
    if (!exam || !exam.content) {
      return { title: exam?.title || 'Untitled Exam', sections: [] }
    }

    // If it's already in the new format, use it directly
    if ('sections' in exam.content) {
      return {
        title: exam.title,
        sections: (exam.content as any).sections || []
      }
    }

    // Compatibility mapper for old flat question structure
    const oldQuestions = (exam.content as any)?.questions || []
    const sections: Section[] = []
    const parts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
    
    parts.forEach(part => {
      const partQuestions = oldQuestions.filter((q: any) => q.part === part)
      if (partQuestions.length === 0) return

      const components: NewQuestion[] = partQuestions.map((q: any) => {
        switch (q.type) {
          case 'single':
          case 'multiple':
            return {
              id: q.id,
              type: 'mcq',
              content: q.content,
              options: q.options || []
            } as any
          case 'short_answer':
            return {
              id: q.id,
              type: 'short_input',
              content: q.content,
              prefix: q.metadata?.wordRoot
            } as any
          case 'cloze':
            // Map legacy cloze to the new essay or short_input for now if no markers exist
            return {
              id: q.id,
              type: 'short_input',
              content: q.content,
              hintText: "Type your answer..."
            } as any
          case 'writing':
            return {
              id: q.id,
              type: 'essay',
              promptText: q.content
            } as any
          default:
            return { id: q.id, type: 'mcq', content: q.content, options: [] } as any
        }
      })

      sections.push({
        title: `Part ${part}`,
        instruction: "Read the instructions carefully before answering.",
        components,
        readingPassage: partQuestions.find((q: any) => q.passage)?.passage
      })
    })

    return {
      title: exam.title,
      sections
    }
  }, [exam])

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      const res = await fetch('/api/v1/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attempt.id, answers }),
      })
      
      const data = await res.json()
      
      if (res.ok && data.redirect) {
        toast.success("Exam submitted successfully!")
        router.push(data.redirect)
      } else {
        toast.error('Submission failed', { description: data.error || 'Please try again.' })
      }
    } catch (err) {
      toast.error('Connection error', { description: 'Please check your network and try again.' })
    }
  }

  const handleExit = async (currentAnswers: Record<string, any>) => {
    if (window.confirm("Are you sure you want to exit? Your progress will be saved automatically.")) {
      try {
        await fetch('/api/v1/attempts/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId: attempt.id, answers: currentAnswers }),
        })
        toast.success("Progress saved. Redirecting to dashboard...")
        router.push('/dashboard')
      } catch (err) {
        toast.error("Exit failed", { description: "We couldn't save your progress. Please try again." })
      }
    }
  }

  return (
    <div className="animate-in fade-in duration-1000">
      <ExamViewer 
        exam={mappedExam} 
        initialAnswers={(attempt.answers as Record<string, any>) || {}}
        onSubmit={handleSubmit} 
        onExit={handleExit}
        isReviewMode={attempt.status === 'completed'}
      />
    </div>
  )
}
