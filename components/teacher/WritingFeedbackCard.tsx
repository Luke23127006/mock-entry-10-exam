import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            <span className="font-bold mr-1">Câu {questionNumber}.</span>
            {question.content}
          </p>
          {question.rubric && (
            <p className="text-xs text-muted-foreground italic">Gợi ý: {question.rubric}</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Bài làm của học sinh:</p>
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap min-h-10">
            {studentAnswer || <em className="text-muted-foreground">Chưa trả lời</em>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Điểm (tối đa {question.pointValue})
            </Label>
            <Input
              type="number"
              name={`feedback[${question.id}][score]`}
              step="0.1"
              min="0"
              max={question.pointValue}
              defaultValue={existing?.score ?? 0}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhận xét</Label>
            <Textarea
              name={`feedback[${question.id}][comment]`}
              defaultValue={existing?.comment ?? ''}
              placeholder="Nhận xét cho học sinh..."
              className="min-h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
