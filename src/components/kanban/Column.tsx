import React, { useState } from 'react';
import styled from 'styled-components';
import { MdAdd } from 'react-icons/md';
import type { TodoStatus } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { KanbanCard } from './KanbanCard';

const ColumnContainer = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  background: #ebecf0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

const Header = styled.div`
  padding: 12px 12px 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #5e6c84;
  display: flex;
  justify-content: space-between;
`;

const CardList = styled.div`
  padding: 0 8px;
  flex: 1;
  overflow-y: auto;
  min-height: 50px; /* 드롭 영역 확보용 */
  
  /* 스크롤바 커스텀 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const Footer = styled.div`
  padding: 8px;
`;

const AddButton = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  text-align: left;
  color: #5e6c84;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

// 빠른 추가 폼 스타일
const AddForm = styled.div`
  background: #fff;
  border-radius: 3px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);

  input {
    width: 100%;
    margin-bottom: 8px;
    border: 2px solid ${({ theme }) => theme.colors.brand};
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

export const Column = ({ status }: Props) => {
  const { todos, addTodo } = useTodoStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 1. 현재 컬럼 상태에 맞는 Todo만 필터링
  const columnTodos = todos.filter((todo) => todo.status === status);

  // 2. Todo 추가 핸들러
  const handleAdd = () => {
    if (!newTitle.trim()) {
      setIsAdding(false);
      return;
    }
    addTodo({ title: newTitle, status }); // 현재 컬럼 상태로 추가
    setNewTitle('');
    setIsAdding(false); // 입력 후 폼 닫기 (계속 열어두려면 제거)
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTitle('');
    }
  };

  return (
    <ColumnContainer>
      <Header>
        <span>{status}</span>
        <span>{columnTodos.length}</span>
      </Header>

      <CardList>
        {columnTodos.map((todo) => (
          <KanbanCard key={todo.id} todo={todo} />
        ))}
      </CardList>

      <Footer>
        {isAdding ? (
          <AddForm>
            <input
              autoFocus
              placeholder="무엇을 해야 하나요?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                // 포커스 잃으면 취소할지, 저장할지 선택 (여기선 저장 없이 닫기)
                // setIsAdding(false); 
              }}
            />
            <div className="btn-group">
              <button 
                onClick={handleAdd}
                style={{ background: '#0052cc', color: '#fff', padding: '4px 8px', borderRadius: '3px' }}
              >
                추가
              </button>
              <button onClick={() => setIsAdding(false)}>✕</button>
            </div>
          </AddForm>
        ) : (
          <AddButton onClick={() => setIsAdding(true)}>
            <MdAdd /> 카드 추가
          </AddButton>
        )}
      </Footer>
    </ColumnContainer>
  );
};