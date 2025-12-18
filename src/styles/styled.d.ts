import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      bg: string;
      boardBg: string;
      textPrimary: string;
      textSecondary: string;
      border: string;
      brand: string;
      danger: string;
      status: {
        IDEA: string;
        PLAN: string;
        IN_PROGRESS: string;
        REVIEW: string;
        DONE: string;
      };
    };
  }
}