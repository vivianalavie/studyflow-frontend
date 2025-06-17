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

export async function createTimeblocker(timeblocker: Omit<Timeblocker, 'id' | 'userId'>): Promise<void> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/timeblockers/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(timeblocker)
  })

  if (!response.ok) {
    throw new Error('Error creating timeblocker')
  }
}

export async function updateTimeblocker(id: string, timeblocker: Omit<Timeblocker, 'id' | 'userId'>): Promise<void> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/timeblockers/edit/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(timeblocker)
  })

  if (!response.ok) {
    throw new Error('Error updating timeblocker')
  }
}

export async function deleteTimeblocker(id: string): Promise<void> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error("Not logged in")
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/timeblockers/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Error deleting timeblocker')
  }
} 