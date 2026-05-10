'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, SortAsc, Filter, User, BookOpen, Clock, CheckCircle2, Timer } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ExamAttempt, User as DBUser } from '@/types/database'

interface AttemptListProps {
  attempts: (ExamAttempt & { created_at?: string, exams: { id: string, title: string } })[]
  users: Pick<DBUser, 'id' | 'full_name' | 'username'>[]
}

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'score_desc' | 'score_asc'
type GradingFilter = 'all' | 'pending' | 'graded'

export function AttemptList({ attempts, users }: AttemptListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [gradingFilter, setGradingFilter] = useState<GradingFilter>('all')
  const [examFilter, setExamFilter] = useState<string>('all')

  const userMap = useMemo(() => new Map((users || []).map(u => [u.id, u])), [users])
  
  const exams = useMemo(() => {
    const uniqueExams = new Map<string, string>()
    ;(attempts || []).forEach(a => {
      const examData = Array.isArray(a.exams) ? a.exams[0] : a.exams
      if (a && examData) uniqueExams.set(examData.id, examData.title)
    })
    return Array.from(uniqueExams.entries()).map(([id, title]) => ({ id, title }))
  }, [attempts])

  const enrichedAttempts = useMemo(() => {
    return (attempts || []).map(attempt => {
      const user = userMap.get(attempt.user_id)
      const examData = Array.isArray(attempt.exams) ? attempt.exams[0] : attempt.exams
      const scoreNum = parseFloat(attempt.score?.toString().replace(/[^0-9.]/g, '') || '0')
      
      return {
        ...attempt,
        userName: user?.full_name || user?.username || 'Học sinh',
        examTitle: examData?.title || 'Đề thi',
        scoreNum,
        isGraded: !!attempt.is_graded
      }
    })
  }, [attempts, userMap])

  const filteredAndSorted = useMemo(() => {
    return enrichedAttempts
      .filter(a => {
        if (search) {
          const s = search.toLowerCase()
          if (!a.userName.toLowerCase().includes(s) && !a.examTitle.toLowerCase().includes(s)) return false
        }
        if (gradingFilter === 'pending' && a.isGraded) return false
        if (gradingFilter === 'graded' && !a.isGraded) return false
        if (examFilter !== 'all' && a.exam_id !== examFilter) return false
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          case 'oldest':
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          case 'name_asc':
            return a.userName.localeCompare(b.userName)
          case 'name_desc':
            return b.userName.localeCompare(a.userName)
          case 'score_desc':
            return b.scoreNum - a.scoreNum
          case 'score_asc':
            return a.scoreNum - b.scoreNum
          default:
            return 0
        }
      })
  }, [enrichedAttempts, search, sortBy, gradingFilter, examFilter])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm theo tên học sinh hoặc tên đề thi..." 
            className="pl-10 h-11 rounded-xl border-muted-foreground/20 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Sắp xếp theo</label>
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-muted-foreground/20 bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name_asc">Tên học sinh (A-Z)</option>
                <option value="name_desc">Tên học sinh (Z-A)</option>
                <option value="score_desc">Điểm số (Cao-Thấp)</option>
                <option value="score_asc">Điểm số (Thấp-Cao)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Trạng thái chấm bài</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-muted-foreground/20 bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                value={gradingFilter}
                onChange={(e) => setGradingFilter(e.target.value as GradingFilter)}
              >
                <option value="all">Tất cả bài làm</option>
                <option value="pending">Chờ chấm điểm</option>
                <option value="graded">Đã chấm xong</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Lọc theo đề thi</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-muted-foreground/20 bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
              >
                <option value="all">Tất cả đề thi</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-muted-foreground/30">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Không tìm thấy bài làm nào</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
            <Button variant="link" onClick={() => {
              setSearch('')
              setGradingFilter('all')
              setExamFilter('all')
            }} className="mt-4 text-primary">Xóa tất cả bộ lọc</Button>
          </div>
        ) : (
          filteredAndSorted.map((attempt) => (
            <Card key={attempt.id} className={cn(
              "group overflow-hidden transition-all duration-300 hover:shadow-lg border-2",
              !attempt.isGraded ? "border-amber-200/50 bg-amber-50/10" : "border-border hover:border-primary/20"
            )}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">{attempt.userName}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground pl-10">
                      <BookOpen className="h-3 w-3" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{attempt.examTitle}</span>
                    </div>
                  </div>

                  <div className="text-right w-full sm:w-auto">
                    <div className="text-3xl font-bold text-primary tracking-tighter">
                      {attempt.scoreNum}
                      <span className="text-[10px] font-semibold text-muted-foreground ml-1 uppercase">Points</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                    <Clock className="h-3 w-3" />
                    {new Date(attempt.created_at || '').toLocaleDateString('vi-VN')}
                  </div>
                  
                  {!attempt.isGraded ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-200">
                      <Timer className="h-3 w-3 animate-pulse" />
                      Chờ chấm điểm
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-widest border border-green-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã hoàn thành
                    </div>
                  )}
                </div>

                <Link
                  href={`/teacher/attempts/${attempt.id}`}
                  className={cn(
                    buttonVariants({ 
                      size: 'default', 
                      variant: !attempt.isGraded ? 'default' : 'outline' 
                    }), 
                    "rounded-xl px-8 font-semibold w-full sm:w-auto h-11 shadow-sm transition-all group-hover:translate-x-1"
                  )}
                >
                  {!attempt.isGraded ? 'Bắt đầu chấm bài' : 'Xem chi tiết'}
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
