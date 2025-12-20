import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MdAdd, MdSort, MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';
import type { TodoStatus, SortField } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';
import { KanbanCard } from './KanbanCard';

const ColumnContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ebecf0;
  border-radius: 8px;
`;

const Header = styled.div`
  width: 100%;
  padding: 12px 12px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* For sort menu positioning */
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #5e6c84;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #5e6c84;
  
  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

const SortMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 8px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31);
  z-index: 10;
  overflow: hidden;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  width: 120px;
`;

const SortItem = styled.button<{ $active: boolean }>`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  background: ${({ $active }) => ($active ? '#e6effc' : 'white')};
  color: ${({ $active }) => ($active ? '#0052cc' : '#172b4d')};
  border: none;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? '#e6effc' : '#f4f5f7')};
  }
`;

const CardList = styled.div`
  width: 100%;
  padding: 0 8px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const AddForm = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 3px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);

  input {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .btn-group {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
`;

interface Props {
  status: TodoStatus;
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  IDEA: '구상',
  PLAN: '계획',
  IN_PROGRESS: '진행',
  REVIEW: '검수',
  DONE: '완료',
};

export const Column = ({ status }: Props) => {
  const { todos, addTodo } = useTodoStore();
  const { statusSorts, toggleSort } = useUIStore();

  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSort = statusSorts[status] || 'CREATED_DESC';
  const [currentField, currentDir] = currentSort.split('_') as [SortField, 'ASC' | 'DESC'];

  const sortedTodos = useMemo(() => {
    const filtered = todos.filter((t) => t.status === status);

    return filtered.sort((a, b) => {
      let valA: string | number | undefined;
      let valB: string | number | undefined;

      switch (currentField) {
        case 'CREATED':
          valA = a.createdAt;
          valB = b.createdAt;
          break;
        case 'TITLE':
          valA = a.title;
          valB = b.title;
          break;
        case 'UPDATED':
          valA = a.updatedAt;
          valB = b.updatedAt;
          break;
        case 'DUE':
          valA = a.dueDate;
          valB = b.dueDate;
          break;
      }

      // Handle undefined/empty values (push to bottom usually)
      if (!valA && valA !== 0) return 1;
      if (!valB && valB !== 0) return -1;
      if (valA === valB) return 0;

      // Comparison
      let result = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        result = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        result = valA - valB;
      }

      return currentDir === 'ASC' ? result : -result;
    });
  }, [todos, status, currentField, currentDir]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTodo({ title: newTitle, status, dueDate: newDueDate });
    setNewTitle('');
    setNewDueDate('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setNewTitle('');
      setNewDueDate('');
    }
  };

  const sortOptions: SortField[] = ['CREATED', 'DUE', 'TITLE', 'UPDATED'];

  return (
    <ColumnContainer>
      <Header ref={menuRef}>
        <TitleGroup>
          <span>{STATUS_LABELS[status]}</span>
          <span>{sortedTodos.length}</span>
        </TitleGroup>

        <div style={{ position: 'relative' }}>
          <SortButton onClick={() => setIsMenuOpen(!isMenuOpen)} title={`Sort by ${currentField} ${currentDir}`}>
            <MdSort />
            {currentDir === 'ASC' ? <MdArrowDropUp /> : <MdArrowDropDown />}
          </SortButton>

          <SortMenu $isOpen={isMenuOpen}>
            {sortOptions.map((field) => (
              <SortItem
                key={field}
                $active={currentField === field}
                onClick={() => toggleSort(status, field)}
              >
                {field} {currentField === field && (currentDir === 'ASC' ? '↑' : '↓')}
              </SortItem>
            ))}
          </SortMenu>
        </div>
      </Header>

      <CardList>
        {sortedTodos.map((todo) => (
          <KanbanCard key={todo.id} todo={todo} />
        ))}
      </CardList>

      <AddForm>
        <input
          autoFocus
          placeholder="새로운 할 일"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: 'auto', marginBottom: 0 }}
          />
          <div className="btn-group">
            <button
              onClick={handleAdd}
              style={{ background: '#0052cc', color: '#fff', padding: '4px 8px', borderRadius: '3px' }}
            >
              <MdAdd />
            </button>
          </div>
        </div>
      </AddForm>
    </ColumnContainer>
  );
};