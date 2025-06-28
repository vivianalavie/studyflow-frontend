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

export async function createAssignment(assignment: Omit<Assignment, 'id' | 'courseName' | 'courseColor' | 'courseTotalPoints'>): Promise<void> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/assignments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(assignment)
  })

  if (!response.ok) {
    throw new Error('Error creating assignment')
  }
}

export async function generateScheduleForAssignment(assignmentId: string): Promise<void> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/scheduler/generate/${assignmentId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Error generating scheduler')
  }
} 