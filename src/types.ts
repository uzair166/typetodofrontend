// src/types.ts

export interface ToDo {
  todoId: string;
  text: string;
  completed: boolean;
  tags: string[];
  order: number;
  createdAt: string; // Dates represented as ISO strings
  updatedAt: string;
}

export interface CreateToDoPayload {
  text: string;
  tags?: string[];
}

export interface EditToDoPayload {
  text?: string;
  completed?: boolean;
  tags?: string[];
}

export interface ReorderToDoPayload {
  newPosition: number;
}

export interface ApiResponse<T> {
  success: boolean;
  todo?: T;
  todos?: T[];
  error?: string;
}
