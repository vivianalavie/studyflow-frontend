export type Difficulty = "VERY_EASY" | "EASY" | "NORMAL" | "DIFFICULT" | "VERY_DIFFICULT"

export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  totalAchievablePoints: number
  deadline: string
  difficulty: Difficulty
  courseName?: string
  courseColor?: string
  courseTotalPoints?: number
} 