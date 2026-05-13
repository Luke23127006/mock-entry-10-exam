'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { resubmitForStudent } from '@/app/actions/teacher'
import { RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react'

interface ResubmitButtonProps {
  attemptId: string
}

export default function ResubmitButton({ attemptId }: ResubmitButtonProps) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleResubmit() {
    setState('loading')
    setErrorMsg(null)
    try {
      const result = await resubmitForStudent(attemptId)
      if (result.success) {
        setState('success')
        router.refresh()
        // Reset back to idle after 3 s so the button is reusable
        setTimeout(() => setState('idle'), 3000)
      } else {
        setErrorMsg(result.error ?? 'Unknown error')
        setState('error')
        setTimeout(() => setState('idle'), 4000)
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Unknown error')
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  const isLoading = state === 'loading'

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={isLoading}
        onClick={handleResubmit}
        className="
          rounded-2xl px-6 font-semibold gap-2 border-amber-400/60
          text-amber-700 hover:bg-amber-50 hover:border-amber-500
          shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-60 disabled:pointer-events-none
          dark:text-amber-400 dark:border-amber-500/50 dark:hover:bg-amber-950/30
        "
      >
        {state === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Chấm lại thành công!</span>
          </>
        ) : state === 'error' ? (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Thất bại</span>
          </>
        ) : (
          <>
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Đang chấm lại...' : 'Chấm lại bằng AI'}
          </>
        )}
      </Button>

      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-500 max-w-xs text-right leading-snug">{errorMsg}</p>
      )}
    </div>
  )
}
