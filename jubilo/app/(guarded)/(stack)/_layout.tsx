import { router, Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { TouchableOpacity, View } from "react-native";
import ThemeText from "@/components/ThemeText";
import { Ionicons } from "@expo/vector-icons";

export default function StackLayout() {
  const theme = useTheme();

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
        name="profile"
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="chat"
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
    </Stack>
  );
}
