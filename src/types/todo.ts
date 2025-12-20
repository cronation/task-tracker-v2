// src/types/todo.ts
export type TodoStatus = 'IDEA' | 'PLAN' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type SortField = 'CREATED' | 'DUE' | 'TITLE' | 'UPDATED';
export type SortDirection = 'ASC' | 'DESC';
export type SortOption = `${SortField}_${SortDirection}`;

export interface Todo {
  id: string;
  title: string;
  memo: string;
  dueDate: string; // YYYY-MM-DD
  status: TodoStatus;
  colorIdx: number;
  createdAt: number;
  updatedAt: number;
  plannedAt?: number;
  startedAt?: number;
  reviewedAt?: number;
  completedAt?: number;
}