import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* 1. Reset (Simple Version) */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 2. Base Styles */
  body {
    font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    background-color: ${({ theme }) => theme.colors.bg}; /* 테마 배경색 적용 (#F4F5F7) */
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* 3. Common Elements */
  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    padding: 8px;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.brand}; /* Focus 시 Primary Color */
    }
  }

  ul, li {
    list-style: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;