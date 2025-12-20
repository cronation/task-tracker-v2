import styled from 'styled-components';
import { StatusAccordion } from './StatusAccordion';
import type { TodoStatus } from '../../types/todo';

const ListContainer = styled.div`
  width: 100%;
  height: calc(100vh - 80px);
  overflow-y: scroll;
  /* margin: 0 auto; */
  /* padding-bottom: 40px; */
`;

export const ListView = () => {
  const statuses: TodoStatus[] = ['IDEA', 'PLAN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  return (
    <ListContainer>
      {statuses.map((status) => (
        <StatusAccordion key={status} status={status} />
      ))}
    </ListContainer>
  );
};