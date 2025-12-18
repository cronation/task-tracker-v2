// src/types/todo.ts
export type TodoStatus = 'IDEA' | 'PLAN' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type SortOption = 'CREATED_DESC' | 'DUE_ASC' | 'TITLE_ASC';

export interface Todo {
  id: string;
  title: string;
  memo: string;
  dueDate: string; // YYYY-MM-DD
  status: TodoStatus;
  createdAt: number;
  updatedAt: number;
}