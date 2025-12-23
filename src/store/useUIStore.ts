import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TodoStatus, SortOption, SortField } from '../types/todo';

interface UIState {
  viewMode: 'KANBAN' | 'LIST';
  statusSorts: Record<TodoStatus, SortOption>;
  selectedTodoId: string | null;
  listStatusOpen: Record<TodoStatus, boolean>;
  setViewMode: (mode: 'KANBAN' | 'LIST') => void;
  setSort: (status: TodoStatus, option: SortOption) => void;
  toggleSort: (status: TodoStatus, field: SortField) => void;
  setSelectedTodoId: (id: string | null) => void;
  setListStatusOpen: (status: TodoStatus, open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: 'KANBAN',
      statusSorts: {
        IDEA: 'CREATED_DESC',
        PLAN: 'CREATED_DESC',
        IN_PROGRESS: 'CREATED_DESC',
        REVIEW: 'CREATED_DESC',
        DONE: 'CREATED_DESC',
      },
      selectedTodoId: null,
      listStatusOpen: {
        IDEA: false,
        PLAN: false,
        IN_PROGRESS: false,
        REVIEW: false,
        DONE: false,
      },
      setViewMode: (mode) => set({ viewMode: mode }),
      setSort: (status, option) =>
        set((state) => ({
          statusSorts: { ...state.statusSorts, [status]: option },
        })),
      toggleSort: (status, field) =>
        set((state) => {
          const current = state.statusSorts[status];
          const [currentField, currentDir] = current.split('_') as [SortField, 'ASC' | 'DESC'];

          if (currentField === field) {
            // Same field: toggle direction
            const newDir = currentDir === 'ASC' ? 'DESC' : 'ASC';
            return {
              statusSorts: { ...state.statusSorts, [status]: `${field}_${newDir}` as SortOption },
            };
          } else {
            // New field: default to DESC (usually better for dates/updates) or ASC?
            // User example: "clicking on due changes sort to due desc" -> Default DESC.
            // Except for Title maybe? Let's default DESC for all for consistency, as per user example.
            return {
              statusSorts: { ...state.statusSorts, [status]: `${field}_DESC` as SortOption },
            };
          }
        }),
      setSelectedTodoId: (id) =>
        set((state) => ({
          selectedTodoId: state.selectedTodoId === id ? null : id,
        })),
      setListStatusOpen: (status, open) =>
        set((state) => ({
          listStatusOpen: { ...state.listStatusOpen, [status]: open },
        })),
    }),
    {
      name: 'ui-storage',
    }
  )
);