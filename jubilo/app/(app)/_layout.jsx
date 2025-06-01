import CommentBottomSheet from "@/components/CommentBottomSheet";
import ShareBottomSheet from "@/components/ShareBottomSheet";
import { BottomSheetProvider } from "@/contexts/BottomSheetContext";
import { useTheme } from "@/hooks/theme";
import { Stack } from "expo-router";

export default function AppLayout() {
  const theme = useTheme();

  return (
    <BottomSheetProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="post/index" />
        <Stack.Screen name="profile/index" />
      </Stack>
      <CommentBottomSheet />
      <ShareBottomSheet />
    </BottomSheetProvider>
  );
}
