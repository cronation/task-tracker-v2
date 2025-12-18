import styled from 'styled-components';
import { useUIStore } from '../../store/useUIStore';
import { useTodoStore } from '../../store/useTodoStore';
import { MdUndo, MdRedo, MdViewList, MdViewKanban } from 'react-icons/md';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: ${({ theme }) => theme.colors.boardBg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) => ($active ? theme.colors.bg : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.brand : theme.colors.textSecondary)};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  svg {
    font-size: 1.2rem;
  }
`;

export const Header = () => {
  const { viewMode, setViewMode } = useUIStore();
  
  // temporal.getState()를 사용하여 액션만 가져옵니다.
  const { undo, redo, pastStates, futureStates } = useTodoStore.temporal.getState();

  return (
    <HeaderContainer>
      <Title>Task Tracker 2</Title>
      
      <ControlGroup>
        {/* 뷰 모드 전환 */}
        <IconButton 
          onClick={() => setViewMode('KANBAN')} 
          $active={viewMode === 'KANBAN'}
          title="Kanban View"
        >
          <MdViewKanban />
        </IconButton>
        <IconButton 
          onClick={() => setViewMode('LIST')} 
          $active={viewMode === 'LIST'}
          title="List View"
        >
          <MdViewList />
        </IconButton>

        <div style={{ width: '1px', height: '24px', background: '#dfe1e6', margin: '0 8px' }} />

        {/* Undo / Redo */}
        <IconButton onClick={() => undo()} title="Undo">
        {/* <IconButton onClick={() => undo()} disabled={pastStates.length <= 1} title="Undo"> */}
          {pastStates.length}
          <MdUndo />
        </IconButton>
        <IconButton onClick={() => redo()} title="Redo">
        {/* <IconButton onClick={() => redo()} disabled={futureStates.length === 0} title="Redo"> */}
          <MdRedo />
        </IconButton>
      </ControlGroup>
    </HeaderContainer>
  );
};