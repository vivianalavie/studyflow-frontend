import { Assignment } from "@/types/assignment"

export async function getAssignments(): Promise<Assignment[]> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/assignments/my`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Error fetching assignments')
  }

  return response.json()
} 