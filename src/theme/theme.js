import { MD3LightTheme } from 'react-native-paper';

export const AppTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#800000',
    background: '#F9FAFB',
    surface: '#FFFFFF',
  },
  spacing: {
    s: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h4: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 28,
    },
    h5: {
      fontSize: 12,
      fontWeight: '200',
      lineHeight: 28,
    },
    body: {
      fontSize: 12,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
};
