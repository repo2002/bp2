import { useColorScheme as useNativeColorScheme } from 'react-native';
import { theme } from '../constants/theme';

export const useColorScheme = useNativeColorScheme;

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorMode = isDark ? 'dark' : 'light';

  return {
    ...theme,
    colors: theme.colors[colorMode],
    isDark,
  };
} 