import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

export default function PostNewScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemeText>Post New</ThemeText>
    </View>
  );
}
