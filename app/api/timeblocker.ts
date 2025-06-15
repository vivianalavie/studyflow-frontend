import type { Timeblocker } from "@/types/timeblocker"

export async function getTimeblockers(): Promise<Timeblocker[]> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/timeblockers/my`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Error fetching timeblockers')
  }

  return response.json()
} 