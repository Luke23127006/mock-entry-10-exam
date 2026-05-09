'use client'

import * as React from 'react'
import { ExamDefinition } from '@/types/exam'
import { ExamHeader } from './ExamHeader'
import { SectionBlock } from './SectionBlock'
import { ReadingPassage } from './ReadingPassage'
import { WordBank } from './WordBank'
import { QuestionRenderer } from './QuestionRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ExamViewerProps {
  exam: ExamDefinition
  initialAnswers?: Record<string, any>
  onSubmit?: (answers: Record<string, any>) => void
  onExit?: (answers: Record<string, any>) => void
}

export function ExamViewer({ exam, initialAnswers = {}, onSubmit, onExit }: ExamViewerProps) {
  const [answers, setAnswers] = React.useState<Record<string, any>>(initialAnswers)
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }))
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
            instruction={section.instruction}
          >
            {section.readingPassage && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <ReadingPassage content={section.readingPassage} />
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
                    className="border-none shadow-[0_2px_15px_rgba(0,0,0,0.03)] ring-1 ring-border/50 overflow-visible hover:ring-primary/20 transition-all duration-300"
                  >
                    <CardContent className="p-6 sm:p-10">
                      <QuestionRenderer
                        question={question}
                        value={answers[question.id]}
                        onChange={(val) => handleAnswerChange(question.id, val)}
                        questionNumber={globalQuestionCounter}
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
            className="w-full sm:w-auto px-10 h-12 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
            onClick={() => {
              if (window.confirm("Are you sure you want to submit your exam? This action cannot be undone.")) {
                onSubmit?.(answers)
              }
            }}
          >
            Submit Exam
          </Button>
        </div>
      </footer>
    </div>
  )
}
