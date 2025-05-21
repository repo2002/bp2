import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
export default function ChatLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chat",
        }}
      />
      <Stack.Screen
        name="info"
        options={{
          title: "Chat Info",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
