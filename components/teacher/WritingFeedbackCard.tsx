import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, UserCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question, WritingFeedback } from '@/types/database'

interface Props {
  question: Question
  questionNumber: number
  studentAnswer: string
  existing: WritingFeedback | null
}

export default function WritingFeedbackCard({
  question,
  questionNumber,
  studentAnswer,
  existing,
}: Props) {
  const isAI = existing?.isAI ?? false

  return (
    <Card className={cn(
      "overflow-hidden border-2 transition-all duration-300",
      isAI ? "border-amber-200/50 bg-amber-50/5 shadow-sm" : "border-border"
    )}>
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center font-bold text-primary bg-primary/10 rounded-lg w-8 h-8 text-sm">
                {questionNumber}
              </span>
              <h3 className="font-bold text-base tracking-tight">Câu hỏi tự luận</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed pl-10">
              {question.content}
            </p>
          </div>
          {isAI && (
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 gap-1.5 py-1 px-3">
              <Sparkles className="h-3 w-3" />
              AI Suggested
            </Badge>
          )}
          {!isAI && existing && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3 w-3" />
              Teacher Approved
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Student Answer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
            <UserCircle className="h-3.5 w-3.5" />
            Bài làm của học sinh
          </div>
          <div className="rounded-2xl bg-white border shadow-sm p-5 text-sm leading-relaxed whitespace-pre-wrap min-h-[6rem] text-foreground/90">
            {studentAnswer || <em className="text-muted-foreground font-normal italic">Học sinh chưa điền câu trả lời cho câu hỏi này.</em>}
          </div>
        </div>

        {/* Grading Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2 border-t border-border/50">
          <div className="md:col-span-3 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex justify-between">
              Điểm số <span>Tối đa {question.pointValue}</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                name={`feedback[${question.id}][score]`}
                step="0.1"
                min="0"
                max={question.pointValue}
                defaultValue={existing?.score ?? 0}
                className="h-12 text-lg font-bold rounded-xl border-border/60 focus:ring-primary/20 bg-white"
              />
            </div>
          </div>
          
          <div className="md:col-span-9 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
              Nhận xét và góp ý
            </Label>
            <Textarea
              name={`feedback[${question.id}][comment]`}
              defaultValue={existing?.comment ?? ''}
              placeholder="Nhập nhận xét chi tiết cho học sinh..."
              className="min-h-[6rem] rounded-xl border-border/60 focus:ring-primary/20 bg-white leading-relaxed"
            />
          </div>
        </div>

        {isAI && (
          <p className="text-[10px] text-amber-600/70 italic text-right font-medium">
            * Điểm và nhận xét trên do AI gợi ý. Bạn có thể chỉnh sửa trước khi lưu.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
