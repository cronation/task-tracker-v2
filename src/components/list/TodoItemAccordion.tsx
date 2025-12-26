import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { MdDeleteOutline, MdDateRange, MdClose, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import type { Todo, TodoStatus } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';
import { colors } from '../../utils/colors';

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
      padding-left: 22px;
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

const ColorDot = styled.div<{ $color: string }>`  position: absolute;
  left: 10px;
  top: 50%;
  translate: 0 -50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
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

const ColorStrip = styled.div<{ $color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: ${({ $color }) => $color};
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StyledInput = styled.input`
  flex: 1;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  resize: vertical;
  min-height: 84px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 2px;
`;

const statusOrder: TodoStatus[] = ['IDEA', 'PLAN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const STATUS_LABELS: Record<TodoStatus, string> = {
  IDEA: '구상',
  PLAN: '계획',
  IN_PROGRESS: '진행',
  REVIEW: '검수',
  DONE: '완료',
};

export const TodoItemAccordion = ({ todo }: { todo: Todo }) => {
  const { updateTodo, deleteTodo } = useTodoStore();
  const { selectedTodoId, setSelectedTodoId } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const isExpanded = selectedTodoId === todo.id;

  // 로컬 폼 상태
  const [formData, setFormData] = useState(todo);

  useEffect(() => {
    setFormData(todo);
  }, [todo]);

  useEffect(() => {
    if (isExpanded) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  // 자동 저장 로직 (onBlur)
  const handleSave = () => {
    const isChanged =
      formData.title !== todo.title ||
      formData.dueDate !== todo.dueDate ||
      formData.memo !== todo.memo ||
      formData.status !== todo.status ||
      formData.colorIdx !== todo.colorIdx;

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
    const memoLines = todo.memo ? todo.memo.trim().split('\n') : [];
    const filteredMemoLines = memoLines.filter(line => line !== '');
    const displayMemo = filteredMemoLines.length > 3
      ? '... \n' + filteredMemoLines.slice(-3).join('\n')
      : filteredMemoLines.join('\n');

    return (
      <ItemContainer ref={containerRef} $isExpanded={false} onClick={() => setSelectedTodoId(todo.id)}>
        <ColorDot $color={colors[todo.colorIdx] || colors[0]} />
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
    <ItemContainer ref={containerRef} $isExpanded={true}>
      <ColorStrip $color={colors[todo.colorIdx] || colors[0]} />
      <EditForm>
        <InputGroup>
          <StyledInput
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleSave}
            placeholder="할 일 제목"
            autoFocus={formData.title === ''}
          />
          <select
            name="status"
            value={formData.status}
            onChange={(e) => {
              handleChange(e);
              updateTodo(todo.id, { status: e.target.value as TodoStatus });
            }}
            onBlur={handleSave}
            tabIndex={-1}
          >
            {statusOrder.map((status) => (
              <option key={status} value={status} disabled={status === formData.status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            onBlur={handleSave}
            tabIndex={-1}
          />
          <select
            name="colorIdx"
            value={formData.colorIdx}
            onChange={handleChange}
            onBlur={handleSave}
            style={{ backgroundColor: colors[formData.colorIdx] }}
            tabIndex={-1}
          >
            {colors.map((c, idx) => (
              <option key={idx} value={idx} style={{ backgroundColor: c }} />
            ))}
          </select>

          <ButtonGroup>
            <TopIconButton onClick={handleDelete} title="Delete" style={{ color: '#DE350B' }} tabIndex={-1}>
              <MdDeleteOutline />
            </TopIconButton>
            <TopIconButton
              onClick={handleNext}
              title={nextStatus ? `Move to ${nextStatus}` : 'Done'}
              disabled={!nextStatus}
              style={{ opacity: !nextStatus ? 0.3 : 1 }}
              tabIndex={-1}
            >
              <MdKeyboardDoubleArrowRight />
            </TopIconButton>
            <TopIconButton onClick={() => setSelectedTodoId(null)} title="Close" tabIndex={-1}>
              <MdClose />
            </TopIconButton>
          </ButtonGroup>
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
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              handleSave();
              setSelectedTodoId(null);
            }
          }}
          placeholder="메모를 입력하세요..."
          autoFocus={formData.title !== ''}
        />
      </EditForm>
    </ItemContainer>
  );
};