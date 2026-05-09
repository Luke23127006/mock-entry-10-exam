'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/database'

interface Props {
  question: Question
  questionNumber: number
  answer: string | string[]
  onChange: (value: string | string[]) => void
  disabled?: boolean
}

export default function ChoiceQuestion({
  question,
  questionNumber,
  answer,
  onChange,
  disabled,
}: Props) {
  const isMultiple = question.type === 'multiple'
  const options = question.options ?? []
  const layout = question.metadata?.layout || 'list'

  const handleCheckboxChange = (opt: string, checked: boolean) => {
    const currentAnswers = Array.isArray(answer) ? answer : []
    if (checked) {
      onChange([...currentAnswers, opt])
    } else {
      onChange(currentAnswers.filter((a) => a !== opt))
    }
  }

  const renderContent = () => {
    // Basic support for underlining: wrap text in <u> tags or handle __text__
    const parts = question.content.split(/(__.*?__)/g)
    return parts.map((part, i) => {
      if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={i} className="font-bold underline-offset-4">{part.slice(2, -2)}</u>
      }
      return part
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <span className="font-bold text-sm mt-0.5 shrink-0">Câu {questionNumber}.</span>
        <div className="text-sm leading-relaxed font-medium">
          {renderContent()}
          {isMultiple && (
            <span className="ml-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              (Chọn nhiều đáp án)
            </span>
          )}
        </div>
      </div>

      <div className={cn(
        "grid gap-2",
        layout === 'grid' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      )}>
        {isMultiple ? (
          options.map((opt, i) => {
            const optId = `q-${question.id}-opt-${i}`
            const isChecked = Array.isArray(answer) && answer.includes(opt)
            return (
              <div 
                key={i} 
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200",
                  isChecked ? "bg-primary/5 border-primary/30 ring-1 ring-primary/10" : "hover:bg-muted/50 border-transparent"
                )}
              >
                <Checkbox
                  id={optId}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckboxChange(opt, !!checked)}
                  disabled={disabled}
                  className="size-5"
                />
                <Label htmlFor={optId} className="text-sm cursor-pointer flex-1 py-0.5 font-normal">
                  <span className="font-bold mr-2 text-primary/70">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </Label>
              </div>
            )
          })
        ) : (
          <RadioGroup 
            value={typeof answer === 'string' ? answer : ''} 
            onValueChange={onChange} 
            disabled={disabled}
            className="grid gap-2"
          >
            {options.map((opt, i) => {
              const optId = `q-${question.id}-opt-${i}`
              const isChecked = answer === opt
              return (
                <Label
                  key={i}
                  htmlFor={optId}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all duration-200",
                    isChecked ? "bg-primary/5 border-primary/30 ring-1 ring-primary/10" : "hover:bg-muted/50 border-transparent"
                  )}
                >
                  <RadioGroupItem value={opt} id={optId} className="size-5" />
                  <span className="text-sm flex-1 font-normal">
                    <span className="font-bold mr-2 text-primary/70">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </span>
                </Label>
              )
            })}
          </RadioGroup>
        )}
      </div>
    </div>
  )
}
