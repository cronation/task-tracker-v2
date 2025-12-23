import { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { MdKeyboardArrowDown, MdKeyboardArrowRight, MdSort, MdArrowDropUp, MdArrowDropDown, MdAdd } from 'react-icons/md';
import type { TodoStatus, SortField } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';
import { TodoItemAccordion } from './TodoItemAccordion';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 12px;
  position: relative;
`;

const AccordionContainer = styled.div`
  /* max-width: 800px;
  margin: 0 auto;
  margin-bottom: 12px; */
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

// Level 1 Header
const StatusHeader = styled.div<{ $status: TodoStatus; $isOpen: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  cursor: pointer;
  border-bottom: ${({ $isOpen, theme }) => ($isOpen ? `1px solid ${theme.colors.border}` : 'none')};

  &:hover {
    background: #fafbfc;
  }
`;

const StatusTitle = styled.h3`
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
`;

const CountBadge = styled.span`
  background: rgba(9, 30, 66, 0.08);
  color: #172b4d;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 10px;
`;

const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #5e6c84;
  margin-right: 4px;
  
  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

const SortButton = styled(HeaderButton)`
  width: auto;
  padding: 4px 8px;
  gap: 4px;
  margin-right: 8px;
`;

const SortMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 33px;
  right: 56px;
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

const TodoListWrapper = styled.div`
  background: #fff;
  padding: 10px 20px;
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
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

export const StatusAccordion = ({ status }: Props) => {
  const { todos, addTodo } = useTodoStore();
  const { listStatusOpen, setListStatusOpen, statusSorts, toggleSort, setSelectedTodoId } = useUIStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = uuidv4();
    addTodo({ id, status, title: '', colorIdx: 0 });
    if (!listStatusOpen[status]) {
      setListStatusOpen(status, true);
    }
    setSelectedTodoId(id);
  };

  const handleSortMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

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

  const sortOptions: SortField[] = ['CREATED', 'DUE', 'TITLE', 'UPDATED'];

  return (
    <Container>
      <AccordionContainer>
        <StatusHeader
          $status={status}
          $isOpen={listStatusOpen[status]}
          onClick={() => setListStatusOpen(status, !listStatusOpen[status])}
        >
          <StatusTitle>{STATUS_LABELS[status]}</StatusTitle>

          <CountBadge>{sortedTodos.length}</CountBadge>

          <HeaderButton onClick={handleAddClick} title="Add new task">
            <MdAdd size={20} />
          </HeaderButton>

          <SortButton onClick={handleSortMenuClick} title={`Sort by ${currentField} ${currentDir}`}>
            <MdSort />
            {currentDir === 'ASC' ? <MdArrowDropUp /> : <MdArrowDropDown />}
          </SortButton>
          {/* <div style={{ position: 'relative' }} ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <SortButton onClick={() => setIsMenuOpen(!isMenuOpen)} title={`Sort by ${currentField} ${currentDir}`}>
              <MdSort />
              {currentDir === 'ASC' ? <MdArrowDropUp /> : <MdArrowDropDown />}
            </SortButton>
          </div> */}

          {listStatusOpen[status] ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
        </StatusHeader>

        {/* 펼쳐졌을 때만 리스트 렌더링 */}
        {listStatusOpen[status] && (
          <TodoListWrapper>
            {sortedTodos.length > 0 ? (
              sortedTodos.map((todo) => (
                <TodoItemAccordion key={todo.id} todo={todo} />
              ))
            ) : (
              <EmptyMessage>이 단계에 할 일이 없습니다.</EmptyMessage>
            )}
          </TodoListWrapper>
        )}
      </AccordionContainer>

      <SortMenu ref={menuRef} $isOpen={isMenuOpen}>
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
    </Container>
  );
};