import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { MdDeleteOutline, MdDateRange, MdNotes } from 'react-icons/md';
import type { Todo, TodoStatus } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';

// 스타일링
const ItemContainer = styled.div<{ $isExpanded: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  transition: all 0.2s;

  ${({ $isExpanded }) =>
    $isExpanded &&
    css`
      background: #fafbfc;
      margin: 10px -10px; /* 살짝 튀어나오는 효과 */
      padding: 0 10px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-bottom: none;
    `}
`;

// Collapsed View (요약)
const SummaryView = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 10px;
  cursor: pointer;
  gap: 15px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    background: #f4f5f7;
  }
`;

const SummaryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 100px;
`;

const SummaryMemo = styled.div`
  flex: 1;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Expanded View (편집 폼)
const EditForm = styled.div`
  padding: 15px 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  
  input, select {
    padding: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  font-weight: 600;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const TodoItemAccordion = ({ todo }: { todo: Todo }) => {
  const { updateTodo, deleteTodo } = useTodoStore();
  const { expandedTodoId, setExpandedTodoId } = useUIStore();
  
  const isExpanded = expandedTodoId === todo.id;

  // 로컬 폼 상태
  const [formData, setFormData] = useState(todo);

  useEffect(() => {
    setFormData(todo);
  }, [todo]);

  // 자동 저장 로직 (onBlur)
  const handleSave = () => {
    const isChanged =
      formData.title !== todo.title ||
      formData.dueDate !== todo.dueDate ||
      formData.memo !== todo.memo ||
      formData.status !== todo.status;

    if (isChanged) {
      updateTodo(todo.id, formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (confirm('삭제하시겠습니까?')) {
      deleteTodo(todo.id);
    }
  };

  if (!isExpanded) {
    return (
      <ItemContainer $isExpanded={false}>
        <SummaryView onClick={() => setExpandedTodoId(todo.id)}>
          <div style={{ flex: 1, fontWeight: 500 }}>{todo.title || '(제목 없음)'}</div>
          
          <SummaryMeta>
            {todo.dueDate && (
              <>
                <MdDateRange /> {todo.dueDate}
              </>
            )}
          </SummaryMeta>
          
          <SummaryMemo>
            {todo.memo ? (
              <><MdNotes style={{ verticalAlign: 'middle' }} /> {todo.memo.slice(0, 30)}</>
            ) : ''}
          </SummaryMemo>
        </SummaryView>
      </ItemContainer>
    );
  }

  return (
    <ItemContainer $isExpanded={true}>
      <EditForm>
        <InputGroup>
          <StyledInput
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleSave}
            placeholder="할 일 제목"
            autoFocus
          />
          <select
            name="status"
            value={formData.status}
            onChange={(e) => {
               handleChange(e);
               // 상태 변경은 즉시 반영되어야 UX가 자연스러움 (리스트에서 이동됨)
               updateTodo(todo.id, { status: e.target.value as TodoStatus });
            }}
            onBlur={handleSave}
          >
            <option value="IDEA">IDEA</option>
            <option value="PLAN">PLAN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="DONE">DONE</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            onBlur={handleSave}
          />
        </InputGroup>

        <StyledTextarea
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          onBlur={handleSave}
          placeholder="메모를 입력하세요..."
        />

        <Footer>
          <button onClick={handleDelete} style={{ color: '#DE350B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MdDeleteOutline /> 삭제
          </button>
          <button onClick={() => setExpandedTodoId(null)}>닫기</button>
        </Footer>
      </EditForm>
    </ItemContainer>
  );
};