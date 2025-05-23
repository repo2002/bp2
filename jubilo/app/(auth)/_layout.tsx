import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { theme } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export default function GuestLayout() {
  const theme = useTheme();
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return <Redirect href="/(guarded)/(tabs)" />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
