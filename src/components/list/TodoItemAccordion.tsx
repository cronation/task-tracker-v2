import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { MdDeleteOutline, MdDateRange, MdClose, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import type { Todo, TodoStatus } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';

// 스타일링
const ItemContainer = styled.div<{ $isExpanded: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  transition: margin 0.2s;
  position: relative; 

  ${({ $isExpanded }) =>
    $isExpanded ?
      css`
      background: #fafbfc;
      margin: 10px -10px; /* 살짝 튀어나오는 효과 */
      padding: 0 10px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-bottom: none;
    ` :
      css`
      &:hover {
        background: #f4f5f7;
      }
    `}
`;

const SummaryView = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 10px;
  cursor: pointer;
  /* gap: 15px; */
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
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
  padding: 2px 10px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
`;

// Expanded View (편집 폼)
const EditForm = styled.div`
  padding: 15px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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

const TopIconButton = styled.button`
  padding: 4px;
  font-size: 18px;
  color: #5e6c84;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover { 
    color: #172b4d; 
    background: #eaecf0; 
  }
`;

const statusOrder: TodoStatus[] = ['IDEA', 'PLAN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const TodoItemAccordion = ({ todo }: { todo: Todo }) => {
  const { updateTodo, deleteTodo } = useTodoStore();
  const { selectedTodoId, setSelectedTodoId } = useUIStore();

  const isExpanded = selectedTodoId === todo.id;

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
  const handleDelete = () => deleteTodo(todo.id);

  // const handleContainerBlur = (e: React.FocusEvent) => {
  //   // If the new focus target is NOT within this container, close it
  //   if (!e.currentTarget.contains(e.relatedTarget)) {
  //     handleSave(); // Ensure save happens
  //     setSelectedTodoId(null);
  //   }
  // };

  const currentIndex = statusOrder.indexOf(todo.status);
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  const handleNext = () => {
    if (nextStatus) {
      updateTodo(todo.id, { status: nextStatus });
    }
  };

  if (!isExpanded) {
    const memoLines = todo.memo ? todo.memo.split('\n') : [];
    const displayMemo = memoLines.length > 3
      ? '... \n' + memoLines.slice(-3).join('\n')
      : todo.memo;

    return (
      <ItemContainer $isExpanded={false} onClick={() => setSelectedTodoId(todo.id)}>
        <SummaryView>
          <div style={{ flex: 1, fontWeight: 500 }}>{todo.title || '(제목 없음)'}</div>

          <SummaryMeta>
            {todo.dueDate && (
              <>
                <MdDateRange /> {todo.dueDate}
              </>
            )}
          </SummaryMeta>

        </SummaryView>
        {todo.memo && (
          <SummaryMemo>
            {displayMemo}
          </SummaryMemo>
        )}
      </ItemContainer>
    );
  }

  return (
    <ItemContainer $isExpanded={true}>
      {/* <ItemContainer $isExpanded={true} onBlur={handleContainerBlur}> */}
      <EditForm>
        <InputGroup>
          <StyledInput
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleSave}
            placeholder="할 일 제목"
          />
          <select
            name="status"
            value={formData.status}
            onChange={(e) => {
              handleChange(e);
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

          <TopIconButton onClick={handleDelete} title="Delete" style={{ color: '#DE350B' }}>
            <MdDeleteOutline />
          </TopIconButton>
          <TopIconButton
            onClick={handleNext}
            title={nextStatus ? `Move to ${nextStatus}` : 'Done'}
            disabled={!nextStatus}
            style={{ opacity: !nextStatus ? 0.3 : 1 }}
          >
            <MdKeyboardDoubleArrowRight />
          </TopIconButton>
          <TopIconButton onClick={() => setSelectedTodoId(null)} title="Close">
            <MdClose />
          </TopIconButton>
        </InputGroup>

        <StyledTextarea
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          onBlur={handleSave}
          onFocus={(e) => {
            const tempValue = e.target.value;
            e.target.value = '';
            e.target.value = tempValue;
            e.target.scrollTop = e.target.scrollHeight;
          }}
          placeholder="메모를 입력하세요..."
          autoFocus
        />
      </EditForm>
    </ItemContainer>
  );
};