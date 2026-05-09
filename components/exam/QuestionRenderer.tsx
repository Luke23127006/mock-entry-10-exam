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
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  questionNumber
}: QuestionRendererProps) {
  switch (question.type) {
    case 'mcq':
      return (
        <QuestionMCQ
          id={question.id}
          content={question.content}
          options={question.options}
          value={value as string}
          onChange={onChange}
          questionNumber={questionNumber}
        />
      )
    case 'short_input':
      return (
        <QuestionShortInput
          id={question.id}
          content={question.content}
          prefix={question.prefix}
          hintText={question.hintText}
          value={value as string}
          onChange={onChange}
          questionNumber={questionNumber}
        />
      )
    case 'essay':
      return (
        <QuestionEssay
          id={question.id}
          promptText={question.promptText}
          minWords={question.minWords}
          maxWords={question.maxWords}
          value={value as string}
          onChange={onChange}
          questionNumber={questionNumber}
        />
      )
    case 'cloze':
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {questionNumber && (
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center font-bold text-primary bg-primary/10 rounded-full w-8 h-8 shrink-0 text-sm">
                {questionNumber}
              </span>
              <span className="font-bold text-lg text-foreground tracking-tight uppercase border-b-2 border-primary/20 pb-1">Cloze Test</span>
            </div>
          )}
          <div className="pl-0 sm:pl-11">
            <InlineClozePassage
              passageContent={question.passageContent}
              blanks={question.blanks}
              values={(value as Record<string, string>) || {}}
              onChange={(blankId, val) => {
                const currentValues = (value as Record<string, string>) || {}
                onChange({ ...currentValues, [blankId]: val })
              }}
            />
          </div>
        </div>
      )
    default:
      return <div className="text-destructive font-bold p-4 border border-destructive/20 rounded-lg bg-destructive/5">Unknown Question Type</div>
  }
}
