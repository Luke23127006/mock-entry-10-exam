'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { startExam } from '@/app/actions/exam'
import type { Exam, ExamAttempt } from '@/types/database'
import { cn } from '@/lib/utils'
import { Search, SortAsc, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ExamListProps {
  exams: Exam[]
  attempts: ExamAttempt[]
}

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'score_desc' | 'score_asc'
type StatusFilter = 'all' | 'completed' | 'draft' | 'not_started'
type GradingFilter = 'all' | 'pending' | 'evaluated'

export function ExamList({ exams, attempts }: ExamListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [gradingFilter, setGradingFilter] = useState<GradingFilter>('all')

  const enrichedExams = useMemo(() => {
    // Group attempts by exam_id, taking the best one (completed > draft)
    const attemptByExam = new Map<string, ExamAttempt>()
    for (const a of attempts) {
      const existing = attemptByExam.get(a.exam_id)
      if (!existing || (existing.status === 'draft' && a.status === 'completed')) {
        attemptByExam.set(a.exam_id, a)
      }
    }

    return exams.map(exam => {
      const attempt = attemptByExam.get(exam.id)
      
      // Determine if exam has writing questions
      const content = exam.content as any
      const questions = [
        ...(content.questions || []),
        ...(content.sections?.flatMap((s: any) => s.components) || [])
      ]
      const hasWriting = questions.some((q: any) => {
        const type = (q.type || '').toLowerCase()
        const part = (q.part || '').toLowerCase()
        return type.includes('writing') || 
               type.includes('essay') || 
               part.includes('d') || 
               part.includes('writing') ||
               !!q.rubric
      })

      // Clean score for sorting (convert to number)
      const scoreNum = attempt?.score 
        ? parseFloat(attempt.score.toString().replace(/[^0-9.]/g, '')) 
        : -1

      return {
        ...exam,
        attempt,
        hasWriting,
        scoreNum,
        status: attempt?.status || 'not_started'
      }
    })
  }, [exams, attempts])

  const filteredAndSortedExams = useMemo(() => {
    return enrichedExams
      .filter(exam => {
        // Search filter
        if (search && !exam.title.toLowerCase().includes(search.toLowerCase())) return false

        // Status filter
        if (statusFilter !== 'all' && exam.status !== statusFilter) return false

        // Grading filter
        if (gradingFilter !== 'all') {
          if (!exam.hasWriting || exam.status !== 'completed') return false
          const isGraded = !!exam.attempt?.is_graded
          if (gradingFilter === 'pending' && isGraded) return false
          if (gradingFilter === 'evaluated' && !isGraded) return false
        }

        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case 'name_asc':
            return a.title.localeCompare(b.title)
          case 'name_desc':
            return b.title.localeCompare(a.title)
          case 'score_desc':
            return b.scoreNum - a.scoreNum
          case 'score_asc':
            // Put unattempted at the bottom for score_asc
            if (a.scoreNum === -1) return 1
            if (b.scoreNum === -1) return -1
            return a.scoreNum - b.scoreNum
          default:
            return 0
        }
      })
  }, [enrichedExams, search, sortBy, statusFilter, gradingFilter])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search exams..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sort By</label>
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="score_desc">Score (High-Low)</option>
                <option value="score_asc">Score (Low-High)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="draft">In Progress</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Grading</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={gradingFilter}
                onChange={(e) => setGradingFilter(e.target.value as GradingFilter)}
              >
                <option value="all">All Grading</option>
                <option value="pending">Pending</option>
                <option value="evaluated">Evaluated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAndSortedExams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No exams match your criteria.</p>
          </div>
        ) : (
          filteredAndSortedExams.map((exam) => {
            const attempt = exam.attempt
            const isGraded = !!attempt?.is_graded

            return (
              <Card key={exam.id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{exam.title}</CardTitle>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                        Added {new Date(exam.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {attempt?.status === 'completed' && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-primary">
                          {attempt.score.toString().replace(/[^0-9.]/g, '')}
                          <span className="text-xs font-bold text-muted-foreground ml-1">PTS</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {attempt?.status === 'completed' && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {exam.hasWriting && !isGraded && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending evaluation
                        </div>
                      )}
                      {exam.hasWriting && isGraded && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px] font-black uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Evaluated
                        </div>
                      )}
                      {!exam.hasWriting && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                          Auto-graded
                        </div>
                      )}
                    </div>
                  )}

                  {attempt?.status === 'draft' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider mt-2">
                      In Progress
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex items-center gap-3 pt-0">
                  {!attempt && (
                    <form action={startExam.bind(null, exam.id)} className="w-full">
                      <Button type="submit" size="sm" className="w-full sm:w-auto rounded-full px-6">
                        Start Exam
                      </Button>
                    </form>
                  )}
                  {attempt?.status === 'draft' && (
                    <Link 
                      href={`/exam/${attempt.id}`} 
                      className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), "w-full sm:w-auto rounded-full px-6")}
                    >
                      Continue
                    </Link>
                  )}
                  {attempt?.status === 'completed' && (
                    <Link 
                      href={`/exam/${attempt.id}/result`} 
                      className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), "w-full sm:w-auto rounded-full px-6 border-primary/20 hover:bg-primary/5")}
                    >
                      View Results
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
