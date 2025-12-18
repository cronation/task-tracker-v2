import styled from 'styled-components';
import { MdDeleteOutline, MdNotes, MdCalendarToday } from 'react-icons/md';
import type { Todo } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';

const CardContainer = styled.div`
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
  padding: 10px;
  margin-bottom: 8px;
  transition: background 0.1s;

  &:hover {
    background: #f4f5f7;
  }
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #172b4d;
  margin-bottom: 8px;
  word-break: break-word;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #5e6c84;
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteBtn = styled.button`
  opacity: 0;
  color: ${({ theme }) => theme.colors.danger};
  
  ${CardContainer}:hover & {
    opacity: 1;
  }
`;

interface Props {
  todo: Todo;
}

export const KanbanCard = ({ todo }: Props) => {
  const { deleteTodo } = useTodoStore();
  const { setExpandedTodoId } = useUIStore();

  return (
    <CardContainer onClick={() => setExpandedTodoId(todo.id)}>
      <CardTitle>{todo.title || '(제목 없음)'}</CardTitle>
      
      <CardFooter>
        <IconGroup>
          {/* 기한이 있으면 표시 */}
          {todo.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MdCalendarToday size={12} />
              <span>{todo.dueDate}</span>
            </div>
          )}
          {/* 메모가 있으면 아이콘 표시 */}
          {todo.memo && <MdNotes size={14} />}
        </IconGroup>

        <DeleteBtn 
          onClick={(e) => {
            e.stopPropagation(); // 👈 삭제 버튼 누를 땐 드로어 안 열리게 전파 중단
            deleteTodo(todo.id);
          }}
        >
          <MdDeleteOutline size={16} />
        </DeleteBtn>
      </CardFooter>
    </CardContainer>
  );
};