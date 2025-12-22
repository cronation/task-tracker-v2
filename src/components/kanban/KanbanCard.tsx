import { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { MdNotes, MdCalendarToday, MdKeyboardDoubleArrowRight, MdMoreHoriz } from 'react-icons/md';
// import { MdDeleteOutline, MdNotes, MdCalendarToday, MdNavigateNext, MdMoreHoriz } from 'react-icons/md';
import type { Todo, TodoStatus } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';
import { useUIStore } from '../../store/useUIStore';
import { colors } from '../../utils/colors';

const newAnim = keyframes`
  0% { transform: scale(0); }
  80% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const updatedAnim = keyframes`
  0% { transform: translateY(0); }
  20% { transform: translateY(-8px); }
  40% { transform: translateY(6px); }
  60% { transform: translateY(-4px); }
  80% { transform: translateY(2px); }
  100% { transform: translateY(0); }
`;

const CardContainer = styled.div<{ $animType: 'new' | 'updated' | 'none' }>`
  width: 100%;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
  padding: 10px 10px 10px 14px; /* Left padding for color strip */
  margin-bottom: 8px;
  position: relative;
  transition: background 0.1s;
  overflow: visible; /* Allow menu to overflow? No, usually popups need handling. Or relative container. */

  &:hover {
    background: #f4f5f7;
  }

  ${({ $animType }) =>
    $animType === 'new' &&
    css`
      animation: ${newAnim} 0.2s ease-out;
    `}

  ${({ $animType }) =>
    $animType === 'updated' &&
    css`
      animation: ${updatedAnim} 0.3s ease-in-out;
    `}
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
  height: 24px;
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionGroup = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 2; /* Ensure it stays on top */
`;

// const IconButton = styled.button`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 24px;
//   height: 24px;
//   padding: 0;

//   &:hover {
//     background-color: rgba(9, 30, 66, 0.08);
//     opacity: 1;
//     color: #172b4d;
//   }
// `;

// const DeleteBtn = styled(IconButton)`
//   color: #5e6c84;
//   &:hover {
//     color: ${({ theme }) => theme.colors.danger};
//   }
// `;

const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  margin-right: 4px;
`;

const StepperNextBtn = styled.button`
  width: 32px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #dfe1e6;
  // Legacy MoveButton had radius on right.
  border-radius: 0;
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
  cursor: pointer;
  color: #5e6c84;
  padding: 0;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f4f5f7;
    color: #172b4d;
  }
  
  & > svg {
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) > svg {
    transform: translateX(3px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: default;
    &:hover {
      transform: none;
      background: #fff;
    }
  }
`;

const StepperToggleBtn = styled.button`
  width: 20px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #dfe1e6;
  border-right: none;
  border-radius: 0;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
  cursor: pointer;
  color: #5e6c84;
  padding: 0;
  padding-left: 2px;
  
  &:hover {
    background: #f4f5f7;
    color: #172b4d;
  }
`;

const StepperDrawer = styled.div<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? '75px' : '0')};
  height: 30px;
  overflow: hidden;
  display: flex;
  align-items: center;
  background: #ebecf0;
  transition: width 0.2s ease-in-out;
  border-top: 1px solid #dfe1e6;
  border-bottom: 1px solid #dfe1e6;
`;

const DrawerStageBtn = styled.button<{ $current?: boolean }>`
  width: 15px;
  height: 100%; // 22px inside borders?
  flex-shrink: 0;
  font-size: 8px; // Tiny like legacy
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-left: 1px solid #dfe1e6;
  background: ${({ $current }) => ($current ? '#b3d4ff' : '#fff')};
  color: ${({ $current }) => ($current ? '#0052cc' : '#172b4d')};
  padding: 0;
  cursor: pointer;

  &:hover {
    background: #deebff;
  }
  &:disabled {
    cursor: default;
  }
  &:last-child {
    border-right: none;
  }
`;

interface Props {
  todo: Todo;
}

const statusOrder: TodoStatus[] = ['IDEA', 'PLAN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const STATUS_LABELS: Record<TodoStatus, string> = {
  IDEA: '구상',
  PLAN: '계획',
  IN_PROGRESS: '진행',
  REVIEW: '검수',
  DONE: '완료',
};

export const KanbanCard = ({ todo }: Props) => {
  const { moveTodo } = useTodoStore();
  // const { deleteTodo, moveTodo } = useTodoStore();
  const { setSelectedTodoId } = useUIStore();
  const [animType, setAnimType] = useState<'new' | 'updated' | 'none'>('none');
  const prevUpdatedRef = useRef(todo.updatedAt);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation Logic
  useEffect(() => {
    const now = Date.now();
    // New Task Check
    if (now - todo.createdAt < 1000) {
      setAnimType('new');
      containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
      const timer = setTimeout(() => setAnimType('none'), 500);
      return () => clearTimeout(timer);
    }
    // Moved (Remounted) Check: If recently updated but not new, trigger update anim
    else if (now - todo.updatedAt < 1000) {
      setAnimType('updated');
      containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      const timer = setTimeout(() => setAnimType('none'), 400);
      return () => clearTimeout(timer);
    }
  }, []); // Only check on mount

  useEffect(() => {
    // Updated Logic
    if (prevUpdatedRef.current !== todo.updatedAt) {
      // Don't trigger updated anim if it was just created (prevent double anim)
      if (Date.now() - todo.createdAt > 1000) {
        setAnimType('updated');
        containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        const timer = setTimeout(() => setAnimType('none'), 400);
        prevUpdatedRef.current = todo.updatedAt;
        return () => clearTimeout(timer);
      }
      prevUpdatedRef.current = todo.updatedAt;
    }
  }, [todo.updatedAt]);

  // Click Outside Logic
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMoveMenuOpen(false);
      }
    };
    if (isMoveMenuOpen) document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [isMoveMenuOpen]);

  // Stepper Logic
  const currentIndex = statusOrder.indexOf(todo.status);
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStatus) moveTodo(todo.id, nextStatus);
  };

  const handleMoveTo = (target: TodoStatus) => {
    moveTodo(todo.id, target);
    setIsMoveMenuOpen(false);
  };

  return (
    <CardContainer
      ref={containerRef}
      onClick={() => setSelectedTodoId(todo.id)}
      $animType={animType}
    >
      <ColorStrip $color={colors[todo.colorIdx] || colors[0]} />

      <CardTitle>{todo.title || '(제목 없음)'}</CardTitle>

      <CardFooter>
        <IconGroup>
          {todo.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MdCalendarToday size={12} />
              <span>{todo.dueDate}</span>
            </div>
          )}
          {todo.memo && <MdNotes size={14} />}
        </IconGroup>

        <ActionGroup>
          {/* <DeleteBtn
            onClick={(e) => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            <MdDeleteOutline size={16} />
          </DeleteBtn> */}

          {/* Stepper Controls */}
          <div style={{ position: 'relative' }}>
            <StepperContainer ref={menuRef}>
              <StepperToggleBtn
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMoveMenuOpen(!isMoveMenuOpen);
                }}
                title="Move to..."
              >
                <MdMoreHoriz size={14} />
              </StepperToggleBtn>

              <StepperDrawer $isOpen={isMoveMenuOpen}>
                {statusOrder.map((s) => (
                  <DrawerStageBtn
                    key={s}
                    $current={s === todo.status}
                    disabled={s === todo.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveTo(s);
                    }}
                    title={s}
                  >
                    {/* Using first letter for tiny drawer buttons */}
                    {/* {s.charAt(0)} */}
                    {STATUS_LABELS[s]}
                  </DrawerStageBtn>
                ))}
              </StepperDrawer>

              <StepperNextBtn
                onClick={handleNext}
                disabled={!nextStatus}
                title={nextStatus ? `Move to ${nextStatus}` : 'Done'}
              >
                <MdKeyboardDoubleArrowRight size={18} />
              </StepperNextBtn>
            </StepperContainer>
          </div>
        </ActionGroup>
      </CardFooter>
    </CardContainer>
  );
};
