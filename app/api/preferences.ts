export interface UserPreferences {
  maxStudyDuration: number;
  startLearningTime: string;
  endLearningTime: string;
  username: string;
  blackoutWeekdays: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) {
      throw new Error('Not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error loading preferences');
    }

    return response.json();
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
}

export async function updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) {
      throw new Error('Not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Error updating preferences');
    }

    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
} 