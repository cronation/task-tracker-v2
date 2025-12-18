import styled from 'styled-components';
import type { TodoStatus } from '../../types/todo';
import { Column } from './Column';
import { DetailDrawer } from './DetailDrawer';

const KanbanContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  height: calc(100vh - 120px); /* 헤더 + 여백 고려 */
  padding-bottom: 10px;
  align-items: flex-start; /* 컬럼 높이를 내용에 맞춤 (Stretch하려면 제거) */
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

export const KanbanView = () => {
  const statuses: TodoStatus[] = ['IDEA', 'PLAN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  return (
    <KanbanContainer>
      <DetailDrawer />
      {statuses.map((status) => (
        <Column key={status} status={status} />
      ))}
    </KanbanContainer>
  );
};