'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, SortAsc, Calendar, BookOpen, ExternalLink, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Exam } from '@/types/database'

interface TeacherExamListProps {
  exams: (Pick<Exam, 'id' | 'title' | 'created_at'>)[]
}

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc'

export function TeacherExamList({ exams }: TeacherExamListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const filteredAndSorted = useMemo(() => {
    return (exams || [])
      .filter(exam => {
        if (!search) return true
        return exam.title.toLowerCase().includes(search.toLowerCase())
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          case 'oldest':
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          case 'name_asc':
            return a.title.localeCompare(b.title)
          case 'name_desc':
            return b.title.localeCompare(a.title)
          default:
            return 0
        }
      })
  }, [exams, search, sortBy])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-5 rounded-3xl border border-primary/5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm đề thi theo tên..." 
              className="pl-11 h-12 rounded-2xl border-muted-foreground/10 focus:ring-primary/20 bg-muted/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative min-w-[180px]">
              <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select 
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-muted-foreground/10 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name_asc">Tên (A-Z)</option>
                <option value="name_desc">Tên (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSorted.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-muted-foreground/20">
            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Không tìm thấy đề thi nào</h3>
            <p className="text-muted-foreground mt-1">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
          </div>
        ) : (
          filteredAndSorted.map((exam) => (
            <Card key={exam.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-2 border-transparent hover:border-primary/10 rounded-[2rem] bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Mock Exam</span>
                    </div>
                    <CardTitle className="text-xl font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {exam.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-6">
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/60" />
                    {new Date(exam.created_at || '').toLocaleDateString('vi-VN')}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <div className="flex items-center gap-1.5">
                    ID: {exam.id.split('-')[0]}...
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/teacher/attempts?examId=${exam.id}`}
                    className={cn(
                      buttonVariants({ size: 'default', variant: 'default' }), 
                      "flex-1 rounded-2xl h-12 font-semibold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    Xem bài nộp
                    <ExternalLink className="ml-2 h-4 w-4 opacity-70" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
