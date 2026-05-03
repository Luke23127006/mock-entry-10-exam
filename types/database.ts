export interface Question {
  id: string
  type: 'single' | 'multiple' | 'writing'
  content: string
  options?: string[]
  correctAnswers?: string[]
  rubric?: string
}

export interface ExamContent {
  questions: Question[]
}

export interface User {
  id: string
  username: string
  password: string
  full_name: string
}

export interface Exam {
  id: string
  title: string
  content: ExamContent
}

export interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  answers: Record<string, string | string[]>
  status: 'draft' | 'completed'
  score: string
  feedback: string
}
