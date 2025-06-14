import axios from 'axios';

export interface Course {
  id: string;
  createdBy: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  professorName: string;
  totalPoints: number;
  totalWorkloadHours: number;
  totalSelfWorkHours: number;
  color?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses/my`, {
      headers: {
        'Authorization': `Bearer ${await window.Clerk.session?.getToken()}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};