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
        <Stack.Screen name="search/index" />
        <Stack.Screen name="chats/[id]" />
        <Stack.Screen name="chats/[id]/chat-details" />
        <Stack.Screen name="events/[id]" />
        {/* <Stack.Screen name="events/create" /> */}
        <Stack.Screen name="events/going" />
        <Stack.Screen name="events/invitations" />
        <Stack.Screen name="events/own" />
        <Stack.Screen name="events/upcoming" />
        <Stack.Screen name="events/past" />
        <Stack.Screen name="carpools/[id]" />
        <Stack.Screen name="carpools/create" />
        <Stack.Screen name="carpools/add-car" />
        {/* <Stack.Screen name="cars/[id]/index" /> */}
        <Stack.Screen name="cars/[id]/edit" />
      </Stack>
      <CommentBottomSheet />
      <ShareBottomSheet />
    </BottomSheetProvider>
  );
}
