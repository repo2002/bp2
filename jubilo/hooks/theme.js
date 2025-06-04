import { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";
import { theme } from "../constants/theme";

export const useColorScheme = useNativeColorScheme;

const ThemeContext = createContext();

export function ThemeProvider({ children, initialMode }) {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState(
    initialMode || systemColorScheme || "light"
  );

  const toggleTheme = () =>
    setColorMode((prev) => (prev === "dark" ? "light" : "dark"));

  const isDark = colorMode === "dark";
  const value = useMemo(
    () => ({
      ...theme,
      colors: theme.colors[colorMode],
      isDark,
      colorMode,
      setColorMode,
      toggleTheme,
    }),
    [colorMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context) return context;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colorMode = isDark ? "dark" : "light";
  return {
    ...theme,
    colors: theme.colors[colorMode],
    isDark,
    colorMode,
    setColorMode: () => {},
    toggleTheme: () => {},
  };
}
