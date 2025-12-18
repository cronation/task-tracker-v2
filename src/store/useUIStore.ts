import { create } from 'zustand';
import type { TodoStatus, SortOption } from '../types/todo';

interface UIState {
  viewMode: 'KANBAN' | 'LIST';
  columnSorts: Record<TodoStatus, SortOption>;
  expandedStatus: TodoStatus | null; // Level 1: Status Accordion
  expandedTodoId: string | null;     // Level 2: Todo Item Accordion
  setViewMode: (mode: 'KANBAN' | 'LIST') => void;
  setExpandedStatus: (status: TodoStatus | null) => void;
  setExpandedTodoId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'KANBAN', // Default View
  columnSorts: {
    IDEA: 'CREATED_DESC',
    PLAN: 'CREATED_DESC',
    IN_PROGRESS: 'CREATED_DESC',
    REVIEW: 'CREATED_DESC',
    DONE: 'CREATED_DESC',
  },
  expandedStatus: null,
  expandedTodoId: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  setExpandedStatus: (status) =>
    set((state) => ({
      // Toggle Logic: 이미 열려있으면 닫기, 아니면 열기
      expandedStatus: state.expandedStatus === status ? null : status,
      expandedTodoId: null, // 상위 닫히면 하위도 닫힘
    })),
  setExpandedTodoId: (id) =>
    set((state) => ({
      expandedTodoId: state.expandedTodoId === id ? null : id,
    })),
}));