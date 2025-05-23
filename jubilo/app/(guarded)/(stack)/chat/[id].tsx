import { View, Text, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";

export default function Chat() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemeText>Chat </ThemeText>
    </SafeAreaView>
  );
}
