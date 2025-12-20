import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, TodoStatus } from '../types/todo';

interface TodoState {
  todos: Todo[];
  past: Todo[][];
  future: Todo[][];

  addTodo: (todo: Partial<Todo>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (id: string, targetStatus: TodoStatus) => void;

  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      past: [],
      future: [],

      addTodo: (todo) =>
        set((state) => ({
          past: [...state.past, state.todos].slice(-MAX_HISTORY),
          future: [],
          todos: [
            ...state.todos,
            {
              id: uuidv4(),
              title: todo.title || '',
              memo: todo.memo || '',
              dueDate: todo.dueDate || '',
              status: todo.status || 'IDEA',
              colorIdx: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            } as Todo,
          ],
        })),

      updateTodo: (id, updates) =>
        set((state) => {
          const target = state.todos.find((t) => t.id === id);
          if (!target) return state;

          const newStatus = updates.status;
          const statusChanged = newStatus && newStatus !== target.status;

          let additionalUpdates: Partial<Todo> = {};
          if (statusChanged) {
            const now = Date.now();
            if (newStatus === 'PLAN') additionalUpdates.plannedAt = now;
            if (newStatus === 'IN_PROGRESS') additionalUpdates.startedAt = now;
            if (newStatus === 'REVIEW') additionalUpdates.reviewedAt = now;
            if (newStatus === 'DONE') additionalUpdates.completedAt = now;
          }

          return {
            past: [...state.past, state.todos].slice(-MAX_HISTORY),
            future: [],
            todos: state.todos.map((t) =>
              t.id === id ? { ...t, ...updates, ...additionalUpdates, updatedAt: Date.now() } : t
            ),
          };
        }),

      deleteTodo: (id) =>
        set((state) => ({
          past: [...state.past, state.todos].slice(-MAX_HISTORY),
          future: [],
          todos: state.todos.filter((t) => t.id !== id),
        })),

      moveTodo: (id, targetStatus) =>
        set((state) => {
          const now = Date.now();
          let dateUpdates: Partial<Todo> = {};
          if (targetStatus === 'PLAN') dateUpdates.plannedAt = now;
          if (targetStatus === 'IN_PROGRESS') dateUpdates.startedAt = now;
          if (targetStatus === 'REVIEW') dateUpdates.reviewedAt = now;
          if (targetStatus === 'DONE') dateUpdates.completedAt = now;

          return {
            past: [...state.past, state.todos].slice(-MAX_HISTORY),
            future: [],
            todos: state.todos.map((t) =>
              t.id === id ? { ...t, status: targetStatus, ...dateUpdates, updatedAt: now } : t
            ),
          };
        }),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, -1);
          return {
            past: newPast,
            future: [state.todos, ...state.future],
            todos: previous,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          return {
            past: [...state.past, state.todos],
            future: newFuture,
            todos: next,
          };
        }),
    }),
    {
      name: 'todo-storage',
    }
  )
);