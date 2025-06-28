import axios from 'axios';

export interface ToDo {
  id: string;
  userId: string;
  text: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const createTodo = async (text: string): Promise<ToDo | null> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Not logged in');
    const response = await axios.post(
      `${API_BASE_URL}/api/todos/create`,
      { text },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating todo:', error);
    return null;
  }
};

export const getTodos = async (): Promise<ToDo[]> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Not logged in');
    const response = await axios.get(
      `${API_BASE_URL}/api/todos/my`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
};

export const updateTodo = async (id: string, text: string): Promise<boolean> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Not logged in');
    await axios.put(
      `${API_BASE_URL}/api/todos/edit/${id}`,
      { text },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Error updating todo:', error);
    return false;
  }
};

export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Not logged in');
    await axios.delete(
      `${API_BASE_URL}/api/todos/delete/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    return false;
  }
}; 