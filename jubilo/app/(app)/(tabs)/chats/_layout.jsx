import NewChatModal from "@/components/chats/NewChatModal";
import { SearchProvider, useChatSearch } from "@/contexts/SearchContext";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, useColorScheme, View } from "react-native";
import { chatRooms } from "./dummyData";

const ChatsLayout = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { setSearch } = useChatSearch();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateChat = (data) => {
    // Add to dummy data or state, then navigate
    console.log("Create chat/group:", data);
  };

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
          options={({ route }) => {
            const roomId = route.params?.id;
            const room = chatRooms.find((r) => r.id === roomId);
            return {
              headerShown: true,
              headerTitle: room ? room.name : "Chat",
              headerLargeTitle: false,
              headerBackButtonDisplayMode: "minimal",
            };
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
