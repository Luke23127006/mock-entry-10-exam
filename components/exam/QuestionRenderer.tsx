'use client'

import * as React from 'react'
import { Question } from '@/types/exam'
import { QuestionMCQ } from './QuestionMCQ'
import { QuestionShortInput } from './QuestionShortInput'
import { QuestionEssay } from './QuestionEssay'
import { InlineClozePassage } from './InlineClozePassage'

interface QuestionRendererProps {
  question: Question
  value: any // Record<string, string> for cloze, string for others
  onChange: (value: any) => void
  questionNumber?: number
  isReviewMode?: boolean
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  questionNumber,
  isReviewMode
}: QuestionRendererProps) {
  switch (question.type) {
    case 'mcq':
      return (
        <QuestionMCQ
          id={question.id}
          content={question.content}
          options={question.options}
          value={(value as string) || ''}
          onChange={onChange}
          questionNumber={questionNumber}
          isReviewMode={isReviewMode}
          explanation={question.explanation}
          correctAnswers={question.correctAnswers}
        />
      )
    case 'short_input':
      return (
        <QuestionShortInput
          id={question.id}
          content={question.content}
          prefix={question.prefix}
          hintText={question.hintText}
          value={(value as string) || ''}
          onChange={onChange}
          questionNumber={questionNumber}
          isReviewMode={isReviewMode}
          explanation={question.explanation}
          correctAnswers={question.correctAnswers}
        />
      )
    case 'essay':
      return (
        <QuestionEssay
          id={question.id}
          promptText={question.promptText}
          minWords={question.minWords}
          maxWords={question.maxWords}
          value={(value as string) || ''}
          onChange={onChange}
          questionNumber={questionNumber}
          isReviewMode={isReviewMode}
          explanation={question.explanation}
          rubric={question.rubric}
        />
      )
    case 'cloze':
      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Paragraph Section */}
          <div className="bg-muted/30 p-6 sm:p-10 rounded-3xl border border-border/50 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
            <InlineClozePassage
              passageContent={question.passageContent}
              blanks={question.blanks}
            />
          </div>

          {/* Questions Section */}
          <div className="grid grid-cols-1 gap-6 pl-0 sm:pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-widest font-black text-muted-foreground/60 bg-muted px-3 py-1 rounded-full">Options</span>
              <div className="h-px bg-border flex-1" />
            </div>
            
            {question.blanks.map((blank) => {
              const currentValues = (value as Record<string, string>) || {}
              return (
                <QuestionMCQ
                  key={blank.id}
                  id={blank.id}
                  content=""
                  options={blank.options || []}
                  value={currentValues[blank.id] || ''}
                  onChange={(val) => {
                    onChange({ ...currentValues, [blank.id]: val })
                  }}
                  questionNumber={blank.id}
                  variant="compact"
                  isReviewMode={isReviewMode}
                  explanation={blank.explanation}
                  correctAnswers={blank.correctAnswers}
                />
              )
            })}
          </div>

          {/* Global Cloze Explanation (Optional) */}
          {isReviewMode && question.explanation && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-5 text-sm italic text-blue-900/70 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 mb-2 font-bold text-blue-700 not-italic uppercase tracking-tighter text-xs">
                Passage Context
              </div>
              {question.explanation}
            </div>
          )}
        </div>
      )
    default:
      return <div className="text-destructive font-bold p-4 border border-destructive/20 rounded-lg bg-destructive/5">Unknown Question Type</div>
  }
}
