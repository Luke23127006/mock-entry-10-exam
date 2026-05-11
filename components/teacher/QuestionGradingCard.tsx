'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, UserCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question, WritingFeedback } from '@/types/database'
import { FormattedText } from '@/components/exam/FormattedText'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface Props {
  question: Question
  questionNumber: number
  studentAnswer: string | string[]
  existing: WritingFeedback | null
  autoScore?: number
}

export default function QuestionGradingCard({
  question,
  questionNumber,
  studentAnswer,
  existing,
  autoScore = 0,
}: Props) {
  const isAI = existing?.isAI ?? false
  const type = (question.type || '').toLowerCase()
  const part = (question.part || '').toLowerCase()
  const prefix = (question as any).prefix
  const isWriting = type.includes('writing') || 
                    type.includes('essay') || 
                    part.includes('d') || 
                    part.includes('writing') ||
                    !!question.rubric

  const maxScore = question.pointValue ?? 1
  const initialScore = existing?.score ?? (isWriting ? 0 : autoScore)
  const [currentScore, setCurrentScore] = useState<number>(initialScore)
  const [currentComment, setCurrentComment] = useState<string>(existing?.comment ?? '')

  const renderMultiAnswer = (ans: string | string[] | undefined) => {
    if (!ans) return '—'
    if (Array.isArray(ans)) {
      return ans.map((a, i) => (
        <div key={i} className="mb-0.5 last:mb-0">
          <FormattedText text={a} />
        </div>
      ))
    }
    return <FormattedText text={ans} />
  }

  return (
    <Card className={cn(
      "overflow-hidden border-2 transition-all duration-300 shadow-sm",
      currentScore >= maxScore ? "border-green-200 bg-green-50/30" : 
      currentScore > 0 ? "border-amber-200 bg-amber-50/30" : 
      "border-destructive/20 bg-destructive/5"
    )}>
      <CardHeader className="bg-muted/10 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center font-bold text-primary bg-primary/10 rounded-lg w-8 h-8 text-sm">
                {questionNumber}
              </span>
              <h3 className="font-bold text-base tracking-tight">
                {isWriting ? 'Câu hỏi tự luận' : 'Câu hỏi trắc nghiệm/ngắn'}
              </h3>
            </div>
            <div className="text-sm text-foreground/80 leading-relaxed pl-10">
              <FormattedText text={question.content} />
            </div>
            {prefix && (
              <div className="pl-10 pt-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-muted/50 px-2 py-1 rounded border border-border/50">
                  <FormattedText text={prefix} />
                </span>
              </div>
            )}
          </div>
          {isWriting && isAI && (
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 gap-1.5 py-1 px-3">
              <Sparkles className="h-3 w-3" />
              AI Suggested
            </Badge>
          )}
          {!isWriting && existing && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3 w-3" />
              Đã điều chỉnh
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Answer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              <UserCircle className="h-3.5 w-3.5" />
              Bài làm của học sinh
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[4rem] text-foreground/90 font-medium">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  {renderMultiAnswer(studentAnswer)}
                </div>
              </div>
            </div>
          </div>

          {/* System Answer (if not writing) */}
          {!isWriting && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                <HelpCircle className="h-3.5 w-3.5" />
                Đáp án hệ thống
              </div>
              <div className="rounded-2xl bg-green-50 border border-green-100 shadow-inner p-4 text-sm leading-relaxed text-green-800 font-bold">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    {renderMultiAnswer(question.correctAnswers)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rubric (if writing) */}
          {isWriting && question.rubric && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                <Info className="h-3.5 w-3.5" />
                Hướng dẫn chấm (Rubric)
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-xs leading-relaxed text-blue-800 italic">
                <FormattedText text={question.rubric} />
              </div>
            </div>
          )}
        </div>

        {/* Grading Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-6 border-t border-border/50">
          <div className="md:col-span-3 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex justify-between">
              Điểm số <span>Tối đa {question.pointValue ?? 1}</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                name={`feedback[${question.id}][score]`}
                step="0.05"
                min="0"
                max={maxScore}
                value={currentScore}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  setCurrentScore(isNaN(val) ? 0 : val)
                }}
                className="h-12 text-lg font-bold rounded-xl border-border/60 focus:ring-primary/20 bg-white"
              />
              {!isWriting && !existing && (
                <p className="text-[9px] text-muted-foreground mt-1 ml-1 font-medium italic">
                  * Điểm hệ thống tự chấm: {autoScore}
                </p>
              )}
            </div>
          </div>
          
          <div className="md:col-span-9 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
              Nhận xét và góp ý
            </Label>
            <RichTextEditor
              value={currentComment}
              onChange={setCurrentComment}
              placeholder={isWriting ? "Nhập nhận xét chi tiết cho học sinh..." : "Ghi chú về việc điều chỉnh điểm (nếu có)..."}
            />
            <input 
              type="hidden" 
              name={`feedback[${question.id}][comment]`} 
              value={currentComment} 
            />
          </div>
        </div>

        {isWriting && isAI && (
          <p className="text-[10px] text-amber-600/70 italic text-right font-medium">
            * Điểm và nhận xét trên do AI gợi ý. Bạn có thể chỉnh sửa trước khi lưu.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
