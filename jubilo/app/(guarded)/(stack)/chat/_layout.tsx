import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ChatLayout() {
  const theme = useTheme();
  const { id, name } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const chats = useQuery(api.chats.getUserChats);

  const handleSearch = useCallback(
    (event: { nativeEvent: { text: string } }) => {
      const query = event.nativeEvent.text;
      setSearchQuery(query);
      // Update URL params to trigger re-render in child components
      router.setParams({ searchQuery: query });
    },
    []
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
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
        name="index"
        options={{
          title: "Chats",
          headerSearchBarOptions: {
            placeholder: "Search chats",
            onChangeText: handleSearch,
          },
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 0,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemeText style={{ fontSize: 26, fontWeight: "bold" }}>
                Chats
              </ThemeText>
              <TouchableOpacity onPress={() => router.push("/chat/new")}>
                <Ionicons
                  name="add-circle"
                  size={26}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: name as string,
        }}
      />
      <Stack.Screen
        name="info"
        options={{
          title: "Chat Info",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "New Chat",
          headerSearchBarOptions: {
            placeholder: "Search users",
            onChangeText: handleSearch,
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="newGroup"
        options={{
          title: "New Group",
          headerSearchBarOptions: {
            placeholder: "Search users",
            onChangeText: handleSearch,
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
