import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";

export default function GuardedLayout() {
  const theme = useTheme();
  const { isSignedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
