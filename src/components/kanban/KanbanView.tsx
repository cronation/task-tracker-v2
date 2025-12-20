import styled from 'styled-components';
import type { TodoStatus } from '../../types/todo';
import { Column } from './Column';
import { DetailDrawer } from './DetailDrawer';

const KanbanContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 100%;
  gap: 10px;

  /* display: flex;
  gap: 12px;
  overflow-x: auto; */
  height: calc(100vh - 80px); /* 헤더 + 여백 고려 */
  padding: 0 10px 10px 10px;
  /* align-items: flex-start;*/
  
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