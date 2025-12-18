import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, TodoStatus } from '../types/todo';

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Partial<Todo>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (id: string, targetStatus: TodoStatus) => void;
}

export const useTodoStore = create<TodoState>()(
  temporal(
    persist(
      (set) => ({
        todos: [],
        addTodo: (todo) =>
          set((state) => ({
            todos: [
              ...state.todos,
              {
                id: uuidv4(),
                title: todo.title || '',
                memo: todo.memo || '',
                dueDate: todo.dueDate || '',
                status: todo.status || 'IDEA',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              } as Todo,
            ],
          })),
        updateTodo: (id, updates) =>
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
            ),
          })),
        deleteTodo: (id) =>
          set((state) => ({
            todos: state.todos.filter((t) => t.id !== id),
          })),
        moveTodo: (id, targetStatus) =>
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? { ...t, status: targetStatus, updatedAt: Date.now() } : t
            ),
          })),
      }),
      { name: 'todo-storage' } // LocalStorage Key
    )
  )
);