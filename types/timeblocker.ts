export type Occurrence = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY"

export interface Timeblocker {
  id: string
  name: string
  description: string
  startDate: string // ISO-String
  endDate: string   // ISO-String
  userId: string
  occurrence: Occurrence
} 