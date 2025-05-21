import { useColorScheme as useNativeColorScheme } from 'react-native';
import { theme, Theme } from '../constants/theme';

export const useColorScheme = useNativeColorScheme;

export function useTheme(): Omit<Theme, 'colors'> & { 
  colors: Theme['colors']['light' | 'dark'];
  isDark: boolean;
} {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorMode = isDark ? 'dark' : 'light';

  return {
    ...theme,
    colors: theme.colors[colorMode],
    isDark,
  };
} 