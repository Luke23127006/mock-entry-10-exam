'use client'

import * as React from 'react'
import { ExamDefinition } from '@/types/exam'
import { ExamHeader } from './ExamHeader'
import { SectionBlock } from './SectionBlock'
import { ReadingPassage } from './ReadingPassage'
import { WordBank } from './WordBank'
import { QuestionRenderer } from './QuestionRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedText } from './FormattedText'
import { cn } from '@/lib/utils'

interface ExamViewerProps {
  exam: ExamDefinition
  initialAnswers?: Record<string, any>
  onSubmit?: (answers: Record<string, any>) => void | Promise<void>
  onExit?: (answers: Record<string, any>) => void | Promise<void>
  isReviewMode?: boolean
}

import { Sparkles, Loader2 } from 'lucide-react'

export function ExamViewer({ exam, initialAnswers = {}, onSubmit, onExit, isReviewMode = false }: ExamViewerProps) {
  const [answers, setAnswers] = React.useState<Record<string, any>>(initialAnswers)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const handleAnswerChange = (questionId: string, value: any) => {
    if (isReviewMode || isSubmitting) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleFinalSubmit = async () => {
    if (window.confirm("Are you sure you want to submit your exam? This action cannot be undone.")) {
      setIsSubmitting(true)
      try {
        await onSubmit?.(answers)
      } finally {
        // If the redirect doesn't happen immediately or there's an error,
        // we might want to allow the user to try again.
        setIsSubmitting(false)
      }
    }
  }

  let globalQuestionCounter = 0

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <ExamHeader 
        title={exam.title} 
        durationMinutes={90} 
        onExit={() => onExit?.(answers)}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {exam.sections.map((section, sectionIndex) => (
          <SectionBlock
            key={`${section.title}-${sectionIndex}`}
            title={section.title}
          >
            {section.readingPassage && (
              <div className="mb-10 p-6 sm:p-10 rounded-3xl bg-muted/30 border border-border/50 shadow-inner text-base leading-relaxed text-foreground/90 whitespace-pre-wrap relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                <FormattedText text={section.readingPassage} />
              </div>
            )}
            
            {section.instruction && (
              <div className="mb-8 p-4 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground italic">
                <FormattedText text={section.instruction} />
              </div>
            )}
            
            {section.wordBank && (
              <div className="mb-8 animate-in fade-in zoom-in-95 duration-500 delay-100">
                <WordBank words={section.wordBank} />
              </div>
            )}

            <div className="space-y-8">
              {section.components.map((question) => {
                globalQuestionCounter++
                return (
                  <Card 
                    key={question.id} 
                    className={cn(
                      "border-none shadow-[0_2px_15px_rgba(0,0,0,0.03)] ring-1 ring-border/50 overflow-visible transition-all duration-300",
                      !isReviewMode && "hover:ring-primary/20"
                    )}
                  >
                    <CardContent className="p-6 sm:p-10">
                      <QuestionRenderer
                        question={question}
                        value={answers[question.id]}
                        onChange={(val) => handleAnswerChange(question.id, val)}
                        questionNumber={globalQuestionCounter}
                        isReviewMode={isReviewMode}
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </SectionBlock>
        ))}
      </main>

      {/* Sticky Bottom Bar */}
      {!isReviewMode && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md py-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <div className="hidden sm:flex flex-col">
              <span className="text-xs uppercase tracking-widest font-black text-muted-foreground/60">Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-primary">
                  {Object.keys(answers).length}
                </span>
                <span className="text-sm text-muted-foreground font-medium">questions recorded</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 h-12 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
              onClick={handleFinalSubmit}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : "Submit Exam"}
            </Button>
          </div>
        </footer>
      )}

      {/* AI Scoring Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-500">
          <Card className="max-w-md w-full mx-4 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="h-1.5 w-full bg-muted overflow-hidden">
              <div className="h-full bg-primary animate-progress-indeterminate w-1/3" />
            </div>
            <CardContent className="p-10 text-center space-y-6">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-5 rounded-3xl">
                  <Sparkles className="h-10 w-10 text-primary animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-foreground">AI Scoring in Progress</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Please wait while our AI analyzes your writing responses. This may take up to a minute.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/60">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyzing Grammar & Structure
                </div>
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                  Do not refresh or close this page
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
