export interface Question {
  id: string
  text: string
  type: 'mcq' | 'text' | 'mcq_multi' | 'mcq_text'
  options?: string[]
  context?: string
  multiSelect?: boolean
  encourageOther?: string
  topic?: string
}

export interface Answer {
  questionId: string
  value: string
  timestamp: Date
}

export interface Session {
  id: string
  userId?: string
  startedAt: Date
  completedAt?: Date
  answers: Answer[]
  reportCard?: ReportCard
}

export interface ReportCard {
  overallScore: number
  categories: Category[]
  insights: string[]
  recommendations: string[]
  personalityProfile: string
}

export interface Category {
  name: string
  score: number
  description: string
}