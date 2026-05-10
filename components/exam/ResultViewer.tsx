'use client'

import * as React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormattedText } from '@/components/exam/FormattedText'
import { cn } from '@/lib/utils'
import type { Exam, ExamAttempt, Question } from '@/types/database'
import { CheckCircle2, XCircle, LayoutGrid, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ResultViewerProps {
  exam: Exam
  attempt: ExamAttempt
  displaySections: any[]
  autoScore: number
  maxAutoScore: number
  totalScore: number
  hasWriting: boolean
}

export function ResultViewer({
  exam,
  attempt,
  displaySections,
  autoScore,
  maxAutoScore,
  totalScore,
  hasWriting
}: ResultViewerProps) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all')
  const answers = attempt.answers
  let feedback = attempt.feedback as any
  if (typeof feedback === 'string' && feedback.trim() !== '') {
    try {
      feedback = JSON.parse(feedback)
    } catch (e) {
      console.error('Failed to parse feedback:', e)
      feedback = {}
    }
  }

  const checkIsCorrect = (q: any) => {
    const type = (q.type || '').toLowerCase()
    const part = (q.part || '').toLowerCase()
    const isWriting = type.includes('writing') || 
                      type.includes('essay') || 
                      part.includes('d') || 
                      part.includes('writing') ||
                      !!q.rubric

    if (isWriting) return true // Writing is neutral for filter or we can treat as pending
    
    const answer = answers[q.id]
    const correctAnswers = q.correctAnswers || []
    const norm = (s: string) => s.trim().toLowerCase()
    
    if (typeof answer === 'string') {
      return correctAnswers.some((ca: string) => norm(answer) === norm(ca))
    } else if (Array.isArray(answer)) {
      const given = [...answer].map(norm).sort()
      const exp = [...correctAnswers].map(norm).sort()
      return given.length === exp.length && given.every((v, i) => v === exp[i])
    }
    return false
  }

  const getQuestionStatus = (q: any) => {
    const score = attempt.question_scores?.[q.id] ?? (checkIsCorrect(q) ? (q.pointValue ?? 1) : 0)
    const max = q.pointValue ?? 1
    
    if (score >= max) return 'correct'
    if (score > 0) return 'partial'
    return 'incorrect'
  }

  // Calculate global indices and apply filter
  let globalIndex = 0
  const filteredSections = displaySections.map(section => {
    const sectionQs = section.components || []
    const questionsWithIndices = sectionQs.map((q: any) => {
      globalIndex++
      const status = getQuestionStatus(q)
      return { ...q, globalIndex: globalIndex, status }
    })

    const filteredQs = questionsWithIndices.filter((q: any) => {
      if (filter === 'all') return true
      if (q.type === 'writing' || q.type === 'essay') return false // Only show in 'all' view
      if (filter === 'correct') return q.status === 'correct' || q.status === 'partial'
      if (filter === 'wrong') return q.status === 'incorrect'
      return true
    })

    return { ...section, components: filteredQs }
  }).filter(section => section.components.length > 0)

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-primary">Exam Results</CardTitle>
              <p className="text-muted-foreground text-sm font-medium">{exam.title}</p>
            </div>
            <Link 
              href="/dashboard" 
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "rounded-full px-4 border-primary/20 hover:bg-primary/5 transition-all gap-1.5 shadow-sm")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-black text-primary tracking-tight">
                {totalScore}
              </p>
              <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">/ {maxAutoScore} points</p>
            </div>
            {hasWriting && (
              <p className="text-xs font-semibold text-muted-foreground mt-2 italic">
                (Includes objective score: {autoScore} points)
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-full gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              All Questions
            </Button>
            <Button
              variant={filter === 'correct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('correct')}
              className="rounded-full gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Correct
            </Button>
            <Button
              variant={filter === 'wrong' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('wrong')}
              className="rounded-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/5"
            >
              <XCircle className="h-4 w-4" />
              Incorrect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Per-section/part breakdown */}
      {filteredSections.map((section: any, sIdx: number) => {
        return (
          <section key={sIdx} className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{section.title}</h2>
              <div className="h-px bg-border/60 flex-1" />
            </div>

            {section.readingPassage && filter === 'all' && (
              <div className="p-6 sm:p-10 rounded-3xl bg-muted/30 border border-border/50 shadow-inner text-base leading-relaxed text-foreground/90 whitespace-pre-wrap relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                <FormattedText text={section.readingPassage} />
              </div>
            )}

            <div className="space-y-4">
              {section.components.map((q: any) => {
                const answer = answers[q.id]
                const type = (q.type || '').toLowerCase()
                const part = (q.part || '').toLowerCase()
                const isWriting = type.includes('writing') || 
                                  type.includes('essay') || 
                                  part.includes('d') || 
                                  part.includes('writing') ||
                                  !!q.rubric
                const status = q.status

                return (
                  <Card key={q.id} className={cn(
                    "transition-all duration-300",
                    isWriting ? 'border-border' : 
                    status === 'correct' ? 'border-green-200 bg-green-50/30' : 
                    status === 'partial' ? 'border-amber-200 bg-amber-50/30' : 
                    'border-destructive/20 bg-destructive/5'
                  )}>
                    <CardContent className="pt-5 space-y-4">
                      <div className="text-base font-semibold leading-relaxed flex gap-3">
                        <span className="flex items-center justify-center font-bold text-primary bg-primary/10 rounded-lg min-w-[2.5rem] h-10 text-sm">
                          {q.globalIndex}
                        </span>
                        <div className="pt-2">
                          <FormattedText text={q.content} />
                        </div>
                      </div>

                      {/* Options for MCQ */}
                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-12">
                          {q.options.map((option: string, oIdx: number) => (
                            <div key={oIdx} className="text-sm flex items-start gap-2 text-muted-foreground">
                              <span className="font-bold opacity-70">{String.fromCharCode(65 + oIdx)}.</span>
                              <FormattedText text={option} />
                            </div>
                          ))}
                        </div>
                      )}

                      {isWriting ? (
                        <div className="space-y-2 pl-12">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your answer:</p>
                          <div className="text-sm bg-background border rounded-xl p-4 whitespace-pre-wrap min-h-[4rem] shadow-sm">
                            {typeof answer === 'string' && answer ? answer : <em className="text-muted-foreground font-normal">No answer submitted</em>}
                          </div>
                          {feedback && feedback[q.id] ? (
                            <div className={cn(
                              "mt-4 p-5 rounded-2xl border shadow-sm",
                              feedback[q.id].isAI 
                                ? "bg-amber-50/50 border-amber-200" 
                                : "bg-green-50/50 border-green-200"
                            )}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                                    feedback[q.id].isAI 
                                      ? "bg-amber-100 text-amber-700" 
                                      : "bg-green-600 text-white"
                                  )}>
                                    {feedback[q.id].isAI ? 'AI Evaluation' : 'Teacher Feedback'}
                                  </div>
                                  <p className={cn(
                                    "text-sm font-black",
                                    feedback[q.id].isAI ? "text-amber-900" : "text-green-900"
                                  )}>
                                    Score: {feedback[q.id].score} / {q.pointValue || 1}
                                  </p>
                                </div>
                                {!feedback[q.id].isAI && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                              </div>
                              {feedback[q.id].comment && (
                                <div className={cn(
                                  "text-sm leading-relaxed feedback-content",
                                  feedback[q.id].isAI ? "text-amber-800/80 italic" : "text-green-800"
                                )}
                                dangerouslySetInnerHTML={{ __html: feedback[q.id].comment }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2 py-4 px-6 rounded-2xl bg-amber-50/30 border border-amber-100/50 text-amber-600">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                              <p className="text-xs font-black uppercase tracking-[0.1em]">Awaiting teacher grading</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pl-12 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-2">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your response</p>
                              <div className={cn("text-sm font-bold", !answer && "italic text-muted-foreground font-normal")}>
                                {(() => {
                                  if (!answer) return 'None'
                                  const ansArray = Array.isArray(answer) ? answer : [answer]
                                  return ansArray.map((a, i) => {
                                    const oIdx = q.options?.indexOf(a)
                                    const label = (oIdx !== undefined && oIdx !== -1) ? `${String.fromCharCode(65 + oIdx)}. ` : ''
                                    return (
                                      <div key={i}>
                                        {label}<FormattedText text={a} />
                                      </div>
                                    )
                                  })
                                })()}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Correct Answer</p>
                              <div className="text-sm font-bold text-green-600">
                                {q.correctAnswers?.map((ca: string, i: number) => {
                                  const oIdx = q.options?.indexOf(ca)
                                  const label = (oIdx !== undefined && oIdx !== -1) ? `${String.fromCharCode(65 + oIdx)}. ` : ''
                                  return (
                                    <div key={i}>
                                      {label}<FormattedText text={ca} />
                                    </div>
                                  )
                                }) || '—'}
                              </div>
                            </div>
                            <div className="sm:col-span-2 flex items-center gap-2">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter",
                                status === 'correct' ? 'bg-green-100 text-green-700' : 
                                status === 'partial' ? 'bg-amber-100 text-amber-700' : 
                                'bg-destructive/10 text-destructive'
                              )}>
                                {status === 'correct' ? '✓ Correct' : status === 'partial' ? '⚠ Partial' : '✗ Incorrect'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-tighter">
                                {attempt.question_scores?.[q.id] ?? (status === 'correct' ? (q.pointValue ?? 1) : 0)} / {q.pointValue ?? 1} points
                              </span>
                            </div>
                          </div>

                          {/* Teacher feedback for non-writing questions */}
                          {feedback && feedback[q.id] && feedback[q.id].comment && (
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase tracking-widest py-0">Teacher Comment</Badge>
                                {feedback[q.id].score !== undefined && (
                                  <span className="text-[10px] font-bold text-primary">Score adjusted to {feedback[q.id].score}</span>
                                )}
                              </div>
                              <div className="text-sm text-foreground/80 leading-relaxed italic" 
                                   dangerouslySetInnerHTML={{ __html: feedback[q.id].comment }} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="pl-12 pt-2">
                          <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100/50 flex gap-3 text-sm italic text-blue-900/70">
                            <span className="text-blue-500 font-bold not-italic text-xs uppercase tracking-tighter pt-1">Explanation:</span>
                            <FormattedText text={q.explanation} />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
