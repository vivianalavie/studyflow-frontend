export type Difficulty = "VERY_EASY" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD"

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