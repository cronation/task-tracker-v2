import styled from 'styled-components';
import { useUIStore } from '../../store/useUIStore';
import { useTodoStore } from '../../store/useTodoStore';
import { MdUndo, MdRedo, MdViewList, MdViewKanban } from 'react-icons/md';

const HeaderContainer = styled.header`
  width: 100%;
  height: 60px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: ${({ theme }) => theme.colors.boardBg};
  /* border-radius: 2px; */
  position: relative;
  z-index: 2000;
  box-shadow: 0 2px 4px rgba(9, 30, 66, 0.25);
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

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: default;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ $active, theme }) => ($active ? theme.colors.brand : theme.colors.textPrimary)};
  }

  svg {
    font-size: 1.2rem;
  }
`;

export const Header = () => {
  const { viewMode, setViewMode, setSelectedTodoId } = useUIStore();

  const { undo, redo, past, future } = useTodoStore();

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const onViewModeChange = (mode: 'LIST' | 'KANBAN') => {
    setViewMode(mode);
    setSelectedTodoId(null);
  };

  return (
    <HeaderContainer>
      <Title>Task Tracker 2</Title>

      <ControlGroup>
        {/* 뷰 모드 전환 */}
        <IconButton
          onClick={() => onViewModeChange('KANBAN')}
          $active={viewMode === 'KANBAN'}
          title="Kanban View"
        >
          <MdViewKanban />
        </IconButton>
        <IconButton
          onClick={() => onViewModeChange('LIST')}
          $active={viewMode === 'LIST'}
          title="List View"
        >
          <MdViewList />
        </IconButton>

        <div style={{ width: '1px', height: '24px', background: '#dfe1e6', margin: '0 8px' }} />

        {/* Undo / Redo */}
        <IconButton onClick={() => undo()} disabled={!canUndo} title="Undo">
          <MdUndo />
        </IconButton>
        <IconButton onClick={() => redo()} disabled={!canRedo} title="Redo">
          <MdRedo />
        </IconButton>
      </ControlGroup>
    </HeaderContainer>
  );
};