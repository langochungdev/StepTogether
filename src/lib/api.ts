import { Leader, Part, TodoItem } from './data';
import { CONFIG } from './config';

const API_BASE = CONFIG.API_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Có lỗi xảy ra', response.status);
  }

  return data;
}

// Leaders API
export async function getLeaders(): Promise<Leader[]> {
  const response = await apiCall<{ success: boolean; data: Leader[] }>('/leaders');
  return response.data;
}

export async function registerLeader(name: string): Promise<Leader> {
  const response = await apiCall<{ success: boolean; data: Leader }>('/leaders', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return response.data;
}

export async function completeLeader(id: string): Promise<Leader> {
  const response = await apiCall<{ success: boolean; data: Leader }>(
    `/leaders/${id}/complete`,
    {
      method: 'POST',
    }
  );
  return response.data;
}

export async function deleteLeader(id: string): Promise<void> {
  await apiCall(`/leaders/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleLeaderHelp(id: string, needsHelp: boolean): Promise<Leader> {
  const response = await apiCall<{ success: boolean; data: Leader }>(
    `/leaders/${id}/help?needsHelp=${needsHelp}`,
    {
      method: 'POST'
    }
  );
  return response.data;
}

export async function toggleLeaderTodo(leaderId: string, todoId: string): Promise<{ 
  todoId: string; 
  completed: boolean; 
}> {
  const response = await apiCall<{ success: boolean; data: { 
    todoId: string; 
    completed: boolean; 
  } }>(
    `/leaders/${leaderId}/todos/${todoId}/toggle`,
    {
      method: 'POST',
    }
  );
  return response.data;
}

// Parts API
export async function getParts(): Promise<Part[]> {
  const response = await apiCall<{ success: boolean; data: Part[] }>('/parts');
  return response.data;
}

export async function getActivePart(): Promise<Part | null> {
  const response = await apiCall<{ success: boolean; data: Part | null }>('/parts/active');
  return response.data;
}

export async function createPart(name: string, description: string, todoList: Omit<TodoItem, 'id' | 'completed'>[]): Promise<Part> {
  const response = await apiCall<{ success: boolean; data: Part }>('/parts', {
    method: 'POST',
    body: JSON.stringify({ name, description, todoList }),
  });
  return response.data;
}

export async function updatePart(id: string, name: string, description: string, todoList: Partial<TodoItem>[]): Promise<Part> {
  const response = await apiCall<{ success: boolean; data: Part }>(`/parts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description, todoList }),
  });
  return response.data;
}

export async function deletePart(id: string): Promise<void> {
  await apiCall(`/parts/${id}`, {
    method: 'DELETE',
  });
}

export async function activatePart(partId: string): Promise<Part> {
  const response = await apiCall<{ success: boolean; data: Part }>(`/parts/${partId}/activate`, {
    method: 'POST',
  });
  return response.data;
}

export async function toggleTodoCompletion(partId: string, todoId: string): Promise<Part> {
  const response = await apiCall<{ success: boolean; data: Part }>(`/parts/${partId}/todos/${todoId}/toggle`, {
    method: 'POST',
  });
  return response.data;
}

// System API
export async function resetSystem(): Promise<string> {
  const response = await apiCall<{ success: boolean; data: string }>('/system/reset', {
    method: 'POST',
  });
  return response.data;
}

export async function getSystemStats(): Promise<{totalLeaders: number; completedLeaders: number}> {
  const response = await apiCall<{ success: boolean; data: {totalLeaders: number; completedLeaders: number} }>('/system/stats');
  return response.data;
}