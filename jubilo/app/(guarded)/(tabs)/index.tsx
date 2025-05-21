import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemeText>Home</ThemeText>
    </View>
  );
}
