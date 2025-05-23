import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "@/components/ThemeText";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function ChatLayout() {
  const theme = useTheme();
  const { id, name } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

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
          headerSearchBarOptions: {
            placeholder: "Search chats",
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
          presentation: "modal",
          headerSearchBarOptions: {
            placeholder: "Search users",
            onChangeText: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
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
            onChangeText: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
          },
          presentation: "modal",
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
