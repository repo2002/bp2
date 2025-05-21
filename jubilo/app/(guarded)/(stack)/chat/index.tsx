import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { FlatList, SafeAreaView, View } from "react-native";
import Loading from "@/components/Loader";
import { allChats } from "@/dummyData";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ChatItem } from "@/components/ChatItem";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatList() {
  const theme = useTheme();
  const { userId } = useAuth();

  // TODO: Replace with actual Convex query when ready
  // const chats = useQuery(api.chats.list);
  const isLoading = false;
  const chats = allChats;

  if (!userId) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item }) => (
            <ChatItem chat={item} currentUserId={userId as Id<"users">} />
          )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={() => (
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
          )}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        />
      )}
    </SafeAreaView>
  );
}
