import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      bg: string;
      boardBg: string;
      textPrimary: string;
      textSecondary: string;
      textDisabled: string;
      border: string;
      brand: string;
      danger: string;
    };
  }
}