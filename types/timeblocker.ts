export type Occurrence = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY"

export interface Timeblocker {
  id: string
  name: string
  description: string
  start_date: string // ISO-String
  end_date: string   // ISO-String
  user_id: string
  occurrence: Occurrence
} 