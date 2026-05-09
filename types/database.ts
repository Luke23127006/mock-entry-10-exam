export type UserRole = 'student' | 'teacher'

export interface Question {
  id: string
  part: 'A' | 'B' | 'C' | 'D'
  type: 'single' | 'multiple' | 'writing' | 'short_answer' | 'cloze'
  pointValue: number
  content: string
  options?: string[]
  correctAnswers?: string[]
  rubric?: string
  passage?: string
  metadata?: {
    wordRoot?: string
    layout?: 'grid' | 'list'
  }
}

export interface ExamContent {
  questions: Question[]
}

export interface User {
  id: string
  username: string
  password: string
  full_name: string
  role: UserRole
}

export interface Exam {
  id: string
  title: string
  content: ExamContent
}

export interface WritingFeedback {
  score: number
  comment: string
}

export interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  answers: Record<string, string | string[]>
  status: 'draft' | 'completed'
  score: string
  feedback: Record<string, WritingFeedback> | null
}
