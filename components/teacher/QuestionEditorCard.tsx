'use client'

import { useWatch, type Control, type UseFormRegister } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { ExamBuilderValues } from './ExamBuilderForm'

interface Props {
  control: Control<ExamBuilderValues>
  register: UseFormRegister<ExamBuilderValues>
  fieldPrefix: string
  questionNumber: number
  onRemove: () => void
}

export default function QuestionEditorCard({
  control,
  register,
  fieldPrefix,
  questionNumber,
  onRemove,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = control as Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reg = (name: string, opts?: any) => register(name as any, opts)
  const type: string = useWatch({ control: c, name: `${fieldPrefix}.type` }) ?? 'single'
  const options: string[] = useWatch({ control: c, name: `${fieldPrefix}.options` }) ?? ['', '', '', '']
  const correctAnswer: string = useWatch({ control: c, name: `${fieldPrefix}.correctAnswer` }) ?? ''
  const correctAnswers: string[] = useWatch({ control: c, name: `${fieldPrefix}.correctAnswers` }) ?? []

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Câu {questionNumber}
          </span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Loại câu</Label>
            <select
              {...reg(`${fieldPrefix}.type`)}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring"
            >
              <option value="single">Trắc nghiệm (1 đáp án)</option>
              <option value="multiple">Trắc nghiệm (nhiều đáp án)</option>
              <option value="short_answer">Điền từ/Câu ngắn</option>
              <option value="cloze">Cloze Test/Đọc hiểu (có Passage)</option>
              <option value="writing">Tự luận/Đoạn văn</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Điểm</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              {...reg(`${fieldPrefix}.pointValue`, { valueAsNumber: true })}
              placeholder="0.2"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nội dung câu hỏi</Label>
          <Textarea
            {...reg(`${fieldPrefix}.content`)}
            placeholder="Nhập câu hỏi..."
            className="min-h-16"
          />
        </div>

        {(type === 'single' || type === 'multiple') && (
          <div className="space-y-2">
            <Label className="text-xs">
              Lựa chọn — đánh dấu vào {type === 'single' ? 'radio' : 'ô checkbox'} để chọn đáp án đúng
            </Label>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                {type === 'single' ? (
                  <input
                    type="radio"
                    {...reg(`${fieldPrefix}.correctAnswer`)}
                    value={i}
                    checked={String(correctAnswer) === String(i)}
                    className="size-4 accent-primary shrink-0"
                  />
                ) : (
                  <input
                    type="checkbox"
                    {...reg(`${fieldPrefix}.correctAnswers`)}
                    value={i}
                    checked={correctAnswers.includes(String(i))}
                    className="size-4 accent-primary shrink-0"
                  />
                )}
                <Input
                  {...reg(`${fieldPrefix}.options.${i}`)}
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                  className="h-7 text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {(type === 'cloze' || type === 'short_answer') && (
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-primary">Văn bản đọc hiểu / Passage (Tùy chọn)</Label>
              <Textarea
                {...reg(`${fieldPrefix}.passage`)}
                placeholder="Nhập nội dung bài đọc..."
                className="min-h-24 bg-muted/30"
              />
            </div>
            {type === 'short_answer' && (
              <div className="space-y-1">
                <Label className="text-xs">Từ gốc (cho bài tập chia từ - tùy chọn)</Label>
                <Input
                  {...reg(`${fieldPrefix}.metadata.wordRoot`)}
                  placeholder="Ví dụ: FRIEND"
                />
              </div>
            )}
          </div>
        )}

        {type === 'writing' && (
          <div className="space-y-1">
            <Label className="text-xs">Gợi ý chấm điểm (tùy chọn)</Label>
            <Input
              {...reg(`${fieldPrefix}.rubric`)}
              placeholder="Ví dụ: Cần đủ chủ ngữ, động từ..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
