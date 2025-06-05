import NewChatModal from "@/components/chats/NewChatModal";
import { useAuth } from "@/contexts/AuthContext";
import { SearchProvider, useChatSearch } from "@/contexts/SearchContext";
import { useTheme } from "@/hooks/theme";
import { getChatById } from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, useColorScheme, View } from "react-native";

const ChatsLayout = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { setSearch } = useChatSearch();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentChat, setCurrentChat] = useState(null);
  const { user } = useAuth();

  const handleCreateChat = (data) => {
    // Close the modal
    setModalVisible(false);
    // Navigate to the new chat
    router.push(`/chats/${data.id}`);
  };

  // Fetch chat data when params change
  useEffect(() => {
    const fetchChatData = async () => {
      if (params?.id) {
        const { success, data } = await getChatById(params.id);
        if (success) {
          setCurrentChat(data);
        }
      }
    };

    fetchChatData();
  }, [params?.id]);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          contentStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerLargeTitleStyle: {
            color: theme.colors.text,
          },
          headerTitleStyle: {
            color: theme.colors.text,
          },
          headerBlurEffect:
            colorScheme === "dark"
              ? "systemUltraThinMaterialDark"
              : "systemUltraThinMaterialLight",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerLargeTitle: true,
            headerTitle: "Chats",
            headerSearchBarOptions: {
              placeholder: "Search chats",
              autoCapitalize: "none",
              autoCorrect: false,
              barTintColor: theme.colors.cardBackground,
              tintColor: theme.colors.text,
              onChangeText: (event) => setSearch(event.nativeEvent.text),
            },
            headerLeft: () => (
              <View
                style={{
                  backgroundColor: theme.colors.greyLight,
                  width: 22,
                  height: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 50,
                }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color={"black"}
                  onPress={() => {
                    // TODO: handle new chat creation
                  }}
                />
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[id]/chat-details"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <NewChatModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateChat}
      />
    </>
  );
};

export default function ChatsLayoutWithProvider() {
  return (
    <SearchProvider>
      <ChatsLayout />
    </SearchProvider>
  );
}
