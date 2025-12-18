import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { useUIStore } from './store/useUIStore';
import { Header } from './components/layout/Header'; // 분리한 헤더
import { KanbanView } from './components/kanban/KanbanView';   // 새로 만든 보드
import { ListView } from './components/list/ListView';

const MainLayout = styled.main`
  width: 100vw;
  margin: 0 auto;
  padding: 0 20px;
`;

function App() {
  const { viewMode } = useUIStore();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />

      <MainLayout>
        <Header />
        {viewMode === 'KANBAN' ? (
          <KanbanView />
        ) : (
          <ListView />
        )}
      </MainLayout>

    </ThemeProvider>
  );
}

export default App;