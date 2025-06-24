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
    if (!token) throw new Error('Nicht eingeloggt');
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
    console.error('Fehler beim Anlegen des ToDos:', error);
    return null;
  }
};

export const getTodos = async (): Promise<ToDo[]> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Nicht eingeloggt');
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
    console.error('Fehler beim Laden der ToDos:', error);
    return [];
  }
};

export const updateTodo = async (id: string, text: string): Promise<boolean> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Nicht eingeloggt');
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
    console.error('Fehler beim Aktualisieren des ToDos:', error);
    return false;
  }
};

export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (!token) throw new Error('Nicht eingeloggt');
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
    console.error('Fehler beim Löschen des ToDos:', error);
    return false;
  }
}; 