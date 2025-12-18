import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MdClose, MdDeleteOutline } from 'react-icons/md';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';
import type { TodoStatus } from '../../types/todo';

// 1. 스타일링: 배경 오버레이 (클릭 시 닫힘)
const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(9, 30, 66, 0.54);
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.2s;
`;

// 2. 스타일링: 슬라이드 드로어
const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 500px; /* 넓은 너비 */
  max-width: 90%;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #dfe1e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: #5e6c84;
    text-transform: uppercase;
  }
`;

const TitleInput = styled.textarea`
  font-size: 24px;
  font-weight: 600;
  border: 1px solid transparent;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  resize: none;
  background: transparent;

  &:hover {
    background: #ebecf0;
  }
  &:focus {
    background: #fff;
    border-color: ${({ theme }) => theme.colors.brand};
  }
`;

const MemoTextarea = styled.textarea`
  min-height: 150px;
  resize: vertical;
  line-height: 1.6;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #42526e;
  
  &:hover {
    background: rgba(9, 30, 66, 0.08);
  }
`;

export const DetailDrawer = () => {
  console.log(useTodoStore()); ///////////////////////////////////////
  const { todos, updateTodo, deleteTodo } = useTodoStore();
  const { expandedTodoId, setExpandedTodoId } = useUIStore();

  // 현재 선택된 투두 찾기
  const targetTodo = todos.find((t) => t.id === expandedTodoId);
  const isOpen = !!expandedTodoId && !!targetTodo;

  // 로컬 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    status: 'IDEA' as TodoStatus,
    dueDate: '',
    memo: '',
  });

  // 투두가 열릴 때 데이터 동기화
  useEffect(() => {
    if (targetTodo) {
      setFormData({
        title: targetTodo.title,
        status: targetTodo.status,
        dueDate: targetTodo.dueDate,
        memo: targetTodo.memo,
      });
    }
  }, [targetTodo]);

  // 닫기 핸들러
  const handleClose = () => {
    setExpandedTodoId(null);
  };

  // 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 저장 핸들러 (onBlur)
  const handleSave = () => {
    if (!targetTodo) return;
    
    // 변경사항이 있을 때만 저장 (불필요한 History 방지)
    const isChanged =
      formData.title !== targetTodo.title ||
      formData.status !== targetTodo.status ||
      formData.dueDate !== targetTodo.dueDate ||
      formData.memo !== targetTodo.memo;

    if (isChanged) {
      updateTodo(targetTodo.id, formData);
    }
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!targetTodo) return;
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteTodo(targetTodo.id);
      handleClose();
    }
  };

  // Todo가 없으면(삭제됨 등) 렌더링 안 함 (단, 닫히는 애니메이션 고려 시 isOpen으로 제어)
  if (!isOpen && !targetTodo) return null;

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={handleClose} />
      <DrawerContainer $isOpen={isOpen}>
        {/* 헤더: 상태 선택 & 닫기 */}
        <Header>
          <select
            name="status"
            value={formData.status}
            onChange={(e) => {
              handleChange(e);
              // Select는 onBlur를 기다리지 않고 즉시 저장하는 UX가 더 자연스러움
              if (targetTodo) updateTodo(targetTodo.id, { status: e.target.value as TodoStatus });
            }}
            style={{ padding: '6px', fontWeight: 'bold' }}
          >
            <option value="IDEA">IDEA</option>
            <option value="PLAN">PLAN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="DONE">DONE</option>
          </select>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton onClick={handleDelete} style={{ color: '#DE350B' }}>
              <MdDeleteOutline size={18} />
            </ActionButton>
            <ActionButton onClick={handleClose}>
              <MdClose size={20} />
            </ActionButton>
          </div>
        </Header>

        {/* 본문: 제목, 기한, 메모 */}
        <Content>
          <TitleInput
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleSave}
            placeholder="할 일을 입력하세요"
            rows={1}
          />

          <FormGroup>
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              onBlur={handleSave}
            />
          </FormGroup>

          <FormGroup>
            <label>Description</label>
            <MemoTextarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              onBlur={handleSave}
              placeholder="메모를 입력하세요..."
            />
          </FormGroup>
        </Content>
      </DrawerContainer>
    </>
  );
};