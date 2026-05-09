'use client'

import * as React from 'react'
import { Question } from '@/types/exam'
import { QuestionMCQ } from './QuestionMCQ'
import { QuestionShortInput } from './QuestionShortInput'
import { QuestionEssay } from './QuestionEssay'

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
          variant={question.variant}
          layout={question.layout}
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
    default:
      return <div className="text-destructive font-bold p-4 border border-destructive/20 rounded-lg bg-destructive/5">Unknown Question Type</div>
  }
}
