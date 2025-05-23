import React from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChatItem } from "@/components/ChatItem";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Loading from "@/components/Loader";

export default function ChatList() {
  const theme = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const { searchQuery } = useLocalSearchParams();

  // Get all chats for the current user
  const chats = useQuery(api.chats.getUserChats);
  const isLoading = chats === undefined;

  if (!userId) return null;

  const EmptyState = () => (
    <View
      style={{
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <MaterialCommunityIcons
        name="message-text-outline"
        size={66}
        color={theme.colors.grey}
      />
      <ThemeText style={{ fontSize: 18, fontWeight: "600" }}>
        No chats yet
      </ThemeText>
      <ThemeText
        style={{
          textAlign: "center",
          color: theme.colors.grey,
          fontSize: 14,
        }}
      >
        Start a new chat with your friends, you can also create groups!
      </ThemeText>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={chats?.filter(
            (chat) =>
              chat.name
                .toLowerCase()
                .includes((searchQuery as string)?.toLowerCase() || "") ||
              chat.groupName
                ?.toLowerCase()
                .includes((searchQuery as string)?.toLowerCase() || "")
          )}
          renderItem={({ item }) => (
            <ChatItem chat={item} currentUserId={userId as Id<"users">} />
          )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        />
      )}
    </SafeAreaView>
  );
}
