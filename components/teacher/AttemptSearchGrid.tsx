'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Clock, FileCheck, Timer } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EnrichedAttempt {
  id: string
  user_id: string
  exam_id: string
  status: string
  score: string | null
  feedback: any
  userName: string
  examTitle: string
  maxScore: number
  hasWritingPending: boolean
}

interface AttemptSearchGridProps {
  attempts: EnrichedAttempt[]
}

export default function AttemptSearchGrid({ attempts }: AttemptSearchGridProps) {
  const [search, setSearch] = useState('')

  const filteredAttempts = useMemo(() => {
    if (!search.trim()) return attempts
    const s = search.toLowerCase()
    return attempts.filter(
      (a) =>
        a.userName.toLowerCase().includes(s) || 
        a.examTitle.toLowerCase().includes(s)
    )
  }, [attempts, search])

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto sm:mx-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên học sinh hoặc đề thi..."
          className="pl-10 h-11 rounded-xl border-primary/10 shadow-sm focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredAttempts.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">Không tìm thấy bài nộp nào</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Thử tìm với từ khóa khác.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAttempts.map((attempt) => (
            <Card key={attempt.id} className="rounded-2xl border-primary/10 hover:shadow-md transition-shadow overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {attempt.userName}
                    </CardTitle>
                    <CardDescription className="font-medium line-clamp-1">{attempt.examTitle}</CardDescription>
                  </div>
                  {attempt.hasWritingPending ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] uppercase tracking-widest gap-1 py-1">
                      <Clock className="h-3 w-3" />
                      Chờ chấm
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[10px] uppercase tracking-widest gap-1 py-1">
                      <FileCheck className="h-3 w-3" />
                      Đã chấm
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-4">
                <div className="flex items-baseline gap-1.5 bg-muted/30 p-3 rounded-xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Điểm số:</p>
                  <p className="text-xl font-black text-primary">
                    {attempt.score || '0'}
                    <span className="text-sm font-semibold text-muted-foreground ml-1">
                      / {attempt.maxScore} PTS
                    </span>
                  </p>
                </div>
                <Link
                  href={`/teacher/attempts/${attempt.id}`}
                  className={cn(
                    buttonVariants({ size: 'sm', variant: attempt.hasWritingPending ? 'default' : 'secondary' }),
                    "w-full rounded-xl font-bold transition-all active:scale-[0.98]",
                    attempt.hasWritingPending && "shadow-lg shadow-primary/20"
                  )}
                >
                  {attempt.hasWritingPending ? 'Bắt đầu chấm bài' : 'Xem lại chi tiết'}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
