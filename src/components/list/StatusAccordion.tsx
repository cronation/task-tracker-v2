import React from 'react';
import styled from 'styled-components';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import type { TodoStatus } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';
import { TodoItemAccordion } from './TodoItemAccordion';

const AccordionContainer = styled.div`
  margin-bottom: 12px;
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
  transition: background 0.2s;

  &:hover {
    background: #fafbfc;
  }
`;

const StatusColorStrip = styled.div<{ $status: TodoStatus }>`
  width: 4px;
  height: 24px;
  border-radius: 4px;
  margin-right: 12px;
  background-color: ${({ theme, $status }) => theme.colors.status[$status]};
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

const TodoListWrapper = styled.div`
  background: #fff;
  padding: 0 20px;
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

export const StatusAccordion = ({ status }: Props) => {
  const { todos } = useTodoStore();
  const { expandedStatus, setExpandedStatus } = useUIStore();

  const isOpen = expandedStatus === status;
  const statusTodos = todos.filter((t) => t.status === status);

  return (
    <AccordionContainer>
      <StatusHeader 
        $status={status} 
        $isOpen={isOpen} 
        onClick={() => setExpandedStatus(status)}
      >
        {/* 상태 컬러 띠 */}
        <StatusColorStrip $status={status} />
        
        <StatusTitle>{status}</StatusTitle>
        
        <CountBadge>{statusTodos.length}</CountBadge>
        
        {isOpen ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
      </StatusHeader>

      {/* 펼쳐졌을 때만 리스트 렌더링 */}
      {isOpen && (
        <TodoListWrapper>
          {statusTodos.length > 0 ? (
            statusTodos.map((todo) => (
              <TodoItemAccordion key={todo.id} todo={todo} />
            ))
          ) : (
            <EmptyMessage>이 단계에 할 일이 없습니다.</EmptyMessage>
          )}
        </TodoListWrapper>
      )}
    </AccordionContainer>
  );
};